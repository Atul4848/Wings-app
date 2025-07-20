import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams, ICellEditor } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import {
  AirportSettingsStore,
  RunwaySurfaceTypeModel,
  RUNWAY_SETTING_TYPE_FILTERS,
  useAirportModuleSecurity
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, YES_NO_NULL, SelectOption, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const RunwaySurfaceType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<RUNWAY_SETTING_TYPE_FILTERS, RunwaySurfaceTypeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  const isHardSurfaceOptions: SelectOption[] = [
    new SelectOption({ name: 'Yes', value: YES_NO_NULL.YES }),
    new SelectOption({ name: 'No', value: YES_NO_NULL.NO }),
  ];

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.loadRunwaySurfaceTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: RunwaySurfaceTypeModel[]) => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: RunwaySurfaceTypeModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'code', 'name' ],
    });
    const code = editorInstance[0]?.getValue();
    const name = editorInstance[1]?.getValue();

    const duplicate = gridState.data.filter(a => a.code.toLowerCase() === code.toLowerCase() && data?.id !== a.id);

    if (Boolean(duplicate.length)) {
      if (duplicate.some(x => name.toLowerCase() === x.name.toLowerCase())) {
        agGrid.showAlert(`SurfaceType already exists for Name: ${name} and Code: ${code}`, 'surfaceType');
        return true;
      }
      return false;
    }

    return false;
  };

  const upsertRunwaySurfaceType = (rowIndex: number): void => {
    const data: RunwaySurfaceTypeModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.upsertRunwaySurfaceType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RunwaySurfaceTypeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertRunwaySurfaceType'),
      });
  };

  const addNewType = () => {
    const runwaySurfaceType = new RunwaySurfaceTypeModel();
    agGrid.addNewItems([ runwaySurfaceType ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
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
        upsertRunwaySurfaceType(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
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
      headerName: 'Is Hard Surface',
      field: 'isHardSurface',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Is Hard Surface',
        valueGetter: (option: SelectOption) => option.value,
        getAutoCompleteOptions: () => isHardSurfaceOptions,
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
      context: { onInputChange, onDropDownChange },
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
        const { id, code, name, description } = node.data as RunwaySurfaceTypeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [RUNWAY_SETTING_TYPE_FILTERS.CODE]: code,
              [RUNWAY_SETTING_TYPE_FILTERS.NAME]: name,
              [RUNWAY_SETTING_TYPE_FILTERS.DESCRIPTION]: description,
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
        onClick={addNewType}
      >
        Add Runway Surface Type
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(RUNWAY_SETTING_TYPE_FILTERS, RUNWAY_SETTING_TYPE_FILTERS.CODE),
        ]}
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

export default inject('airportSettingsStore')(observer(RunwaySurfaceType));
