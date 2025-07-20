import React, { FC, useEffect } from 'react';
import { Utilities, ENTITY_STATE, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import { ColDef, GridOptions, RowEditingStartedEvent, GridReadyEvent } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PerformanceLinkModel, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from './PerformanceLinkGrid.styles';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  isEditable?: boolean;
  performanceLinkData: PerformanceLinkModel[];
  onDataSave: (response: PerformanceLinkModel[]) => void;
  onRowEdit: (isEditing: boolean) => void;
}

const PerformanceLinkGrid: FC<Props> = ({ isEditable, performanceLinkData, onDataSave, onRowEdit }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', PerformanceLinkModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
  }, [ isEditable ]);

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertPerformanceLink(rowIndex);
        onRowEdit(false);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        onRowEdit(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveLink(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        onRowEdit(false);
        break;
    }
  };

  const addNewLink = (): void => {
    agGrid.addNewItems([ new PerformanceLinkModel() ], { startEditing: false, colKey: 'link' });
    gridState.setHasError(true);
  };

  const confirmRemoveLink = (rowIndex: number): void => {
    const model: PerformanceLinkModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteLink(model);
      return;
    }
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        deleteLink(model);
      },
      {
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove this Link?',
      }
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Link',
      field: 'link',
      cellEditorParams: {
        rules: 'required|string',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string',
        ignoreNumber: true,
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 130,
        maxWidth: 130,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)) },
      columnDefs: columnDefs,
      isEditable: aircraftModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => isEditable,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!isEditable) {
          return;
        }
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        gridState.setHasError(true);
        agGrid.startEditingRow(event);
        onRowEdit(true);
      },
    };
  };

  /* istanbul ignore next */
  const upsertPerformanceLink = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: PerformanceLinkModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const deleteLink = (model: PerformanceLinkModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid
        ._getAllTableRows()
        .map(requirement => new PerformanceLinkModel({ ...requirement, entityState: ENTITY_STATE.NEW }))
    );
    onDataSave(gridState.data);
  };

  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title="Associated Performance Manual"
        buttonText="Add Associated Performance Manual"
        isButtonDisabled={
          gridState.isRowEditing || UIStore.pageLoading || !(aircraftModuleSecurity.isEditable && isEditable)
        }
        onButtonClick={() => addNewLink()}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={performanceLinkData}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default observer(PerformanceLinkGrid);
