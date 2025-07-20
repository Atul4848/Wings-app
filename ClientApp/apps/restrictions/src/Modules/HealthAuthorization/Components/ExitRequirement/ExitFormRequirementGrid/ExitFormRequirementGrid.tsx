/* eslint-disable max-len */
import React, { FC, useEffect } from 'react';
import {
  ColDef,
  GridOptions,
  RowEditingStartedEvent,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ExitFormRequirementModel } from '../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SettingsStore } from '../../../../Shared';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ENTITY_STATE, IClasses, UIStore, Utilities, regex, SettingsTypeModel, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
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
import useExitRequirementBase from '../ExitRequirementBase';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  classes?: IClasses;
  isEditable: boolean;
  rowData: ExitFormRequirementModel[];
  onDataUpdate: (formRequirements: ExitFormRequirementModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
  settingsStore?: SettingsStore;
}

const ExitFormRequirementGrid: FC<Props> = ({ ...props }) => {
  const alertMessageId: string = 'ExitFormRequirementGrid';
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<any, ExitFormRequirementModel>([], gridState);
  const { settingsStore } = useExitRequirementBase(props);
  const _useConfirmDialog = useConfirmDialog();

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  useEffect(() => {
    loadHealthForms();
    return () => {
      props.onRowEdit(false);
    };
  }, []);

  /* istanbul ignore next */
  const loadHealthForms = (): void => {
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
      field: 'formLeadTime',
      cellEditorParams: {
        validators: ({ field, form }) => {
          return [ Boolean(field.value) ? regex.numberOnly.test(field.value) : true, 'Please enter valid integer' ];
        },
      },
    },
    {
      headerName: 'Form Instruction',
      field: 'formInstructions',
      cellEditorParams: {
        rules: 'required|string|between:1,500',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Link',
      field: 'link',
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

  /* istanbul ignore next */
  const addNewRequirement = (): void => {
    const formRequirement = new ExitFormRequirementModel({ id: 0 });
    agGrid.addNewItems([ formRequirement ], { startEditing: false, colKey: 'healthForm' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const saveRequirement = (rowIndex: number): void => {
    const data: ExitFormRequirementModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data, rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const isAlreadyExists = (data: ExitFormRequirementModel, rowIndex: number): boolean => {
    const healthForm = agGrid.getCellEditorInstance('healthForm')?.getValue();
    const formInstructions = agGrid.getCellEditorInstance('formInstructions')?.getValue();
    gridState.setGridData([ ...props.rowData ]);
    const isExists = gridState.data.some(exitForm => {
      return (
        Utilities.isEqual(exitForm.healthForm?.id, healthForm?.id) &&
        Utilities.isEqual(exitForm.formInstructions, formInstructions) &&
        !exitForm.isIdExist(data)
      );
    });
    if (isExists) {
      agGrid.showAlert('Health Form and Form Instructions should be unique.', alertMessageId);
    }
    return isExists;
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: ExitFormRequirementModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    props.onRowEdit(false);
  };

  /* istanbul ignore next */
  const confirmRemoveRequirement = (rowIndex: number): void => {
    const model: ExitFormRequirementModel = agGrid._getTableItem(rowIndex);
    if (model?.id === 0) {
      agGrid._removeTableItems([ model ]);
      updateTableData();
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteRequirement(rowIndex), {
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this Requirement?',
    });
  };

  const deleteRequirement = (rowIndex: number): void => {
    ModalStore.close();
    const model: ExitFormRequirementModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  /* istanbul ignore next */
  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new ExitFormRequirementModel({
            ...requirement,
            id: requirement?.id || Utilities.getTempId(true),
            entityState: ENTITY_STATE.NEW,
          })
      )
    );
    props.onDataUpdate(gridState.data);
    props.onRowEdit(false);
  };

  const { isEditable, rowData } = props;
  return (
    <ChildGridWrapper hasAddPermission={isEditable} disabled={gridState.isRowEditing} onAdd={addNewRequirement}>
      <CustomAgGridReact rowData={rowData} gridOptions={gridOptions()} disablePagination={gridState.isRowEditing} />
    </ChildGridWrapper>
  );
};

export default inject('settingsStore')(observer(ExitFormRequirementGrid));
