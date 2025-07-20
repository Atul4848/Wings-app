import React, { FC, ReactNode, useEffect, useState } from 'react';
import { GridPagination, VIEW_MODE } from '@wings/shared';
import {
  SETTING_ID,
  SettingBaseModel,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_LOCATION_HOURS_FILTERS,
  VendorLocationModel,
  
} from '../../../Shared';
import { BaseStore, SettingsStore, VendorLocationStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './GroundServiceProvider.styles';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  IClasses,
  UIStore,
  GRID_ACTIONS,
  Utilities,
  cellStyle,
  IAPIGridRequest,
  SelectOption,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useParams } from 'react-router';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate, ConfirmDialog } from '@wings-shared/layout';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIResponseGroundServiceProvider } from '../../../Shared/Interfaces/Response/API-Response-VendorLocation';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import {
  AgGridMasterDetails,
  AgGridViewRenderer,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode, ICellEditorParams, ValueGetterParams } from 'ag-grid-community';
import { hoursGridFilters } from '../../fields';
import { forkJoin } from 'rxjs';
import { GroundServiceProviderModel } from '../../../Shared/Models/GroundServiceProvider.model';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { Chip, Tooltip } from '@material-ui/core';
import { OperationInfoSettingOptionModel } from '../../../Shared/Models/OperationInfoSettingOptionModel.model';

interface Props {
  settingsStore: SettingsStore;
  vendorLocationStore: VendorLocationStore;
  params?: { viewMode: VIEW_MODE; id: Number };
  classes?: IClasses;
}

const GroundServiceProvider: FC<Props> = observer(({ settingsStore, vendorLocationStore }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const params = useParams();
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LOCATION_HOURS_FILTERS, GroundServiceProviderModel>(hoursGridFilters, gridState);

  useEffect(() => {
    if (params.id) {
      loadVendorLocationData();
      loadGroundServiceProvider();
    }
  }, []);

  const loadVendorLocationData = () => {
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.getVendorLocationById(params.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorLocationModel) => {
        setSelectedVendorLocation(response);
      });
  };

  const loadGroundServiceProvider = (pageRequest?: IAPIGridRequest) => {
    gridState.setIsProcessing(true);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'VendorLocation.VendorLocationId',
          propertyValue: params.id,
        },
      ]),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    const locationRequest: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: 500,
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
      vendorLocationStore.getVMSGroundServiceProvider(request),
      vendorLocationStore?.getVMSComparison(locationRequest),
      settingsStore?.getSettings(SETTING_ID.LOCATION_STATUS, 'LocationStatus'),
      settingsStore?.getSettings(SETTING_ID.SETTINGS_OPERATON_TYPE, 'AppliedOperationType'),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe(
        (
          response: [
            IAPIPageResponse<IAPIResponseGroundServiceProvider>,
            IAPIPageResponse<VendorLocationModel>,
            StatusBaseModel[]
          ]
        ) => {
          response[0].totalNumberOfRecords = response[0].results.length;
          gridState.setPagination(new GridPagination({ ...response[0] }));
          gridState.setGridData(GroundServiceProviderModel.deserializeList(response[0]?.results));
          const allowSelectAll = response[0]?.totalNumberOfRecords <= response[0].pageSize;
          gridState.setAllowSelectAll(allowSelectAll);
          agGrid.reloadColumnState();
          agGrid.refreshSelectionState();
        }
      );
  };

  const upsertVendorLocationGroundService = (rowIndex: number): void => {
    gridState.setIsProcessing(true);
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertVendorLocationGroundServiceProvider(model.serialize(parseInt(params.id)))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: GroundServiceProviderModel) => {
          response = GroundServiceProviderModel.deserialize(response);
          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'appliedVendorLocation');
          if (error.response.data.errors) {
            errorHandler(error.response.data.errors, model.id.toString());
            return;
          }
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendorLocation?.label} />}
        backNavTitle="Vendor Location"
        hideActionButtons={false}
        backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const errorHandler = (errors: object): void => {
    Object.values(errors)?.forEach(errorMessage => AlertStore.info(errorMessage[0]));
  };

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    switch (colId) {
      case 'otherName':
        if (!value) {
          agGrid.fetchCellInstance('otherName')?.setRules('string|required|max:200');
        }
        break;
      case 'appliedVendorLocation':
        if (!value) {
          gridState.setHasError(true);
          return;
        }
        break;
      default:
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = colDef.column.getColId();
    switch (colId) {
      case 'appliedVendorLocation':
        if (!value) {
          gridState.setHasError(true);
          return;
        }
        if (value.id === 999999) {
          vendorLocationStore.isOtherName = true;
          agGrid.fetchCellInstance('groundServiceProviderOperationType').setValue([]);
          agGrid.fetchCellInstance('otherName')?.setRules('string|required|max:200');
          agGrid.fetchCellInstance('status').setValue(
            SettingBaseModel.deserialize({
              id: 1,
              name: 'New',
            })
          );
        } else {
          vendorLocationStore.isOtherName = false;
          if (Array.isArray(value?.operationalEssential?.appliedOperationType)) {
            agGrid
              .fetchCellInstance('groundServiceProviderOperationType')
              .setValue(
                OperationInfoSettingOptionModel.deserializeList(value?.operationalEssential?.appliedOperationType) ||
                  []
              );
          } else {
            if(value?.operationalEssential?.appliedOperationType.id !==undefined){
              agGrid
                .fetchCellInstance('groundServiceProviderOperationType')
                .setValue(
                  [ OperationInfoSettingOptionModel.deserialize(value?.operationalEssential?.appliedOperationType) ]
                );
            }else{
              agGrid
                .fetchCellInstance('groundServiceProviderOperationType')
                .setValue(
                  []
                );
            }
          }
          agGrid.fetchCellInstance('status').setValue(SettingBaseModel.deserialize(value?.vendorLocationStatus));
          agGrid.fetchCellInstance('otherName')?.setRules('string');
          agGrid.fetchCellInstance('otherName').setValue('');
        }
        break;
      default:
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'appliedVendorLocation',
      cellEditor: 'customAutoComplete',
      minWidth: 250,
      valueFormatter: ({ value }) => value && value.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      headerTooltip: 'Name',
      cellEditorParams: {
        placeHolder: 'Name',
        getAutoCompleteOptions: () => {
          const options = [
            ...vendorLocationStore.vendorLocationList,
            VendorLocationModel.deserialize({
              id: 999999,
              name: 'Other',
            }),
          ];
          return options;
        },
      },
    },
    {
      headerName: 'Other Name',
      field: 'otherName',
      headerTooltip: 'Other Name',
      minWidth: 130,
      cellEditorParams: {
        placeHolder: 'Other Name',
        getDisableState: (node: RowNode) => !vendorLocationStore.isOtherName,
        isRequired: () => vendorLocationStore.isOtherName,
        rules: 'string|max:200',
      },
    },
    {
      headerName: 'Operation Type',
      minWidth: 330,
      field: 'groundServiceProviderOperationType',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'viewRenderer',
      sortable: false,
      filter: false,
      filterValueGetter: ({ data }: ValueGetterParams) => data?.groundServiceProviderOperationType?.operationType.name,
      headerTooltip: 'Operation Type',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.groundServiceProviderOperationType, null, true),
      },
      cellEditorParams: {
        // isRequired: ()=> !vendorLocationStore.isOtherName,
        placeHolder: 'Operation Type',
        multiSelect: true,
        multiple: true,
        disableCloseOnSelect: true,
        getDisableState: (node: RowNode) => true,
        valueGetter: (selectedOptions: OperationInfoSettingOptionModel[]) => selectedOptions,
        renderTags: (values: OperationInfoSettingOptionModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRenderer(values, getTagProps),
        getAutoCompleteOptions: () =>
          vendorLocationStore.getOperationalEssentialSettingOptions<SettingBaseModel>(
            settingsStore?.operationType,
            'operationType'
          ),
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      headerTooltip: 'Status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      minWidth: 130,
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.vendorLocationSettings,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Status',
        isRequired: () => true,
        getDisableState: (node: RowNode) => !vendorLocationStore.isOtherName,
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

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data = agGrid._getTableItem(rowIndex);
    if (!data?.id) {
      agGrid._removeTableItems([ data ]);
    }
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
            cancelEditing(rowIndex);
            removeUnSavedRow(rowIndex);
          }}
        />
      );
    } else {
      cancelEditing(rowIndex);
      removeUnSavedRow(rowIndex);
    }
  };

  function viewRenderer(
    operationTypeChips: OperationInfoSettingOptionModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode {
    const numTags = operationTypeChips?.length;
    const limitTags = 2;
    const chipsList = isReadMode ? operationTypeChips : [ ...operationTypeChips ].slice(0, limitTags);
    return (
      <div>
        {Utilities.customArraySort(chipsList, 'name').map((data: OperationInfoSettingOptionModel, index) => (
          <Tooltip title={data?.operationType ? data.operationType.name : ''} key={index}>
            <Chip
              color="primary"
              key={data?.operationType?.id}
              label={data?.operationType ? data.operationType.name : ''}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          </Tooltip>
        ))}
        {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
      </div>
    );
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: vmsModuleSecurityV2.isEditable,
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
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const model = agGrid._getTableItem(rowIndex);
              if (model.appliedVendorLocation.id === 999999 || model.appliedVendorLocation.name === 'Other') {
                vendorLocationStore.isOtherName = true;
                model.appliedVendorLocation = VendorLocationModel.deserialize({
                  id: 999999,
                  name: 'Other',
                });
                gridState.gridApi.updateRowData({
                  addIndex: rowIndex,
                  update: [ model ],
                });
              } else {
                vendorLocationStore.isOtherName = false;
              }
              agGrid._startEditingCell(rowIndex, 'appliedVendorLocation');
              break;
            case GRID_ACTIONS.SAVE:
              upsertVendorLocationGroundService(rowIndex);
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
      onFilterChanged: () => loadGroundServiceProvider(),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadGroundServiceProvider();
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        viewRenderer: AgGridViewRenderer,
      },
    };
  };

  const addGroundServiceProvider = (): void => {
    const model = [
      new GroundServiceProviderModel({
        status: new SettingBaseModel({
          id: 1,
          name: 'New',
        }),
      }),
    ];
    agGrid.addNewItems(model, { startEditing: false, colKey: 'appliedVendorLocation' });
    gridState.setHasError(true);
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.gridHeight}>
          <AgGridMasterDetails
            addButtonTitle="Add Ground Service Provider"
            onAddButtonClick={() => addGroundServiceProvider()}
            hasAddPermission={vmsModuleSecurityV2.isEditable}
            disabled={gridState.isProcessing || gridState.isRowEditing}
            resetHeight={true}
            isPrimaryBtn={true}
          >
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data}
              gridOptions={gridOptions()}
              serverPagination={false}
              paginationData={gridState.pagination}
              onPaginationChange={loadGroundServiceProvider}
              classes={{ customHeight: classes.customHeight }}
              disablePagination={gridState.isRowEditing || gridState.isProcessing}
            />
          </AgGridMasterDetails>
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
});
export default inject('settingsStore', 'vendorLocationStore')(GroundServiceProvider);
