import React, { FC, ReactNode, useEffect, } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AirportSettingsStore, AIRPORT_OF_ENTRY_FILTER, useAirportModuleSecurity } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, IdNameCodeModel, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const AirportOfEntry: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_OF_ENTRY_FILTER, IdNameCodeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadAirportOfEntries();
  }, []);

  /* istanbul ignore next */
  const loadAirportOfEntries = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.loadAirportOfEntries()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response.results));
  };

  const upsertAirportOfEntry = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.upsertAirportOfEntry(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertAirportOfEntry'),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertAirportOfEntry(rowIndex);
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

  /* istanbul ignore next */
  const addNewType = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new IdNameCodeModel() ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        rules: 'required|string|size:1',
        isUnique: (value: string) => {
          return !_airportSettingsStore?.airportOfEntry.some(({ code }) => Utilities.isEqual(code, value?.trim()));
        },
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      hide: true,
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
        getEditableState: node => !Boolean(node.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, code, name } = node.data as IdNameCodeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_OF_ENTRY_FILTER.CODE]: code,
              [AIRPORT_OF_ENTRY_FILTER.NAME]: name,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('actionRenderer', false);
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
        Add Airport Of Entry
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_OF_ENTRY_FILTER, AIRPORT_OF_ENTRY_FILTER.CODE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={(sv) => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(AirportOfEntry));
