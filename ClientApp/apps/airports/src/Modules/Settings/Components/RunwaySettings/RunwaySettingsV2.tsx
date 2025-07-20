import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ICellEditor } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { RunwaySettingsTypeModel, RUNWAY_SETTING_TYPE_FILTERS, useAirportModuleSecurity } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Observable } from 'rxjs';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  type: string;
  getSettings?: () => Observable<RunwaySettingsTypeModel[]>;
  upsertSettings?: (object: RunwaySettingsTypeModel) => Observable<RunwaySettingsTypeModel>;
  codeLength?: number;
}

const RunwaySettings: FC<Props> = ({ type, getSettings, upsertSettings, codeLength = 10 }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<RUNWAY_SETTING_TYPE_FILTERS, RunwaySettingsTypeModel>([], gridState);
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    getSettings &&
      getSettings()
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: RunwaySettingsTypeModel[]) => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: RunwaySettingsTypeModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'code', 'name' ],
    });
    const code = editorInstance[0]?.getValue();
    const name = editorInstance[1]?.getValue();

    const duplicate = gridState.data.filter(a => a.code.toLowerCase() === code.toLowerCase() && data?.id !== a.id);

    if (Boolean(duplicate.length)) {
      if (duplicate.some(x => name.toLowerCase() === x.name.toLowerCase())) {
        agGrid.showAlert(`${type} already exists for Name: ${name} and Code: ${code}`, `${type}`);
        return true;
      }
      return false;
    }

    return false;
  };

  const upsertSetting = (rowIndex: number): void => {
    const data: RunwaySettingsTypeModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    upsertSettings &&
      upsertSettings(model)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: RunwaySettingsTypeModel) => agGrid._updateTableItem(rowIndex, response),
          error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertRunwaySetting'),
        });
  };

  const addNewType = () => {
    const runwaySetting = new RunwaySettingsTypeModel({ id: 0 });
    agGrid.addNewItems([ runwaySetting ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
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
        upsertSetting(rowIndex);
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
        rules: `required|string|between:1,${codeLength}`,
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
        const { id, code, name, description } = node.data as RunwaySettingsTypeModel;
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
        Add Runway {type}
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

export default observer(RunwaySettings);
