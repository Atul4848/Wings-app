import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe } from '@wings-shared/hooks';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { AirportSettingsStore, NOTE_TYPE, NoteTypeModel, useAirportModuleSecurity } from '../../../Shared';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const NoteType: FC<Props> = ({ airportSettingsStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<NOTE_TYPE, NoteTypeModel>([], gridState);
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadNoteTypes();
  }, []);

  /* istanbul ignore next */
  const loadNoteTypes = () => {
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.loadNoteTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  const upsertNoteType = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportSettingsStore
      ?.upsertNoteType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: NoteTypeModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertNoteType'),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'name');
        break;
      case GRID_ACTIONS.SAVE:
        upsertNoteType(rowIndex);
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
  const addNoteType = (): void => {
    agGrid.addNewItems([ new NoteTypeModel({ id: 0 }) ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'CAPPS Code',
      field: 'cappsCode',
      cellEditorParams: {
        rules: 'required|string|size:1',
        isUnique: (value: string) => {
          return !_airportSettingsStore?.noteTypes.some(({ cappsCode }) => Utilities.isEqual(cappsCode, value?.trim()));
        },
      },
    },
    {
      ...agGrid.actionColumn({ hide: !airportModuleSecurity.isSettingsEditable }),
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
        onAction: gridActions,
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
        const { id, cappsCode, name } = node.data as NoteTypeModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [NOTE_TYPE.NAME]: name,
              [NOTE_TYPE.CAPPS_CODE]: cappsCode,
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
        onClick={addNoteType}
      >
        Add Note Type
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[ agGridUtilities.createSelectOption(NOTE_TYPE, NOTE_TYPE.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(NoteType));
