import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowEditingStartedEvent, GridReadyEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { EntryFormRequirementModel } from '../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SettingsStore } from '../../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import {
  ENTITY_STATE,
  UIStore,
  Utilities,
  regex,
  SettingsTypeModel,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ChildGridWrapper } from '@wings-shared/layout';
import {
  AgGridActions,
  AgGridAutoComplete,
  AgGridCellEditor,
  AgGridLinkView,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import useExitRequirementBase from '../../ExitRequirement/ExitRequirementBase';

interface Props {
  isEditable: boolean;
  rowData: EntryFormRequirementModel[];
  onDataUpdate: (formRequirements: EntryFormRequirementModel[]) => void;
  settingsStore?: SettingsStore;
  onRowEdit: (isRowEditing: boolean) => void;
}

const EntryFormRequirementGrid: FC<Props> = ({ ...props }) => {
  const alertMessageId: string = 'EntryFormRequirementGrid';
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<any, EntryFormRequirementModel>([], gridState);
  const { settingsStore } = useExitRequirementBase(props);
  const _useConfirmDialog = useConfirmDialog();

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  useEffect(() => {
    loadHealthForms();
    return () => props.onRowEdit(false);
  }, []);

  /* istanbul ignore next */
  const loadHealthForms = () => {
    UIStore.setPageLoader(true);
    forkJoin([ settingsStore.getHealthForms(), settingsStore.getAccessLevels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
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
        saveRequirement(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        canceEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRequirement(rowIndex);
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
      headerName: 'Health Form',
      field: 'healthForm',
      cellEditor: 'customAutoComplete',
      filter: false,
      maxWidth: 200,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Health Form',
        getAutoCompleteOptions: () => settingsStore.healthForms,
        valueGetter: (option: SettingsTypeModel) => option.name,
      },
    },
    {
      headerName: 'Form Lead Time(Hrs)',
      field: 'leadTime',
      maxWidth: 200,
      cellEditorParams: {
        validators: ({ field, form }) => {
          return [ Boolean(field.value) ? regex.numberOnly.test(field.value) : true, 'Please enter valid integer' ];
        },
      },
    },
    {
      headerName: 'Form Instruction',
      field: 'instructions',
      minWidth: 250,
      cellEditorParams: {
        rules: 'required|string|between:1,1000',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Link',
      field: 'healthFormLink',
      minWidth: 250,
      cellRenderer: 'viewRenderer',
      cellEditorParams: {
        rules: 'string|between:1,200|url',
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
        getAutoCompleteOptions: () => settingsStore?.accessLevels,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 130,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      suppressMenu: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: {
        isEditable: props.isEditable,
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => props.isEditable,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
        viewRenderer: AgGridLinkView,
      },
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
      },
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!props.isEditable) {
          return;
        }
        agGrid._startEditingCell(rowIndex as number, colDef.field || '');
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        props.onRowEdit(true);
      },
    };
  };

  const addNewRequirement = (): void => {
    const formRequirement = new EntryFormRequirementModel({ id: 0 });
    agGrid.addNewItems([ formRequirement ], { startEditing: false, colKey: 'healthForm' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const saveRequirement = (rowIndex: number): void => {
    const data: EntryFormRequirementModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data, rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: EntryFormRequirementModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    props.onRowEdit(false);
  };

  const isAlreadyExists = (data: EntryFormRequirementModel, rowIndex: number): boolean => {
    const healthForm = agGrid.getCellEditorInstance('healthForm').getValue();
    const instructions = agGrid.getCellEditorInstance('instructions').getValue();
    gridState.setGridData([ ...props.rowData ]);
    const isExists = gridState.data.some(entryForm => {
      return (
        Utilities.isEqual(entryForm.healthForm.id, healthForm.id) &&
        Utilities.isEqual(entryForm.instructions, instructions) &&
        !entryForm.isIdExist(data)
      );
    });
    if (isExists) {
      agGrid.showAlert('Health Form and Form Instructions should be unique.', alertMessageId);
    }
    return isExists;
  };

  const confirmRemoveRequirement = (rowIndex: number): void => {
    const model: EntryFormRequirementModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      agGrid._removeTableItems([ model ]);
      updateTableData();
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteRequirement(rowIndex), {});
  };

  const deleteRequirement = (rowIndex: number): void => {
    ModalStore.close();
    const model: EntryFormRequirementModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new EntryFormRequirementModel({
            ...requirement,
            id: requirement.id || Utilities.getTempId(true),
            entityState: ENTITY_STATE.NEW,
          })
      )
    );
    props.onDataUpdate(gridState.data);
    props.onRowEdit(false);
  };

  const { isEditable, rowData } = props;
  return (
    <ChildGridWrapper hasAddPermission={isEditable} disabled={gridState.hasError} onAdd={addNewRequirement}>
      <CustomAgGridReact rowData={rowData} gridOptions={gridOptions()} disablePagination={gridState.isRowEditing} />
    </ChildGridWrapper>
  );
};

export default inject('settingsStore')(observer(EntryFormRequirementGrid));
