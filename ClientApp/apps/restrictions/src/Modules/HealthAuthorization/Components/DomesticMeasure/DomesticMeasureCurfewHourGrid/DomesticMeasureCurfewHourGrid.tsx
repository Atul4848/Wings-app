import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowEditingStartedEvent, GridReadyEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { DomesticMeasureCurfewHourModel } from '../../../../Shared/Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  ENTITY_STATE,
  UIStore,
  Utilities,
  SettingsTypeModel,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { ChildGridWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import useDomesticMeasure, { BaseProps } from '../DomesticMeasureBase';

interface Props extends BaseProps {
  isEditable: boolean;
  rowData: DomesticMeasureCurfewHourModel[];
  onDataUpdate: (curfewHour: DomesticMeasureCurfewHourModel[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
}

const DomesticMeasureCurfewHourGrid: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const agGrid = useAgGrid<any, DomesticMeasureCurfewHourModel>([], gridState);
  const { _settingsStore } = useDomesticMeasure(props);

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
  }, [ props.isEditable ]);

  /* istanbul ignore next */
  useEffect(() => {
    loadCurfewHours();
  }, []);

  /* istanbul ignore next */
  const loadCurfewHours = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getCurfewHourTypes()
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
        saveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        canceEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      default:
        gridState.gridApi?.stopEditing(true);
        props.onRowEdit(false);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Curfew Hours Type',
      field: 'curfewHourType',
      cellEditor: 'customAutoComplete',
      filter: false,
      maxWidth: 200,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'curfew Hour Type',
        getAutoCompleteOptions: () => _settingsStore.curfewHourTypes,
        valueGetter: (option: SettingsTypeModel) => option.name,
      },
    },
    {
      headerName: 'Curfew Details',
      field: 'curfewDetails',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Curfew Time Frame',
      field: 'curfewTimeFrame',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },

    {
      headerName: 'Curfew Expiration Date',
      field: 'curfewExpirationDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      cellEditorParams: {
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
      },
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
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
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
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
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
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

  const addNewRecord = (): void => {
    const formRequirement = new DomesticMeasureCurfewHourModel();
    agGrid.addNewItems([ formRequirement ], { startEditing: false, colKey: 'curfewHourType' });
    gridState.setHasError(true);
  };

  const saveRecord = (rowIndex: number) => {
    gridState.gridApi?.stopEditing();
    updateTableData();
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: DomesticMeasureCurfewHourModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual(data?.entityState || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
    props.onRowEdit(false);
  };

  const confirmRemoveRecord = (rowIndex: number): void => {
    const model: DomesticMeasureCurfewHourModel = agGrid._getTableItem(rowIndex);
    if (model?.id === 0) {
      agGrid._removeTableItems([ model ]);
      updateTableData();
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteRecord(rowIndex), {
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this Record?',
    });
  };

  const deleteRecord = (rowIndex: number): void => {
    ModalStore.close();
    const model: DomesticMeasureCurfewHourModel = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.setGridData(
      agGrid
        ._getAllTableRows()
        ?.map(requirement => new DomesticMeasureCurfewHourModel({ ...requirement, entityState: ENTITY_STATE.NEW }))
    );
    props.onDataUpdate(gridState.data);
    props.onRowEdit(false);
  };

  const { isEditable, rowData } = props;
  return (
    <ChildGridWrapper hasAddPermission={isEditable} disabled={gridState.isRowEditing} onAdd={addNewRecord}>
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={rowData}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
        key={`domesticMeasureCrurfewHourGrid-${isEditable}`}
      />
    </ChildGridWrapper>
  );
};

export default inject('settingsStore')(observer(DomesticMeasureCurfewHourGrid));
