import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, RowEditingStartedEvent, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { HealthAuthorizationLinkModel } from '../../../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SettingsStore } from '../../../../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { ENTITY_STATE, UIStore, Utilities, SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  isEditable: boolean;
  rowData: HealthAuthorizationLinkModel[];
  onDataUpdate: (formRequirements: HealthAuthorizationLinkModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
  settingsStore?: SettingsStore;
}

const HealthAuthLinkGrid: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<any, HealthAuthorizationLinkModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getAccessLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }, []);

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
  const columnDefs: ColDef[] = [
    {
      headerName: 'Link',
      field: 'link',
      minWidth: 250,
      cellRenderer: 'agGridLink',
      cellEditorParams: {
        rules: 'required|string|between:1,500|url',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      minWidth: 250,
      cellEditorParams: {
        rules: 'string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: SettingsTypeModel) => option,
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
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!props.isEditable) {
          return;
        }
        props.onRowEdit(true);
        agGrid._startEditingCell(Number(rowIndex), colDef.field || '');
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        props.onRowEdit(true);
      },
    };
  };

  /* istanbul ignore next */
  const addNewRecord = (): void => {
    const healthAuthLink = new HealthAuthorizationLinkModel({ id: 0, entityState: ENTITY_STATE.NEW });
    agGrid.addNewItems([ healthAuthLink ], { startEditing: false, colKey: 'link' });
    gridState.setHasError(true);
  };

  const isAlreadyExists = (data: HealthAuthorizationLinkModel): boolean => {
    const value = agGrid.getCellEditorInstance('link').getValue();
    const healthAuthLinks = [ ...props.rowData ];
    const isExists = healthAuthLinks.some(healthAuthLink => {
      return Utilities.isEqual(healthAuthLink.link, value) && !healthAuthLink.isIdExist(data);
    });
    if (isExists) {
      agGrid.showAlert('Link should be unique.', 'healthAuthLinkId');
    }
    return isExists;
  };

  /* istanbul ignore next */
  const saveRequirement = (rowIndex: number): void => {
    const data: HealthAuthorizationLinkModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const cancelEditing = (rowIndex: number): void => {
    const data: HealthAuthorizationLinkModel = agGrid._getTableItem(rowIndex);
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
    const model: HealthAuthorizationLinkModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid
        ._getAllTableRows()
        .map(requirement => new HealthAuthorizationLinkModel({ ...requirement, entityState: ENTITY_STATE.MODIFIED }))
    );
    props.onRowEdit(false);
    props.onDataUpdate(gridState.data);
  };

  return (
    <CollapsibleWithButton
      title="Links"
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
          key={`HealthAuthLinkGrid-${props.isEditable}`}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
};

export default inject('settingsStore')(observer(HealthAuthLinkGrid));
