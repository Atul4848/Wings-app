import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { observer, inject } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, GRID_ACTIONS, cellStyle, Utilities } from '@wings-shared/core';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  AirportSettingsStore,
  RUNWAY_LIGHT_TYPE_FILTERS,
  RunwayLightTypeModel,
  useAirportModuleSecurity
} from '../../../Shared';
import { AxiosError } from 'axios';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const RunwayLightType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<RUNWAY_LIGHT_TYPE_FILTERS, RunwayLightTypeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .loadRunwayLightTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: RunwayLightTypeModel[]) => gridState.setGridData(response));
  };

  const upsertRunwayLightType = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportSettingsStore
      .upsertRunwayLightType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RunwayLightTypeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertRunwayLightType'),
      });
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
        upsertRunwayLightType(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const addRunwayLightType = () => {
    const lightType = new RunwayLightTypeModel({ id: 0 });
    agGrid.addNewItems([ lightType ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,10',
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,1000',
      },
    },
    {
      headerName: 'FAA Code',
      field: 'faaCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:0,10',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      hide: !airportModuleSecurity.isSettingsEditable,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, code, name, description, faaCode } = node.data as RunwayLightTypeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [RUNWAY_LIGHT_TYPE_FILTERS.CODE]: code,
              [RUNWAY_LIGHT_TYPE_FILTERS.NAME]: name,
              [RUNWAY_LIGHT_TYPE_FILTERS.DESCRIPTION]: description,
              [RUNWAY_LIGHT_TYPE_FILTERS.FAA_CODE]: faaCode,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addRunwayLightType}
      >
        Add Runway Light Type
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(RUNWAY_LIGHT_TYPE_FILTERS, RUNWAY_LIGHT_TYPE_FILTERS.CODE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        rightContent={rightContent}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
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

export default inject('airportSettingsStore')(observer(RunwayLightType));
export { RunwayLightType as PureRunwayLightType };
