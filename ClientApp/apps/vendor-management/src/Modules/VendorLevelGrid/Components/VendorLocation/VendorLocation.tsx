import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  SelectOption,
  UIStore,
  Utilities,
  cellStyle,
  regex,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, useEffect, useState } from 'react';
import { BaseStore, SettingsStore, VendorLocationStore, VendorManagementStore } from '../../../../Stores';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { useStyles } from '../UpsertVendor.styles';
import { VIEW_MODE } from '@wings/shared';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  SETTING_ID,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import { gridFilters } from '../../../VendorLocationGrid/fields';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { IAPIVMSVendorLocationComparison } from '../../../Shared/Interfaces';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';

interface Props {
  // classes: IClasses;
  settingsStore?: SettingsStore;
  vendorLocationStore?: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  navigate: NavigateFunction;
  params?: { vendorId: number; vendorName: string; vendorCode: string };
  viewMode: VIEW_MODE;
  vendorData: VendorManagmentModel;
}

const VendorLocation: FC<Props> = ({
  // classes,
  settingsStore,
  vendorLocationStore,
  viewMode,
  vendorManagementStore,
  vendorData,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_COMPARISON_FILTERS, VendorLocationModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const [ selectedVendor, setSelectedVendor ] = useState(VendorManagmentModel.deserialize(vendorData));
  const [ isAirportDataLoading, setisAirportDataLoading ] = useState(false);

  const classes = useStyles();
  const navigate = useNavigate();
  useEffect(() => {
    loadLocationData();
    loadVendorData();
  }, []);

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
        onSearch: (value: string) => searchAirport(value),
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
    },
  ];

  const addLocationRow = (): void => {
    navigate(`/vendor-management/vendor-location/${params.vendorCode}/${params.vendorId}/new`);
  };

  const loadLocationData = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);

    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: params.vendorId,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([
      vendorLocationStore.getVMSComparison(request),
      settingsStore?.getSettings(SETTING_ID.LOCATION_STATUS, 'LocationStatus'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIVMSVendorLocationComparison>, StatusBaseModel[]]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        gridState.setGridData(response[0]?.results);
        const allowSelectAll = response[0]?.totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadVendorData = () => {
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.getVendorById(parseInt(params.vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorManagmentModel) => {
        setSelectedVendor(response);
      });
  };

  const onInputChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendorLocation(rowIndex);
  };

  const removeUnsavedRow = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
  };

  const searchAirport = (searchKey?: string): void => {
    if (!isAirportDataLoading) {
      setisAirportDataLoading(true);
      if (searchKey) {
        const pageRequest: IAPIGridRequest = {
          searchCollection: JSON.stringify([
            { propertyName: 'Name', propertyValue: searchKey },
            { propertyName: 'ICAOCode.Code', propertyValue: searchKey, operator: 'or' },
            { propertyName: 'UWACode', propertyValue: searchKey, operator: 'or' },
            { propertyName: 'FAACode', propertyValue: searchKey, operator: 'or' },
            { propertyName: 'IATACode', propertyValue: searchKey, operator: 'or' },
            { propertyName: 'RegionalCode', propertyValue: searchKey, operator: 'or' },
            { propertyName: 'DisplayCode', propertyValue: searchKey, operator: 'or' },
          ]),
        };
        vendorLocationStore
          .getVmsIcaoCode(pageRequest)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => {
              setisAirportDataLoading(false);
            })
          )
          .subscribe();
      } else {
        vendorLocationStore
          .getVmsIcaoCode()
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => {
              setisAirportDataLoading(false);
            })
          )
          .subscribe();
      }
    }
  };

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
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.EDIT,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (rowIndex === null) {
            return;
          }
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const model: VendorLocationModel = agGrid._getTableItem(rowIndex);
              navigate(`/vendor-management/vendor-location/${params.vendorCode}/${params.vendorId}/${model.id}/edit`);
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressClickEdit: true,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadLocationData({ pageNumber: 1 }),
      onCellClicked: params => {
        if (params.column.getColId() === 'airportReference') {
          searchAirport();
        }
      },
    };
  };

  const upsertVendorLocation = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertVendorLocation(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: VendorLocationModel) => {
          response = VendorLocationModel.deserialize(response);
          agGrid._updateTableItem(rowIndex, response);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, model.id.toString());
        },
      });
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendor?.label} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        backNavLink="/vendor-management"
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const getConfirmation = (rowIndex: number): void => {
    if (gridState.isAllRowsSelected) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Changes"
          message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
          yesButton="Confirm"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            ModalStore.close();
            removeUnsavedRow(rowIndex);
          }}
        />
      );
    } else {
      removeUnsavedRow(rowIndex);
    }
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <div className={classes.addEditVendorWrapper}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          <div className={classes.gridHeight}>
            <AgGridMasterDetails
              addButtonTitle="Add Location"
              onAddButtonClick={() => addLocationRow()}
              hasAddPermission={vmsModuleSecurityV2.isEditable}
              disabled={gridState.isProcessing || gridState.isRowEditing}
              resetHeight={true}
              isPrimaryBtn={true}
            >
              <CustomAgGridReact
                isRowEditing={gridState.isRowEditing}
                rowData={gridState.data}
                gridOptions={gridOptions()}
                serverPagination={true}
                paginationData={gridState.pagination}
                onPaginationChange={loadLocationData}
                classes={{ customHeight: classes.customHeight }}
                disablePagination={gridState.isRowEditing || gridState.isProcessing}
              />
            </AgGridMasterDetails>
          </div>
        </DetailsEditorWrapper>
      </div>
    </ConfirmNavigate>
  );
};

export default inject('settingsStore', 'vendorLocationStore', 'vendorManagementStore')(observer(VendorLocation));
