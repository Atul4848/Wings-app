import React, { FC, useEffect, useRef, ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  useGridFilters,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode, ValueGetterParams } from 'ag-grid-community';
import {
  StatusBaseModel,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VendorLocationModel,
  Airports,
  
  SETTING_ID,
  useVMSModuleSecurity,
} from '../Shared';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  UIStore,
  Utilities,
  regex,
  SearchStore,
  SelectOption,
  GRID_ACTIONS,
  ViewPermission,
  cellStyle,
  IClasses,
} from '@wings-shared/core';
import { BaseStore, SettingsStore, VendorLocationStore } from '../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './VendorLocationGrid.styles';
import { gridFilters } from './fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { forkJoin } from 'rxjs';
import { IAPIVMSVendorLocationComparison } from '../Shared/Interfaces';
import { ConfirmDialog, CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { sidebarMenus } from '../Shared/Components/SidebarMenu/SidebarMenu';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { OperationInfoSettingOptionModel } from '../Shared/Models/OperationInfoSettingOptionModel.model';
import { Chip, Tooltip } from '@material-ui/core';
import { AuthStore } from '@wings-shared/security';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import ChangeLocationDialog from './Components/ChangeLocationDialog/ChangeLocationDialog';

interface Props {
  vendorLocationStore?: VendorLocationStore;
  settingsStore?: SettingsStore;
}

const VendorLocationGrid: FC<Props> = observer(({ vendorLocationStore, settingsStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_COMPARISON_FILTERS, VendorLocationModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<VENDOR_LOCATION_COMPARISON_FILTERS>(gridFilters, gridState);
  const isStatusFilter = Utilities.isEqual(
    searchHeaderRef.current?.getSelectedOption('defaultOption'),
    VENDOR_LOCATION_COMPARISON_FILTERS.LOCATION_STATUS
  );

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    SidebarStore.setNavLinks(sidebarMenus, 'vendor-management');
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const setSearchData = (): void => {
    const propertyValue = getSearchValue();
    if (propertyValue) {
      const searchHeaderFilter = searchHeaderRef.current.getFilters();
      SearchStore.searchData.set(location.pathname, {
        searchValue: searchHeaderFilter.searchValue,
        selectInputsValues: searchHeaderFilter.selectInputsValues,
        chipValue: searchHeaderFilter.chipValue,
        pagination: gridState.pagination,
      });
    }
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendorLocation(rowIndex);
  };

  const deleteRowData = (rowIndex: number) => {
    confirmRemove(rowIndex);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={vmsModuleSecurityV2.isEditable}>
        <>
          <CustomLinkButton variant="contained" startIcon={'+'} to="upsert/new" title="Add Vendor Location" />
          <PrimaryButton
            variant="contained"
            color="primary"
            className={classes.dangerButton}
            onClick={handleChangeLocationClick}
          >
            Change Location Ranking
          </PrimaryButton>
        </>
      </ViewPermission>
    );
  };

  const searchCollection = (): IAPIGridRequest | null => {
    const propertyValue = getSearchValue();
    if (propertyValue === '') {
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, searchHeaderRef.current.selectedOption)
    );
    const filters = property?.apiPropertyName?.includes('AirportCode')
      ? [
        { propertyName: 'AirportReference.ICAOCode', propertyValue: propertyValue },
        { propertyName: 'AirportReference.UWACode', propertyValue: propertyValue, operator: 'or' },
        { propertyName: 'AirportReference.FAACode', propertyValue: propertyValue, operator: 'or' },
        { propertyName: 'AirportReference.IATACode', propertyValue: propertyValue, operator: 'or' },
        {
          propertyName: 'AirportReference.RegionalCode',
          propertyValue: propertyValue,
          operator: 'or',
        },
        { propertyName: 'AirportReference.DisplayCode', propertyValue: propertyValue, operator: 'or' },
      ]
      : [
        {
          propertyName: property?.apiPropertyName,
          propertyValue: propertyValue,
          operator: 'string',
          filterType: 'string',
        },
      ];
    return {
      searchCollection: JSON.stringify(filters),
    };
  };

  useEffect(() => {
    settingsStore?.getSettings(SETTING_ID.LOCATION_STATUS, 'LocationStatus').subscribe();
    vendorLocationStore?.getVmsIcaoCode().subscribe();
  }, []);

  const getSearchValue = (): string => {
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader?.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }
    const propertyValue = chip?.length > 0 ? chip[0]?.label : searchHeader.searchValue ? searchHeader.searchValue : '';
    return propertyValue;
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([ vendorLocationStore.getVMSComparison(request) ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: [IAPIPageResponse<IAPIVMSVendorLocationComparison>, StatusBaseModel[]]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = VendorLocationModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const upsertVendorLocation = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    const request = new VendorLocationModel({ ...model });
    const airportModel = request.airportReference as Airports;
    request.airportReference = airportModel;
    request.airportReferenceId = airportModel.id != 0 ? airportModel.id : 0;
    request.vendorLocationStatusId = request.vendorLocationStatus.id;
    request.vendorId = request.vendor.id;
    request.code = request.code || null;

    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertVendorLocation(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorLocationModel) => {
          response.vendorLocationStatus = new StatusBaseModel(response.vendorLocationStatus);
          response.airportReference = Airports.deserializeAirportReference(response.airportReference);
          agGrid._updateTableItem(rowIndex, response);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, request.id);
        },
      });
  };

  const handleModalClose = () => {
    vendorLocationStore.vendorLocationRankingList = [];
    vendorLocationStore.setAirportId(null);
    vendorLocationStore?.setIsEditRank(false);
    ModalStore.close();
  }

  const handleChangeLocationClick = () => {
    ModalStore.open(<ChangeLocationDialog onClose={handleModalClose} />);
  };

  const confirmRemove = (rowIndex: number): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this record?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          deleteVendorLocation(rowIndex);
          ModalStore.close();
        }}
      />
    );
  };

  const deleteVendorLocation = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    const request = new VendorLocationModel({ ...model });
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    vendorLocationStore
      ?.deleteVendorLocation(request.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ request ]);
          loadInitialData();
        },
        error: error => {
          BaseStore.showAlert(error.message, request.id);
          loadInitialData();
        },
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Vendor',
      field: 'vendor.name',
      editable: false,
      headerTooltip: 'Vendor',
    },
    {
      headerName: 'Vendor Code',
      field: 'vendor.code',
      editable: false,
      headerTooltip: 'Vendor Code',
    },
    {
      headerName: 'Location Name',
      field: 'name',
      headerTooltip: 'Location Name',
      cellEditorParams: {
        placeHolder: 'name',
        ignoreNumber: true,
        rules: 'required|string|between:3,200',
      },
    },
    {
      headerName: 'Location Code',
      field: 'code',
      headerTooltip: 'Location Code',
      cellEditorParams: {
        placeHolder: 'code',
        ignoreNumber: true,
        rules: `string|between:2,3|regex:${regex.alphaNumericWithoutSpaces}`,
      },
    },
    {
      headerName: 'Airport',
      field: 'airportReference',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'airportName'),
      headerTooltip: 'Airport',
      cellEditorParams: {
        getAutoCompleteOptions: () => vendorLocationStore?.airportList,
        onSearch: (value: string) => vendorLocationStore?.searchAirport(value),
        valueGetter: (option: SelectOption) => option?.value,
        placeHolder: 'airportCode',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'City',
      field: 'vendorLocationCityReference.cityReference.name',
      headerTooltip: 'City',
    },
    {
      headerName: 'Status',
      field: 'vendorLocationStatus',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Status',
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.vendorLocationSettings,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'locationStatus',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Operation Type',
      field: 'operationalEssential.appliedOperationType',
      filterValueGetter: ({ data }: ValueGetterParams) => data.operationType,
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.operationalEssential?.appliedOperationType, null, true),
      },
      headerTooltip: 'Operation Type',
    },
    {
      headerName: 'Vendor Level',
      field: 'operationalEssential.vendorLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Vendor Level',
    },
    {
      headerName: 'Rank At Airport',
      field: 'airportRank',
      headerTooltip: 'Rank At Airport',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
      },
    },
  ];

  function viewRenderer(
    operationTypeChips: OperationInfoSettingOptionModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode {
    if (operationTypeChips) {
      const numTags = operationTypeChips.length;
      const limitTags = 1;
      const chipsList = isReadMode ? operationTypeChips : [ ...operationTypeChips ].slice(0, limitTags);
      return (
        <div>
          {Utilities.customArraySort(chipsList, 'label').map(
            (appliedOperationType: OperationInfoSettingOptionModel, index) => (
              <Tooltip title={appliedOperationType ? appliedOperationType.operationType?.name : ''} key={index}>
                <Chip
                  color="primary"
                  key={appliedOperationType.operationType?.id}
                  label={appliedOperationType ? appliedOperationType.operationType?.name : ''}
                  {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
                />
              </Tooltip>
            )
          )}
          {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
        </div>
      );
    } else return <></>;
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: false,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            isHidden: !vmsModuleSecurityV2.isEditable,
            to: node => {
              return `upsert/${node.data.vendor.id}/${node.data.id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`
            },
          },
          {
            title: 'Details',
            action: GRID_ACTIONS.DETAILS,
            to: node => `upsert/${node.data.vendor.id}/${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
          },
          {
            title: 'Delete',
            action: GRID_ACTIONS.DELETE,
            isHidden: !AuthStore.user.isAdminUser,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (action === GRID_ACTIONS.EDIT || action === GRID_ACTIONS.DETAILS) {
            setSearchData();
          }
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const data = agGrid._getTableItem(rowIndex);
              agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              agGrid.cancelEditing(rowIndex);
              agGrid.filtersApi.resetColumnFilters();
              break;
            case GRID_ACTIONS.DELETE:
              deleteRowData(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  return (
    <>
      <SearchHeaderV2
        placeHolder="Start typing to search"
        ref={searchHeaderRef}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            VENDOR_LOCATION_COMPARISON_FILTERS,
            VENDOR_LOCATION_COMPARISON_FILTERS.VENDOR_NAME,
            'defaultOption'
          ),
        ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onFilterChange={isInitEvent => {
          loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
          agGrid.cancelEditing(0);
        }}
        isChipInputControl={isStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? settingsStore?.vendorLocationSettings : [],
          allowOnlySingleSelect: true,
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
        disablePagination={gridState.isRowEditing || gridState.isProcessing}
      />
    </>
  );
});
export default inject('vendorLocationStore', 'settingsStore')(VendorLocationGrid);
