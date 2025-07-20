import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowEditingStartedEvent, GridReadyEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { PreTravelTestDetailModel } from '../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
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
  rowData: PreTravelTestDetailModel[];
  onDataUpdate: (formRequirements: PreTravelTestDetailModel[]) => void;
  // settingsStore?: SettingsStore;
  onRowEdit: (isRowEditing: boolean) => void;
}

const PreTravelTestDetailGrid: FC<Props> = ({ ...props }) => {
  const alertMessageId: string = 'EntryFormRequirementGrid';
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<any, PreTravelTestDetailModel>([], gridState);
  const { settingsStore } = useExitRequirementBase(props);
  const _useConfirmDialog = useConfirmDialog();

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  useEffect(() => {
    UIStore.setPageLoader(true);
    forkJoin([ settingsStore.getTestTypes(), settingsStore.getLeadTimeIndicators() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
    return () => props.onRowEdit(false);
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
      headerName: 'Type of Test',
      field: 'testType',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Type of Test',
        getAutoCompleteOptions: () => settingsStore.testTypes,
        valueGetter: (option: SettingsTypeModel) => option.name,
      },
    },
    {
      headerName: 'Lead Time(Hrs)',
      field: 'leadTime',
      cellEditorParams: {
        validators: ({ field, form }) => {
          return [ Boolean(field.value) ? regex.numberOnly.test(field.value) : true, 'Please enter valid integer' ];
        },
      },
    },
    {
      headerName: 'Before Departure or Arrival',
      field: 'leadTimeIndicator',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Type of Test',
        getAutoCompleteOptions: () => settingsStore.leadTimeIndicators,
        valueGetter: (option: SettingsTypeModel) => option.name,
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
        // agGrid.setColumnVisible('actionRenderer', props.isEditable);
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
    const formRequirement = new PreTravelTestDetailModel({ id: 0 });
    agGrid.addNewItems([ formRequirement ], { startEditing: false, colKey: 'testType' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const saveRequirement = (rowIndex: number): void => {
    const data: PreTravelTestDetailModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data, rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: PreTravelTestDetailModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    props.onRowEdit(false);
  };

  const isAlreadyExists = (data: PreTravelTestDetailModel, rowIndex: number): boolean => {
    const testType = agGrid.getCellEditorInstance('testType').getValue();
    gridState.setGridData([ ...props.rowData ]);
    const isExists = gridState.data.some(testDetail => {
      return Utilities.isEqual(testDetail.testType?.id, testType.id) && !testDetail.isIdExist(data);
    });
    if (isExists) {
      agGrid.showAlert('Type of Test should be unique.', alertMessageId);
    }
    return isExists;
  };

  const confirmRemoveRequirement = (rowIndex: number): void => {
    const model: PreTravelTestDetailModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      agGrid._removeTableItems([ model ]);
      updateTableData();
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteRequirement(rowIndex), {});
  };

  const deleteRequirement = (rowIndex: number): void => {
    ModalStore.close();
    const model: PreTravelTestDetailModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new PreTravelTestDetailModel({
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
    <ChildGridWrapper hasAddPermission={isEditable} disabled={gridState.hasError} onAdd={addNewRequirement}>
      <CustomAgGridReact rowData={rowData} gridOptions={gridOptions()} disablePagination={gridState.isRowEditing} />
    </ChildGridWrapper>
  );
};

export default inject('settingsStore')(observer(PreTravelTestDetailGrid));
