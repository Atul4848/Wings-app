import React, { FC, useEffect, useState } from 'react';
import { cellStyle, GRID_ACTIONS, GridPagination, UIStore, IClasses, Utilities, regex } from '@wings-shared/core';
import { BaseStore, VendorLocationStore, OrderSoftwareStore, SettingsStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { VIEW_MODE } from '@wings/shared';
import { forkJoin } from 'rxjs';
import { SETTING_ID, useVMSModuleSecurity, VENDOR_ADDRESS_DATA_FILTER, VendorLocationModel } from '../../../Shared';
import { useParams } from 'react-router';
import { orderSoftwareFilter } from '../../../VendorSettings/Fields';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { useStyles } from './OrderSoftware.style';
import { OrderSoftwareModel } from '../../../Shared/Models/OrderSoftware.model';
import { VALIDATION_REGEX } from '../../../Shared/Enums/Spacing.enum';

interface Props {
  vendorLocationStore: VendorLocationStore;
  orderSoftwareStore: OrderSoftwareStore;
  settingsStore: SettingsStore;
  viewMode: VIEW_MODE;
  params?: { id: number; vendorId: number };
  classes?: IClasses;
}

const OrderSoftware: FC<Props> = ({ vendorLocationStore, orderSoftwareStore, settingsStore }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const params = useParams();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const agGrid = useAgGrid<VENDOR_ADDRESS_DATA_FILTER, OrderSoftwareModel>(orderSoftwareFilter, gridState);
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());

  useEffect(() => {
    loadVendorLocationData();
  }, []);

  const loadVendorLocationData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      vendorLocationStore?.getVendorLocationById(parseInt(params.id)),
      settingsStore?.getSettings(SETTING_ID.SETTING_ORDER_MANAGEMENT_SOFTWARE),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: [VendorLocationModel]) => {
        gridState.setPagination(new GridPagination({ ...response[0]?.vendorLocationOrderManagement }));
        const results = OrderSoftwareModel.deserializeList(response[0]?.vendorLocationOrderManagement);
        gridState.setGridData(results);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
        setSelectedVendorLocation(response[0]);
      });
  };

  const errorHandler = (errors: object, id): void => {
    Object.values(errors)?.forEach(errorMessage => BaseStore.showAlert(errorMessage[0], id));
  };

  const upsertOrderSoftware = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    gridState.setIsProcessing(true);
    const model = agGrid._getTableItem(rowIndex);

    UIStore.setPageLoader(true);
    orderSoftwareStore
      ?.upsertVendorLocationOrderSoftware(model.serialize(params.id))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
          gridState.setIsAllRowsSelected(false);
        })
      )
      .subscribe({
        next: (response: OrderSoftwareModel) => {
          agGrid._updateTableItem(rowIndex, OrderSoftwareModel.deserialize(response));

          agGrid.filtersApi.resetColumnFilters();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'orderManagementSoftware');
          if (error.response.data.errors) {
            errorHandler(error.response.data.errors, model.id.toString());
            return;
          }
          BaseStore.showAlert(error.message, model.id);
        },
      });
  };

  const fboOneRules = softwareValue => {
    const fboOneInstance = agGrid?.fetchCellInstance('fboOne');
    fboOneInstance?.setRules(
      (softwareValue.name === 'FBO One (Insyght)' || softwareValue.name === 'FBO One') ? 
        `required|string|max:${VALIDATION_REGEX.MAX_CHARACTOR_LENGTH_100}` : `string|max:${VALIDATION_REGEX.MAX_CHARACTOR_LENGTH_100}`
    );
  };
  
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    const softwareValue = agGrid?.fetchCellInstance('orderManagementSoftware')?.getValue();
    switch (colId) {
      case 'fboOne':
        if (softwareValue) {
          fboOneRules(softwareValue);
        }
        break;
      default:
        break;
    }

    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setIsAllRowsSelected(true);
    const colId = params.column.getColId();
    switch (colId) {
      case 'orderManagementSoftware':
        fboOneRules(value);
        break;
      default:
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const addNewGrid = () => {
    const data = [ new OrderSoftwareModel() ];
    agGrid.addNewItems(data, { startEditing: false, colKey: 'orderManagementSoftware' });
    gridState.setHasError(true);
  };

  const colDef: ColDef[] = [
    {
      headerName: 'Order Management Software',
      field: 'orderManagementSoftware',
      cellEditor: 'customAutoComplete',
      minWidth: 250,
      valueFormatter: ({ value }) => value && value.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Order Management Software',
      cellEditorParams: {
        placeHolder: 'Name',
        getAutoCompleteOptions: () => settingsStore.orderManagementSoftware,
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'FBO One Name',
      minWidth: 150,
      field: 'fboOne',
      headerTooltip: 'FBO One Name',
      cellEditorParams: {
        placeHolder: 'FBO One Name',
      },
    },
    {
      headerName: 'URL',
      minWidth: 150,
      field: 'url',
      headerTooltip: 'URL',
      cellEditorParams: {
        placeHolder: 'URL',
        rules: 'required|string|max:512|url',
      },
    },
    {
      headerName: 'Passkey',
      minWidth: 100,
      field: 'passkey',
      headerTooltip: 'Passkey',
      cellEditorParams: {
        placeHolder: 'Passkey',
        rules: 'string|max:200',
      },
    },
    {
      headerName: 'UserID',
      minWidth: 100,
      field: 'orderManagementUserId',
      headerTooltip: 'UserID',
      cellEditorParams: {
        placeHolder: 'UserID',
        rules: 'string|max:200',
      },
    },
    {
      headerName: 'Password',
      minWidth: 150,
      field: 'password',
      headerTooltip: 'Password',
      cellEditorParams: {
        placeHolder: 'Password',
        rules: `string|max:50|regex:${VALIDATION_REGEX.NO_WHITESPACE}`,
      },
    },
    {
      headerName: 'Team',
      minWidth: 100,
      field: 'team',
      headerTooltip: 'Team',
      cellEditorParams: {
        placeHolder: 'Team',
        rules: 'string|max:100',
      },
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
      hide: !vmsModuleSecurityV2.isEditable,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: colDef,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: true,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            isHidden: !vmsModuleSecurityV2.isEditable,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'orderManagementSoftware');
              break;
            case GRID_ACTIONS.SAVE:
              upsertOrderSoftware(rowIndex);
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
      isExternalFilterPresent: () => false,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        agGrid._startEditingCell(rowIndex, 'orderManagementSoftware');
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendorLocation.label} />}
        backNavTitle="Vendor Location"
        hideActionButtons={false}
        backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
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
            cancelEditing(rowIndex);
            removeUnSavedRow(rowIndex);
          }}
        />
      );
      return;
    }
    cancelEditing(rowIndex);
    removeUnSavedRow(rowIndex);
  };

  const cancelEditing = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    loadVendorLocationData();
    // agGrid.filtersApi.resetColumnFilters();
    gridState.setIsAllRowsSelected(false);
  };

  const removeUnSavedRow = (rowIndex: number) => {
    const data = agGrid._getTableItem(rowIndex);
    if (!data?.id) {
      agGrid._removeTableItems([ data ]);
    }
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.editorWrapperContainer}>
          <AgGridMasterDetails
            addButtonTitle="Add Order Software"
            onAddButtonClick={() => addNewGrid()}
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
              disablePagination={gridState.isRowEditing || gridState.isProcessing}
            />
          </AgGridMasterDetails>
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('vendorLocationStore', 'orderSoftwareStore', 'settingsStore')(observer(OrderSoftware));
