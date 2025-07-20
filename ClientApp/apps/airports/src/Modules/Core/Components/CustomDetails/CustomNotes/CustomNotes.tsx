import React, { FC, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import {
  AirportModel,
  AirportSettingsStore,
  AirportStore,
  AirportCustomDetailStore,
  useAirportModuleSecurity,
  CustomsNoteModel,
} from '../../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './CustomNotes.styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS, ISelectOption, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { AxiosError } from 'axios';
import { ColDef, GridOptions, ICellEditorParams, GridReadyEvent } from 'ag-grid-community';
import { typeCodeOptions } from './fields';

interface Props {
  airportStore?: AirportStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
  airportSettingsStore?: AirportSettingsStore;
  isEditable: boolean;
  isRowEditing: (isEditing: boolean) => void;
}

const CustomNotes: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<'', CustomsNoteModel>([], gridState);
  const _airportStore = props.airportStore as AirportStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _disabled = gridState.isRowEditing || UIStore.pageLoading || !_selectedAirport?.isActive || !props.isEditable;
  const { isGRSUser, isEditable } = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
    return () => props.isRowEditing(false);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  const loadInitialData = () => {
    const customsDetailId = _selectedAirport.customs?.customsDetailId || _selectedAirport.customsDetail?.id;
    UIStore.setPageLoader(true);
    _customDetailStore
      .getCustomsNotes(customsDetailId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => gridState.setGridData(response.results),
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addNoteType = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new CustomsNoteModel({ id: 0 }) ], { startEditing: false, colKey: 'noteType' });
    gridState.setHasError(true);
  };

  const upsertCustomNotes = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    model.customsDetailId = _selectedAirport.customs?.customsDetailId || _selectedAirport.customsDetail?.id;
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _customDetailStore
      .upsertCustomsNote(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: error => agGrid.showAlert(error.message, 'upsertCustomsNote'),
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
        upsertCustomNotes(rowIndex);
        props.isRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        props.isRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Note Type',
      field: 'noteType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Note Type',
        getAutoCompleteOptions: () => _airportSettingStore.noteTypes,
      },
    },
    {
      headerName: 'Type Code',
      field: 'typeCode',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Type Code',
        getAutoCompleteOptions: () => typeCodeOptions,
      },
    },
    {
      headerName: 'Notes',
      field: 'notes',
      cellRenderer: 'customTextAreaEditor',
      cellRendererParams: {
        readOnly: true,
        editorType: EDITOR_TYPES.RICH_TEXT_EDITOR,
      },
      cellEditor: 'customTextAreaEditor',
      cellEditorParams: {
        rules: 'required|string|max:4000',
      },
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: isEditable || isGRSUser,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        props.isRowEditing(true);
        _airportSettingStore?.loadNoteTypes().subscribe();
      },
    };
  };

  return (
    <>
      <div className={classes.addButtonContainer}>
        <ViewPermission hasPermission={props.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addNoteType}>
            Add Note
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} isRowEditing={gridState.isRowEditing} />
      </div>
    </>
  );
};

export default inject('airportStore', 'airportCustomDetailStore', 'airportSettingsStore')(observer(CustomNotes));
