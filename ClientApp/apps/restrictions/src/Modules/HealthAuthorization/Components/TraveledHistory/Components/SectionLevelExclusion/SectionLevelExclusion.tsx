import React, { FC } from 'react';
import {
  ColDef,
  GridOptions,
  RowEditingStartedEvent,
  ValueFormatterParams,
  ICellEditorParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SettingsStore, SectionLevelExclusionModel, TraveledHistorySubCategoryModel } from '../../../../../Shared';
import { ENTITY_STATE, Utilities, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { observable } from 'mobx';
import { forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface Props {
  isEditable: boolean;
  rowData: SectionLevelExclusionModel[];
  onDataUpdate: (sectionLevelExclusions: SectionLevelExclusionModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
  settingsStore?: SettingsStore;
  countryLevel: string;
}

const SectionLevelExclusion: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<any, SectionLevelExclusionModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _settingsStore = props.settingsStore as SettingsStore;
  const unsubscribe = useUnsubscribe();
  const _observable = observable<any>({
    subCategoryOptions: [] as TraveledHistorySubCategoryModel[],
  });

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
      headerName: 'Country',
      field: 'countryLevel',
      minWidth: 60,
      cellEditorParams: {
        rules: 'required|string|between:1,250',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Traveller Type',
      field: 'travellerType',
      minWidth: 60,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Traveller Type',
        getAutoCompleteOptions: () => _settingsStore?.travellerTypes,
      },
    },
    {
      headerName: 'Vaccination Status',
      field: 'vaccinationStatus',
      minWidth: 60,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Vaccination Status',
        getAutoCompleteOptions: () => _settingsStore?.vaccinationStatus,
      },
    },
    {
      headerName: 'Category',
      field: 'traveledHistoryCategory',
      minWidth: 60,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Category',
        getAutoCompleteOptions: () => _settingsStore?.traveledHistoryCategories,
      },
    },
    {
      headerName: 'Sub Category',
      field: 'traveledhistorySubCategory',
      minWidth: 60,
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Sub Category',
        getAutoCompleteOptions: () => _observable.subCategoryOptions,
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
      headerName: 'Notes',
      field: 'notes',
      minWidth: 300,
      cellRenderer: 'customTextAreaEditor',
      cellRendererParams: {
        readOnly: true,
        editorType: EDITOR_TYPES.RICH_TEXT_EDITOR,
      },
      cellEditorParams: {
        rules: 'required|string|between:1,200',
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

  const onInputChange = ({ colDef }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef }: ICellEditorParams, value): void => {
    if (colDef.field === 'traveledHistoryCategory') {
      const subCategoryInstance: any = gridState.gridApi.getCellEditorInstances({
        columns: [ 'traveledhistorySubCategory' ],
      });
      subCategoryInstance[0].getFrameworkComponentInstance().setValue(null);
      const _options = _settingsStore?.traveledHistorySubCategories.filter(
        x => x.category?.id === value?.id
      ) as TraveledHistorySubCategoryModel[];
      _observable.subCategoryOptions = _options;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      _settingsStore.getTravellerTypes(),
      _settingsStore.getVaccinationStatus(),
      _settingsStore.getTraveledHistoryCategories(),
      _settingsStore.getTraveledHistorySubCategories(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
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
        loadSettingsData();
      },
    };
  };

  /* istanbul ignore next */
  const addNewRecord = (): void => {
    const { countryLevel } = props;
    const model = new SectionLevelExclusionModel({ id: 0, entityState: ENTITY_STATE.NEW, countryLevel });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'countryLevel' });
    gridState.setHasError(true);
  };

  const saveRecord = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const cancelEditing = (rowIndex: number): void => {
    const data: SectionLevelExclusionModel = agGrid._getTableItem(rowIndex);
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
    const model: SectionLevelExclusionModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new SectionLevelExclusionModel({
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
      title="Requirements"
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
          key={`SectionLevelExclusionGrid-${props.isEditable}`}
        />
      </ChildGridWrapper>
    </CollapsibleWithButton>
  );
};

export default inject('settingsStore')(observer(SectionLevelExclusion));
