import React, { FC, ReactNode, useEffect } from 'react';
import {
  regex,
  Utilities,
  UIStore,
  IAPIGridRequest,
  ViewPermission,
  SettingsTypeModel,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
  GenericRegistryModel,
  GenericRegistryStore,
  GENERIC_REGISTRY_FILTER,
  SettingsStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { forkJoin, of } from 'rxjs';
import { AxiosError } from 'axios';
import { ALERT_TYPES } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
  genericRegistryStore?: GenericRegistryStore;
  sidebarStore?: typeof SidebarStore;
}

const GenericRegistry: FC<Props> = ({ settingsStore, genericRegistryStore, sidebarStore }) => {
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<GENERIC_REGISTRY_FILTER, GenericRegistryModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _genericRegistryStore = genericRegistryStore as GenericRegistryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Generic Registry'), 'aircraft');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _genericRegistryStore.getGenericRegistries(true), _settingsStore.getWeightUOMs() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ genericRegistries ]) => gridState.setGridData(genericRegistries.results));
  };

  /* istanbul ignore next */
  const upsertGenericRegistry = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _genericRegistryStore
      .upsertGenericRegistry(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: GenericRegistryModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'GenericRegistry', ALERT_TYPES.CRITICAL),
      });
  };

  /* istanbul ignore next */
  const refreshRecord = (rowIndex: number): void => {
    ModalStore.close();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _genericRegistryStore
      .refreshGenericRegistry(model)
      .pipe(
        switchMap(isSucces => {
          if (isSucces) {
            const request: IAPIGridRequest = {
              filterCollection: JSON.stringify([ Utilities.getFilter('NavBlueGenericRegistryId', model.id) ]),
            };
            return _genericRegistryStore.getGenericRegistryById(request);
          }
          return of(new GenericRegistryModel(model));
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        agGrid._updateTableItem(rowIndex, response);
      });
  };

  /* istanbul ignore next */
  const confirmRecordRefresh = (rowIndex: number): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        refreshRecord(rowIndex);
      },
      {
        title: 'Confirm Refresh',
        message: 'Are you sure you want to refresh this record?',
      }
    );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertGenericRegistry(rowIndex);
        break;
      case GRID_ACTIONS.EVENT:
        confirmRecordRefresh(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Generic Registry',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|regex:${regex.alphaNumeric}|between:0,7`,
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Weight UOM',
      field: 'weightUOM',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
    },
    {
      headerName: 'Ramp Weight',
      field: 'rampWeight',
      editable: false,
    },
    {
      headerName: 'MTOW',
      field: 'mtow',
      editable: false,
    },
    {
      headerName: 'Zero Fuel Weight',
      field: 'zeroFuelWeight',
      editable: false,
    },
    {
      headerName: 'Max Landing Weight',
      field: 'maxLandingWeight',
      editable: false,
    },
    {
      headerName: 'Tank Capacity',
      field: 'tankCapacity',
      editable: false,
    },
    {
      headerName: 'BOW',
      field: 'bow',
      editable: false,
    },
    {
      headerName: 'Performance',
      field: 'performance',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
    },
    {
      headerName: 'Restrict External Use',
      field: 'restrictExternalUse',
      cellEditor: 'checkBoxRenderer',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      filter: false,
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isEditable,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !aircraftModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Refresh',
              isHidden: !aircraftModuleSecurity.isEditable,
              action: GRID_ACTIONS.EVENT,
            },
          ],
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: aircraftModuleSecurity.isEditable,
      gridActionProps: {
        tooltip: 'Generic registry',
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { name, id, weightUOM, rampWeight, tankCapacity } = node.data as GenericRegistryModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [GENERIC_REGISTRY_FILTER.GENERIC_REGISTRY]: name,
              [GENERIC_REGISTRY_FILTER.WEIGHT_UOM]: weightUOM.name,
              [GENERIC_REGISTRY_FILTER.RAMP_WEIGHT]: rampWeight?.toString(),
              [GENERIC_REGISTRY_FILTER.TANK_CAPACITY]: tankCapacity?.toString(),
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
    };
  };

  const addNewRegistry = () => {
    agGrid.addNewItems([ new GenericRegistryModel({ id: 0 }) ], {
      startEditing: true,
      colKey: 'name',
    });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={false}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={() => addNewRegistry()}
        >
          Add Generic Registry
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
          agGridUtilities.createSelectOption(GENERIC_REGISTRY_FILTER, GENERIC_REGISTRY_FILTER.GENERIC_REGISTRY),
        ]}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
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

export default inject('genericRegistryStore', 'settingsStore', 'sidebarStore')(observer(GenericRegistry));
