import React, { FC, ReactNode, useEffect } from 'react';
import {
  Utilities,
  UIStore,
  ISelectOption,
  ViewPermission,
  IdNameCodeModel,
  SettingsTypeModel,
  SelectOption,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  EditableCallbackParams,
  ICellEditorParams,
  ICellEditor,
  ColGroupDef,
} from 'ag-grid-community';
import {
  FlightPlanningServiceModel,
  FlightPlanningServiceStore,
  FLIGHT_PLANNING_SERVICE_FILTERS,
  SettingsStore,
  sidebarMenu,
  useAircraftModuleSecurity,
} from '../Shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SidebarStore } from '@wings-shared/layout';
import RegistryAssociation from './RegistryAssociation/RegistryAssociation';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  flightPlanningServiceStore?: FlightPlanningServiceStore;
  sidebarStore?: typeof SidebarStore;
  settingsStore?: SettingsStore;
}

const FlightPlanningServiceV2: FC<Props> = ({ settingsStore, flightPlanningServiceStore, sidebarStore }) => {
  const searchHeader  = useSearchHeader()
  const gridState = useGridState();
  const agGrid = useAgGrid<FLIGHT_PLANNING_SERVICE_FILTERS, FlightPlanningServiceModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _flightPlanningServiceStore = flightPlanningServiceStore as FlightPlanningServiceStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(sidebarMenu, 'aircraft');
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _flightPlanningServiceStore
      .getFlightPlanningServices(true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results);
      });
  };

  const upsertFlightPlanningService = (rowIndex: number): void => {
    const data: FlightPlanningServiceModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const model = new FlightPlanningServiceModel({
      ...data,
      customerNumber: new SettingsTypeModel({
        name: data.customerNumber?.value?.toString(),
      }),
    });
    UIStore.setPageLoader(true);
    _flightPlanningServiceStore
      .upsertFlightPlanningService(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: FlightPlanningServiceModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const isAlreadyExists = (currentData: FlightPlanningServiceModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'customerNumber' ] });
    const value = editorInstance[0].getValue().value;
    const isDuplicateData = gridState.data.some(a => a.customerNumber.name === value);
    if (isDuplicateData) {
      agGrid.showAlert('Customer Number should be unique.', 'FlightPlanningService');
      return true;
    }
    return false;
  };

  const customerLists = (): ISelectOption[] => {
    return _flightPlanningServiceStore.customers.map(a => {
      return { ...a, id: a.code, value: a.code, label: `${a.name}-${a.code}` };
    });
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Customer Number',
      field: 'customerNumber',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'agGroupCellRenderer',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      cellEditorParams: {
        isRequired: () => true,
        getAutoCompleteOptions: () => customerLists(),
        onSearch: value => searchCustomers(value),
        valueGetter: (option: SelectOption) => option.value,
      },
    },
    {
      headerName: 'Customer Name',
      field: 'customerName',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isEditable,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [{ title: 'Delete', isHidden: false, action: GRID_ACTIONS.DELETE }],
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        },
      }),
    },
  ];

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, option: IdNameCodeModel): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !option?.value);
    if (option?.name) {
      agGrid.getComponentInstance('customerName').setValue(option.name);
      gridState.setHasError(false);
      return;
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertFlightPlanningService(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(
          () => {
            ModalStore.close();
            deleteRecord(rowIndex);
          },
          {
            title: 'Delete Flight Planning Service',
            isDelete: true,
          }
        );
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const searchCustomers = (searchValue: string): void => {
    const request = {
      searchCollection: JSON.stringify([
        { propertyName: 'CustomerNumber', propertyValue: searchValue, operator: 'and' },
        { propertyName: 'CustomerName', propertyValue: searchValue, operator: 'or' },
      ]),
    };
    _flightPlanningServiceStore
      .getCustomers(request)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe();
  };

  /* istanbul ignore next */
  const deleteRecord = (rowIndex: number): void => {
    const data: FlightPlanningServiceModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    _flightPlanningServiceStore
      .removeFlightPlanningService(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ data ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        tooltip: 'Flight Planning Service',
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: aircraftModuleSecurity.isEditable,
        isParentRowEditing: () => gridState.isRowEditing,
        flightPlanningServiceStore: _flightPlanningServiceStore,
        settingsStore: _settingsStore,
      },
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { id, customerName, customerNumber } = node.data as FlightPlanningServiceModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [FLIGHT_PLANNING_SERVICE_FILTERS.NAME]: customerName,
              [FLIGHT_PLANNING_SERVICE_FILTERS.NUMBER]: customerNumber.name,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      masterDetail: true,
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: RegistryAssociation,
      },
    };
  };

  const addFlighPlanningService = (): void => {
    agGrid.addNewItems([ new FlightPlanningServiceModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'customerNumber',
    });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={() => addFlighPlanningService()}
        >
          Add Flight Planning Service
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(FLIGHT_PLANNING_SERVICE_FILTERS, FLIGHT_PLANNING_SERVICE_FILTERS.NAME),
        ]}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('flightPlanningServiceStore', 'settingsStore', 'sidebarStore')(observer(FlightPlanningServiceV2));
