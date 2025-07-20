import React, { FC } from 'react';
import { ColDef, GridOptions, RowEditingStartedEvent } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CountryLevelExclusionModel } from '../../../../../Shared';
import { ENTITY_STATE, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  isEditable: boolean;
  rowData: CountryLevelExclusionModel[];
  onDataUpdate: (formRequirements: CountryLevelExclusionModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
}

const CountryLevelExclusion: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<any, CountryLevelExclusionModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmDeleteRecord(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        props.onRowEdit(false);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Country Level',
      field: 'countryLevel',
      cellEditorParams: {
        rules: 'required|string|between:1,25',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Travel History Time frame',
      field: 'travelHistoryTimeframe',
      cellEditorParams: {
        rules: 'numeric',
      },
    },
    {
      headerName: 'Link',
      field: 'link',
      cellRenderer: 'agGridLink',
      cellEditorParams: {
        rules: 'required|string|between:1,200|url',
        ignoreNumber: true,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)) },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        isEditable: props.isEditable,
        hideActionButtons: !props.isEditable,
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => props.isEditable,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!props.isEditable) {
          return;
        }
        props.onRowEdit(true);
        agGrid._startEditingCell(rowIndex as number, colDef.field || '');
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        props.onRowEdit(true);
      },
    };
  };

  /* istanbul ignore next */
  const addNewRecord = (): void => {
    const model = new CountryLevelExclusionModel({ id: 0, entityState: ENTITY_STATE.NEW });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'countryLevel' });
    gridState.setHasError(true);
  };

  const saveRecord = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const cancelEditing = (rowIndex: number): void => {
    const data: CountryLevelExclusionModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.NEW);
    props.onRowEdit(false);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  const confirmDeleteRecord = (rowIndex: number): void => {
    _useConfirmDialog.confirmAction(
      () => {
        deleteRecord(rowIndex), ModalStore.close();
      },
      {
        title: 'Confirm Delete',
        isDelete: true,
      }
    );
  };

  /* istanbul ignore next */
  const deleteRecord = (rowIndex: number): void => {
    ModalStore.close();
    const model: CountryLevelExclusionModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new CountryLevelExclusionModel({
            ...requirement,
            id: requirement.id || Utilities.getTempId(true),
            entityState: ENTITY_STATE.MODIFIED,
          })
      )
    );
    props.onRowEdit(false);
    props.onDataUpdate(gridState.data);
  };

  return (
    <CollapsibleWithButton
      title="Links*"
      buttonText="Add"
      isButtonDisabled={gridState.isProcessing || gridState.isRowEditing || !props.isEditable}
      onButtonClick={addNewRecord}
    >
      <ChildGridWrapper>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.rowData}
          gridOptions={gridOptions()}
          disablePagination={gridState.isRowEditing}
          key={`CountryLevelExclusionGrid-${props.isEditable}`}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
};

export default observer(CountryLevelExclusion);
