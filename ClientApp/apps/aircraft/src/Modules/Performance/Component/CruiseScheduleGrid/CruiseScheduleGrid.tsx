import React, { FC, useEffect, useState } from 'react';
import { Utilities, ENTITY_STATE, SettingsTypeModel, GRID_ACTIONS, UIStore } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  ValueFormatterParams,
  RowEditingStartedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CruisePolicyScheduleModel, CruiseScheduleModel, useAircraftModuleSecurity } from '../../../Shared';
import { Typography } from '@material-ui/core';
import { useStyles } from './CruiseScheduleGrid.styles';
import { ChildGridWrapper, CollapsibleWithButton } from '@wings-shared/layout';
import { CustomAgGridReact, ICellInstance, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  isEditable?: boolean;
  rowData: CruisePolicyScheduleModel[];
  policyList: CruiseScheduleModel[];
  onDataSave: (response: CruisePolicyScheduleModel[]) => void;
  onRowEdit: (isEditing: boolean) => void;
  title: string;
}

const CruiseScheduleGrid: FC<Props> = ({ isEditable, rowData, policyList, onDataSave, onRowEdit, title }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', CruisePolicyScheduleModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const [ isNewRecordBeingAdded, setIsNewRecordBeingAdded ] = useState(false);
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
        upsertSchedule(rowIndex);
        onRowEdit(false);
        break;
      case GRID_ACTIONS.CANCEL:
        cancelEditing(rowIndex);
        onRowEdit(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveSchedule(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        onRowEdit(false);
        break;
    }
  };

  const addNewSchedule = (): void => {
    setIsNewRecordBeingAdded(true); 
    agGrid.addNewItems([ new CruisePolicyScheduleModel() ], { startEditing: false, colKey: 'schedule' });
    gridState.setHasError(true);
  };

  const confirmRemoveSchedule = (rowIndex: number): void => {
    const model: CruisePolicyScheduleModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteSchedule(model);
      return;
    }
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        deleteSchedule(model);
      },
      {
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove this schedule?',
      }
    );
  };

  const onDropDownChange = ({ colDef }: ICellEditorParams, value: CruiseScheduleModel): void => {
    if (Utilities.isEqual(colDef.field || '', 'schedule')) {
      const descInstance: ICellInstance = agGrid.getComponentInstance('description');
      descInstance.setValue(value?.description || '');
      agGrid.getComponentInstance('navBlueSchedule').setValue(value?.navBlueSchedule || '');
      agGrid.getComponentInstance('uvGoSchedule').setValue(value?.navBlueSchedule || '');
      agGrid.getComponentInstance('foreFlightSchedule').setValue(value?.navBlueSchedule || '');
      agGrid.getComponentInstance('collinsSchedule').setValue(value?.navBlueSchedule || '');
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const profileDropDownOption = (): CruiseScheduleModel[] => {
    return policyList.filter(schedule => !rowData.some(policy => policy.schedule.id === schedule.id));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Schedule',
      field: 'schedule',
      cellEditor: 'customAutoComplete',
      sort: 'asc',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Schedule',
        getAutoCompleteOptions: () => profileDropDownOption(),
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'NavBlue Schedule',
      field: 'navBlueSchedule',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'uvGO Schedule',
      field: 'uvGoSchedule',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'ForeFlight Schedule',
      field: 'foreFlightSchedule',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'Collins Schedule',
      field: 'collinsSchedule',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'Default',
      field: 'isDefault',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      cellEditor: 'checkBoxRenderer',
      maxWidth: 130,
    },
    {
      ...agGrid.actionColumn({
        maxWidth: 130,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange,
      },
      columnDefs: columnDefs,
      isEditable: aircraftModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => isEditable,
        getDeleteDisabledState: (schedule: CruisePolicyScheduleModel) => schedule.isDefault,
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
  const cancelEditing = (rowIndex: number): void => {
    const data: CruisePolicyScheduleModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    setIsNewRecordBeingAdded(false);
  };

  /* istanbul ignore next */
  const upsertSchedule = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const data = agGrid._getTableItem(rowIndex);
    const gridData = agGrid._getAllTableRows();
    if (gridData?.length === 1) {
      data.isDefault = true;
    }
    gridState.setGridData(
      gridData.map((schedule, i) => {
        const index = gridData.findIndex(a => a.schedule.id === data.schedule.id);
        const isDefault = data.isDefault ? i === index : schedule.isDefault;
        return new CruisePolicyScheduleModel({ ...schedule, isDefault, entityState: ENTITY_STATE.NEW });
      })
    );
    gridState.gridApi.redrawRows();
    setIsNewRecordBeingAdded(false);
    onDataSave(gridState.data);
  };

  /* istanbul ignore next */
  const deleteSchedule = (model: CruisePolicyScheduleModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    gridState.setGridData(agGrid._getAllTableRows());
    onDataSave(gridState.data);
  };

  const defaultTitle = (): string => {
    const defaultSchedule = rowData.find(x => x.isDefault)?.schedule;
    return defaultSchedule ? `(${defaultSchedule.label})` : '';
  };

  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title={title}
        buttonText={`Add ${title}`}
        isButtonDisabled={
          isNewRecordBeingAdded || UIStore.pageLoading || !(aircraftModuleSecurity.isEditable && isEditable)
        }
        onButtonClick={() => addNewSchedule()}
        titleChildren={<Typography className={classes.defaultWrapper}>{defaultTitle()}</Typography>}
      >
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={rowData}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </CollapsibleWithButton>
    </div>
  );
};

export default CruiseScheduleGrid;
