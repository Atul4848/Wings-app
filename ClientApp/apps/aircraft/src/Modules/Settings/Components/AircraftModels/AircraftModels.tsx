import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { AIRCRAFT_MODEL_FILTERS, SettingsStore, useAircraftModuleSecurity } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AircraftModel, AircraftModelMakeModel } from '../../../Shared/Models';
import { finalize, takeUntil } from 'rxjs/operators';
import { AircraftModelUpsert } from './Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { forkJoin } from 'rxjs';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import {
  CustomAgGridReact,
  AgGridCheckBox,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
}

const AircraftModels: FC<Props> = ({ settingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRCRAFT_MODEL_FILTERS, AircraftModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getAircraftModels(), _settingsStore.getMakes() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ aircraftModels ]) => gridState.setGridData(aircraftModels));
  };

  /* istanbul ignore next */
  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    const aircraftModel: AircraftModel = rowIndex !== null ? agGrid._getTableItem(rowIndex) : new AircraftModel();
    ModalStore.open(
      <AircraftModelUpsert
        settingsStore={_settingsStore}
        model={aircraftModel}
        viewMode={gridAction === GRID_ACTIONS.CREATE ? VIEW_MODE.NEW : VIEW_MODE.EDIT}
        onUpsert={response => {
          if (rowIndex === null) {
            gridState.gridApi.applyTransaction({ add: [ response ], addIndex: 0 });
            gridState.gridApi.redrawRows();
            agGrid._sortColumns(rowIndex, response, 'name')
            setAircraftMmodels();
            return;
          }
          agGrid._sortColumns(rowIndex, response, 'name')
          setAircraftMmodels();
        }}
      />
    );
  };

  const setAircraftMmodels = (): void => {
    _settingsStore.aircraftModels = agGrid._getAllTableRows();
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Model',
      field: 'name',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isSettingsEditable,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
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
      context: {},
      columnDefs,
      isEditable: aircraftModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { name, id, modelMakes } = node.data as AircraftModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRCRAFT_MODEL_FILTERS.NAME]: name,
              [AIRCRAFT_MODEL_FILTERS.MAKE]: modelMakes.map(x => x.make?.name).toString(),
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: 'Make',
              field: 'make',
              cellEditor: 'customAutoComplete',
              comparator: (current: AircraftModelMakeModel, next: AircraftModelMakeModel) =>
                Utilities.customComparator(current, next, 'name'),
              filter: false,
              valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
            },
            {
              headerName: 'Large Aircraft',
              field: 'isLargeAircraft',
              cellRenderer: 'checkBoxRenderer',
              cellRendererParams: { readOnly: true },
            },
          ],
          defaultColDef: { flex: 1 },
          frameworkComponents: {
            checkBoxRenderer: AgGridCheckBox,
          },
        },
        getDetailRowData: function(params) {
          params.successCallback(params.data.modelMakes);
        },
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!aircraftModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={() => gridActions(GRID_ACTIONS.CREATE, null)}
      >
        Add Aircraft Model
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(AIRCRAFT_MODEL_FILTERS, AIRCRAFT_MODEL_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
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

export default inject('settingsStore')(observer(AircraftModels));
