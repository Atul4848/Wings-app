import React, { FC } from 'react';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowEditingStartedEvent,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { HealthAuthorizationNOTAMModel } from '../../../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { HealthAuthStore } from '../../../../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  ENTITY_STATE,
  UIStore,
  Utilities,
  SelectOption,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  isEditable: boolean;
  rowData: HealthAuthorizationNOTAMModel[];
  onDataUpdate: (formRequirements: HealthAuthorizationNOTAMModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
  healthAuthStore?: HealthAuthStore;
}

const HealthAuthorizationNOTAMGrid: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<any, HealthAuthorizationNOTAMModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveRequirement(rowIndex);
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
  const searchAirports = (propertyValue: string): void => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      ?.getWingsAirport(propertyValue)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'NOTAM Number',
      field: 'notamNumber',
      minWidth: 250,
      cellEditorParams: {
        rules: 'string|between:0,50',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Affected ICAO',
      field: 'affectedICAO',
      minWidth: 250,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _healthAuthStore?.wingsAirports,
        onSearch: value => searchAirports(value),
        valueGetter: (option: SelectOption) => option.value,
      },
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      cellEditor: 'customTimeEditor',
      headerTooltip: 'Modified Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.modifiedOn, DATE_FORMAT.API_DATE_FORMAT),
      cellEditorParams: {
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        allowKeyboardInput: false,
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
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
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
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
      },
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
    const healthAuthLink = new HealthAuthorizationNOTAMModel({ id: 0, entityState: ENTITY_STATE.NEW });
    agGrid.addNewItems([ healthAuthLink ], { startEditing: false, colKey: 'notamNumber' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const saveRequirement = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const cancelEditing = (rowIndex: number): void => {
    const data: HealthAuthorizationNOTAMModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.NEW);
    props.onRowEdit(false);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  const confirmDeleteRecord = (rowIndex: number): void => {
    _useConfirmDialog.confirmAction(
      () => {
        deleteRequirement(rowIndex), ModalStore.close();
      },
      {
        title: 'Confirm Delete',
        isDelete: true,
      }
    );
  };

  /* istanbul ignore next */
  const deleteRequirement = (rowIndex: number): void => {
    ModalStore.close();
    const model: HealthAuthorizationNOTAMModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid
        ._getAllTableRows()
        .map(requirement => new HealthAuthorizationNOTAMModel({ ...requirement, entityState: ENTITY_STATE.MODIFIED }))
    );
    props.onRowEdit(false);
    props.onDataUpdate(gridState.data);
  };

  return (
    <CollapsibleWithButton
      title="NOTAM"
      buttonText="Add"
      isButtonDisabled={gridState.isRowEditing || UIStore.pageLoading || !props.isEditable}
      onButtonClick={addNewRecord}
    >
      <ChildGridWrapper hasAddPermission={false}>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.rowData}
          gridOptions={gridOptions()}
          disablePagination={gridState.isRowEditing}
          key={`HealthAuthorizationNOTAMGrid-${props.isEditable}`}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
};

export default inject('healthAuthStore')(observer(HealthAuthorizationNOTAMGrid));
