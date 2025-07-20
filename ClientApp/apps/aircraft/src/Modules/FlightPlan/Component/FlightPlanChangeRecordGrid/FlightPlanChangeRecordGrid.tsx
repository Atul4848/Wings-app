import React, { FC, useEffect } from 'react';
import { Utilities, DATE_FORMAT, ENTITY_STATE, DATE_TIME_PICKER_TYPE, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  RowEditingStartedEvent,
  ValueFormatterParams,
  GridReadyEvent,
  ValueGetterParams,
} from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { FlightPlanFormatChangeRecordModel, FLIGHT_PLAN_FILTERS, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from '../FlightPlanDocumentGrid/FlightPlanDocumentGrid.styles';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  isEditable: boolean;
  flightPlanFormatChangeRecords: FlightPlanFormatChangeRecordModel[];
  onDataSave: (response: FlightPlanFormatChangeRecordModel[]) => void;
  onRowEditing: (isEditing: boolean) => void;
}

const FlightPlanChangeRecordGrid: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<FLIGHT_PLAN_FILTERS, FlightPlanFormatChangeRecordModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
  }, [ props.isEditable ]);

  // Called from Ag Grid Component
  const onInputChange = ({ colDef }: ICellEditorParams, value: string): void => {
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
        upsertFlightPlanFormatChangeRecord(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        props.onRowEditing(false);
        break;
    }
  };

  const addNewChangeRecord = (): void => {
    const changeRecord = new FlightPlanFormatChangeRecordModel({ id: 0 });
    agGrid.addNewItems([ changeRecord ], { startEditing: false, colKey: 'requestedBy' });
    agGrid.setColumnVisible('actionRenderer', true);
    gridState.setHasError(true);
  };

  const confirmRemoveRecord = (rowIndex: number): void => {
    const model: FlightPlanFormatChangeRecordModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteFlightPlanFormatChangeRecord(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteFlightPlanFormatChangeRecord(model), {
      isDelete: true,
    });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Requested By',
      field: 'requestedBy',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Changed By',
      field: 'changedBy',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Notes',
      field: 'notes',
      minWidth: 700,
      cellEditorParams: {
        rules: 'string|between:1,500',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Changed Date',
      field: 'changedDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.changedDate, DATE_FORMAT.API_DATE_FORMAT),
      cellEditorParams: {
        isRequired: () => true,
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
      },
    },
    {
      ...agGrid.actionColumn({
        maxWidth: 130,
        minWidth: 130,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: aircraftModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => props.isEditable,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!props.isEditable) {
          return;
        }
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.startEditingRow(event);
        props.onRowEditing(true);
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
      },
    };
  };

  /* istanbul ignore next */
  const upsertFlightPlanFormatChangeRecord = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: FlightPlanFormatChangeRecordModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const deleteFlightPlanFormatChangeRecord = (model: FlightPlanFormatChangeRecordModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    const _data = agGrid._getAllTableRows().map(
      requirement =>
        new FlightPlanFormatChangeRecordModel({
          ...requirement,
          id: requirement.id || Utilities.getTempId(true),
          entityState: ENTITY_STATE.NEW,
        })
    );
    gridState.setGridData(_data);
    props.onDataSave(gridState.data);
  };

  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title="Change Record"
        buttonText="Add Change Record"
        isButtonDisabled={
          gridState.isRowEditing || UIStore.pageLoading || !(aircraftModuleSecurity.isEditable && props.isEditable)
        }
        onButtonClick={addNewChangeRecord}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.flightPlanFormatChangeRecords}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default observer(FlightPlanChangeRecordGrid);
