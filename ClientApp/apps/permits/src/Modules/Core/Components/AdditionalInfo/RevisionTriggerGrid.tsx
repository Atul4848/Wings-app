import React, { FC, useEffect } from 'react';
import { GridOptions, ColDef, RowEditingStartedEvent } from 'ag-grid-community';
import {
  AgGridActions,
  AgGridAutoComplete,
  AgGridCellEditor,
  AgGridMasterDetails,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
  AgGridChipView,
} from '@wings-shared/custom-ag-grid';
import { PermitSettingsStore, PermitStore, RevisionTriggerModel, usePermitModuleSecurity } from '../../../Shared';
import { UIStore, Utilities, GRID_ACTIONS, SettingsTypeModel, EntityMapModel } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props {
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  isEditable?: boolean;
  onRowEditingChange: (isRowEditing: boolean) => void;
  permitAdditionalInfoRevisions: RevisionTriggerModel[];
  onDataSave: (revisions: RevisionTriggerModel[]) => void;
}

const RevisionTriggerGrid: FC<Props> = ({
  isEditable,
  permitAdditionalInfoRevisions,
  onDataSave,
  onRowEditingChange,
  ...props
}) => {
  const defaultColKey: string = 'missionElement';
  const gridState = useGridState();
  const agGrid = useAgGrid<'', RevisionTriggerModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _permitStore = props.permitStore as PermitStore;
  const _permitSettingsStore = props.permitSettingsStore as PermitSettingsStore;
  const permitModuleSecurity = usePermitModuleSecurity();

  useEffect(() => {
    loadInitialData();
  }, [ _permitStore.permitDataModel, permitAdditionalInfoRevisions ]);

  const loadInitialData = () => {
    gridState.setGridData(permitAdditionalInfoRevisions);
  };

  const addRevisionTrigger = (): void => {
    const dataModel = new RevisionTriggerModel({ id: 0 });
    agGrid.addNewItems([ dataModel ], { startEditing: false, colKey: defaultColKey });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const upsertRevisionTrigger = (): void => {
    gridState.gridApi.stopEditing();
    const revisionsData = agGrid._getAllTableRows().map(
      revision =>
        new RevisionTriggerModel({
          ...revision,
          id: revision.id,
          permitAdditionalInfoId: _permitStore.permitDataModel?.permitAdditionalInfo?.id,
        })
    );
    gridState.setGridData(revisionsData);
    onDataSave(gridState.data);
  };

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _permitSettingsStore.getMissionElement(), _permitSettingsStore.getDataElement() ])
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
        agGrid._startEditingCell(rowIndex, defaultColKey);
        break;
      case GRID_ACTIONS.SAVE:
        upsertRevisionTrigger();
        onRowEditingChange(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        onRowEditingChange(false);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Mission Element',
      field: 'missionElement',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        placeHolder: 'Mission Element*',
        isRequired: true,
        getAutoCompleteOptions: () => _permitSettingsStore.missionElements,
      },
    },
    {
      headerName: 'Data Element Required',
      field: 'dataElements',
      cellRenderer: 'agGridChipView',
      sortable: false,
      filter: false,
      minWidth: 250,
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        displayKey: 'name',
        placeHolder: 'Select Data Element',
        multiSelect: true,
        disableCloseOnSelect: true,
        limitTags: () => 1,
        getAutoCompleteOptions: () => _permitSettingsStore.dataElements,
      },
    },
    {
      headerName: 'Process',
      field: 'process',
      cellEditorParams: {
        rules: 'max:500',
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !permitModuleSecurity.isEditable,
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
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: true,
      suppressRowClickSelection: true,
      suppressClickEdit: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        onRowEditingChange(true);
        loadSettingsData();
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
        agGridChipView: AgGridChipView,
      },
    };
  };

  return (
    <AgGridMasterDetails
      addButtonTitle="Add Revision Trigger Process"
      onAddButtonClick={() => addRevisionTrigger()}
      hasAddPermission={permitModuleSecurity.isEditable}
      disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
      key={`master-details-${isEditable}`}
    >
      <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
    </AgGridMasterDetails>
  );
};

export default inject('permitStore', 'permitSettingsStore')(observer(RevisionTriggerGrid));
