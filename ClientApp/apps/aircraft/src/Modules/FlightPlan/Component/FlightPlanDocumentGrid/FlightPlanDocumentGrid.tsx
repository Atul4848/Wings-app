import React, { FC, useEffect } from 'react';
import { IClasses, Utilities, ENTITY_STATE, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  RowEditingStartedEvent,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { FLIGHT_PLAN_FILTERS, FlightPlanFormatDocumentModel, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from './FlightPlanDocumentGrid.styles';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  isEditable: boolean;
  flightPlanFormatDocuments: FlightPlanFormatDocumentModel[];
  onDataSave: (response: FlightPlanFormatDocumentModel[]) => void;
  onRowEditing: (isEditing: boolean) => void;
}

const FlightPlanDocumentGrid: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<FLIGHT_PLAN_FILTERS, FlightPlanFormatDocumentModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => agGrid.setColumnVisible('actionRenderer', props.isEditable), [ props.isEditable ]);

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        agGrid.setColumnVisible('link', false);
        upsertFlightPlanFormatDocument(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.setColumnVisible('link', false);
        cancelEditing(rowIndex);
        props.onRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveDocument(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        props.onRowEditing(false);
        break;
    }
  };

  // Called from Ag Grid Component
  const onInputChange = ({ colDef }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const addNewDocument = (): void => {
    const document = new FlightPlanFormatDocumentModel({ id: 0 });
    agGrid.addNewItems([ document ], { startEditing: false, colKey: 'name' });
    agGrid.setColumnVisible('actionRenderer', true);
    gridState.setHasError(true);
  };

  const confirmRemoveDocument = (rowIndex: number): void => {
    const model: FlightPlanFormatDocumentModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteFlightPlanFormatDocument(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteFlightPlanFormatDocument(model), {
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this Document?',
    });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => (
          <a className={classes?.link} href={node.data?.link} target="_blank">
            {node.data?.name}
          </a>
        ),
      },
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Link',
      field: 'link',
      cellEditorParams: {
        rules: 'required|string|between:1,255',
        ignoreNumber: true,
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
        agGrid.setColumnVisible('actionRenderer', Boolean(props.isEditable));
        agGrid.setColumnVisible('link', false);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.startEditingRow(event);
        props.onRowEditing(true);
        agGrid.setColumnVisible('link', true);
      },
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
      },
    };
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: FlightPlanFormatDocumentModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const upsertFlightPlanFormatDocument = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const deleteFlightPlanFormatDocument = (model: FlightPlanFormatDocumentModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  /* istanbul ignore next */
  const updateTableData = (): void => {
    const _data = agGrid._getAllTableRows().map(
      requirement =>
        new FlightPlanFormatDocumentModel({
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
        title="Document"
        buttonText="Add Document"
        isButtonDisabled={
          gridState.isRowEditing || UIStore.pageLoading || !(aircraftModuleSecurity.isEditable && props.isEditable)
        }
        onButtonClick={addNewDocument}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.flightPlanFormatDocuments}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default observer(FlightPlanDocumentGrid);
