import React, { FC, useEffect } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, GRID_ACTIONS, DATE_FORMAT, DATE_TIME_PICKER_TYPE } from '@wings-shared/core';
import { observer } from 'mobx-react';
import { EngineSerialNumberModel, useAircraftModuleSecurity } from '../../../Shared';
import { useStyles } from './AirframeEditor.style';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  onDataSave: (response: EngineSerialNumberModel[]) => void;
  engineSerialNumbers?: EngineSerialNumberModel[];
  isEngineDetailsExist?: boolean;
  onRowEditing: (isEditing: boolean) => void;
}

const AirframeEngineGrid: FC<Props> = ({
  isEditable,
  onDataSave,
  engineSerialNumbers,
  isEngineDetailsExist,
  onRowEditing,
}: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', EngineSerialNumberModel>([], gridState);
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, [ engineSerialNumbers ]);

  /* istanbul ignore next */
  const loadInitialData = () => {
    gridState.setGridData(engineSerialNumbers || []);
  };

  const addEngineSerialNumber = (): void => {
    const engineSerialNumberModel = new EngineSerialNumberModel({ id: 0, temporaryEngineDate: '' });
    const colKey: string = 'serialNumber';
    agGrid.addNewItems([ engineSerialNumberModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    const colId: string = params.column.getColId();
    if (Utilities.isEqual(colId, 'serialNumber') && value.length > 20) {
      const message = 'First 20 characters will integrate to Oracle';
      agGrid.showAlert(message, 'airframeEngineSerialNumber');
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    const editorInstance = gridState.gridApi.getCellEditorInstances({ columns: [ 'serialNumber' ] });
    const value = editorInstance[0].getValue();
    const isDuplicateData = gridState.data?.some(a =>
      id ? a.serialNumber === value && id !== a.id : a.serialNumber === value
    );
    if (isDuplicateData) {
      agGrid.showAlert('Enginer Serial Number should be unique.', 'EnginerSerialNumberService');
      return true;
    }
    return false;
  };

  const updateTableData = (rowIndex): void => {
    const model = agGrid._getTableItem(rowIndex);

    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    onDataSave(data);
  };

  const upsertEngine = (rowIndex: number): void => {
    updateTableData(rowIndex);
  };

  const deleteEngine = (model: EngineSerialNumberModel): void => {
    agGrid._removeTableItems([ model ]);
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    onDataSave(data);
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
        upsertEngine(rowIndex);
        onRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        const model: EngineSerialNumberModel = agGrid._getTableItem(rowIndex);
        agGrid.cancelEditing(rowIndex);
        if (model.id === 0) {
          deleteEngine(model);
          return;
        }
        onRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Engine Serial Number',
      field: 'serialNumber',
      cellEditorParams: {
        rules: 'required|string|between:0,50',
      },
    },
    {
      headerName: 'Temporary Engine',
      field: 'isTemporaryEngine',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Temporary Engine Date',
      field: 'temporaryEngineDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        placeHolder: 'Temporary Engine Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
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
      context: { onInputChange },
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
      suppressCellSelection: true,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        onRowEditing(true);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add Engine Information"
        infoMessage={
          !Boolean(engineSerialNumbers.length) &&
          'Please select Aircraft Variation first to enable Engine Information table.'
        }
        onAddButtonClick={() => addEngineSerialNumber()}
        hasAddPermission={aircraftModuleSecurity.isEditable}
        disabled={
          !isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading || !isEngineDetailsExist
        }
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact
          gridOptions={gridOptions()}
          rowData={gridState.data}
          isRowEditing={gridState.isRowEditing}
          classes={{ customHeight: classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(AirframeEngineGrid);
