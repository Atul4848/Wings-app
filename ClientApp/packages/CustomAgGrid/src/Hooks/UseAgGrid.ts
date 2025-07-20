import {
  GridOptions,
  GridReadyEvent,
  RowEditingStartedEvent,
  RowNode,
  SuppressKeyboardEventParams,
  TabToNextCellParams,
  ExcelExportParams,
  CsvExportParams,
  RowSelectedEvent,
  RowStyle,
  ICellEditor,
  ColGroupDef,
  ColDef,
} from 'ag-grid-community';
import {
  GridPagination,
  Utilities,
  IAPIFilterDictionary,
  rowStyle,
  IFilterDictionary,
  GridFilter,
  DATE_FORMAT,
} from '@wings-shared/core';
import { ICellInstance, IGridOptionsBase } from '../Interfaces';
import {
  AgGridActions,
  AgGridGroupHeader,
  AgGridCellEditor,
  AgGridViewRenderer,
  AgGridAutoComplete,
  AgGridDateTimePicker,
  IGridState,
  AgGridChipView,
  AgGridFreeSoloChip,
  AgGridCheckBox,
  AgGridStatusBadge,
  AgColumnHeader,
  AgGridDateTimeWidget,
  AgGridWeekDaysWidget,
  AgGridTextArea,
  AgGridCellRenderer,
  AgGridLinkView,
  AgGridSelectControl,
} from '../Components';
import { agGridUtilities } from './AgGridUtilities';
import { actionColumn, auditFields, generalFields } from './auditFields';
import { useGridFilters } from './UseGridFilters';
import { AlertStore, IAlert, ALERT_TYPES } from '@uvgo-shared/alert';

export function useAgGrid<Filters extends string, TModel extends { id: number }, TFilterType extends string = any>(
  apiFilterDictionary: IAPIFilterDictionary<Filters>[],
  gridState: IGridState
) {
  // Another Hooks
  const filtersApi = useGridFilters<Filters>(apiFilterDictionary, gridState);

  const expandGeneralDetails = (isExpanded = false) => {
    if (!Boolean(Object.keys(gridState.columnApi).length)) {
      return;
    }
    gridState.columnApi.setColumnGroupOpened('generalDetails', isExpanded);
  };
  // Get Data item by row index
  const _getTableItem = (rowIndex: number): TModel => {
    if (!gridState.gridApi) {
      return null;
    }
    return gridState.gridApi.getDisplayedRowAtIndex(rowIndex)?.data;
  };

  const _startEditingCell = (rowIndex: number, colKey: string): void => {
    if (!gridState.gridApi) {
      return;
    }
    _setIsAllColumnsVisible()
    gridState.gridApi.ensureColumnVisible(colKey);
    gridState.gridApi.startEditingCell({ rowIndex, colKey });
    gridState.setIsRowEditing(true);
  };

  const _updateTableItem = (rowIndex: number, item: TModel): void => {
    if (!gridState.gridApi) {
      return;
    }

    const rowNode: RowNode = gridState.gridApi.getDisplayedRowAtIndex(rowIndex);
    rowNode?.setData(item);
    gridState.setGridData(
      Utilities.updateArray<TModel>(gridState.data, item, { replace: true, predicate: t => t.id === item.id })
    );
  };

  const _sortColumns = (rowIndex: number, item: TModel, sortColumn: string): void => {
    _updateTableItem(rowIndex, item);
    let sortedColoum = [ ...gridState.data ];

    if (sortColumn) {
      sortedColoum = sortedColoum.sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]));
      gridState.setGridData(sortedColoum);
    }
  };

  // Cancel Row Editing
  const cancelEditing = (rowIndex: number, removeRecord: boolean = true): void => {
    if (!gridState.gridApi) {
      return;
    }
    gridState.setIsRowEditing(false);
    gridState.gridApi.stopEditing(true);
    const data = _getTableItem(rowIndex);

    if (data?.id == 0 && removeRecord) {
      gridState.gridApi.applyTransaction({ remove: [ data ] });
      updatePagination(gridState.pagination.totalNumberOfRecords - 1);
    }
  };

  const _removeTableItems = (items: TModel[]): void => {
    if (!gridState.gridApi) {
      return;
    }

    gridState.gridApi.applyTransaction({ remove: [ ...items ] });
    gridState.gridApi.redrawRows();
    updatePagination(gridState.pagination.totalNumberOfRecords - 1);
  };

  // update grid pagination on add/remove operations
  const updatePagination = (totalNumberOfRecords: number): void => {
    gridState.setPagination(
      new GridPagination({
        ...gridState.pagination,
        totalNumberOfRecords: totalNumberOfRecords === -1 ? 0 : totalNumberOfRecords,
      })
    );
  };

  // Sometimes needs to override ready event in parent component
  const onGridReady = (param: GridReadyEvent): void => {
    gridState.setGridApi(param.api);
    gridState.setColumnApi(param.columnApi);
    gridState.setInitialColDefs(param.api.getColumnDefs());
  };

  // Callback To perform action when row editing started
  const onRowEditingStarted = (event: RowEditingStartedEvent): void => {
    if (gridState.isProcessing) {
      gridState.gridApi.stopEditing();
      return;
    }
    gridState.setIsRowEditing(true);
    gridState.setHasError(true);
    startEditingRow(event);
    filtersApi.suppressFilters(true);
    setColumnVisible('auditDetails', false);
    setColumnVisible('generalDetails', false);
  };

  // Callback To perform action when row editing stopped
  const onRowEditingStopped = (): void => {
    setColumnVisible('auditDetails', true);
    setColumnVisible('generalDetails', false);
    filtersApi.suppressFilters(false);
    gridState.setIsRowEditing(false);
    gridState.gridApi.redrawRows();
    gridState.setHasError(false);
  };

  const startEditingRow = (event: RowEditingStartedEvent): void => {
    if (!event.api) {
      return;
    }

    gridState.setIsRowEditing(true);
    const rowNodes: RowNode[] = Utilities.getRowNodes(event.api).filter(node => node?.rowIndex !== event.rowIndex);
    if (rowNodes.length) {
      event.api.redrawRows({ rowNodes });
    }
    gridState.isRowEditingStarted$.next(true);
  };

  const _getAllTableRows = (): TModel[] => {
    if (!gridState.gridApi) {
      return null;
    }

    gridState.gridApi.selectAll();
    const rowNode: TModel[] = gridState.gridApi.getSelectedRows();
    gridState.gridApi.deselectAll();
    return rowNode;
  };

  const _setIsAllColumnsVisible = () => {
    if (gridState.columnApi.getAllDisplayedColumns()?.length !== gridState.columnApi.getAllColumns()?.length) {
      const allColumnIds = (gridState.gridApi.getColumnDefs() as ColDef[]).map(x => x.colId);
      gridState.columnApi.setColumnsVisible(allColumnIds, true);
    }
  };

  const addNewItems = (items: any[], opt?: { startEditing: boolean; colKey: string }): void => {
    if (!gridState.gridApi) {
      return;
    }
    // Scroll to top before start editing 48260
    const pageSize = gridState.gridApi.paginationGetPageSize();
    const currentPage = gridState.gridApi.paginationGetCurrentPage();
    // Get first index of current page
    const addIndex = currentPage * pageSize;
    gridState.gridApi.ensureIndexVisible(addIndex);
    _setIsAllColumnsVisible();
    gridState.gridApi.applyTransaction({ add: [ ...items ], addIndex });
    gridState.gridApi.redrawRows();

    if (opt && !opt.startEditing) {
      gridState.gridApi.startEditingCell({ rowIndex: addIndex, colKey: opt.colKey });
    }
    updatePagination(gridState.pagination?.totalNumberOfRecords + 1);
  };

  const setColumnVisible = (columnKey: string, isVisible: boolean): void => {
    if (!gridState.columnApi) {
      return;
    }
    gridState.columnApi.setColumnVisible(columnKey, isVisible);
  };

  const getCellEditorInstance = (field: string): ICellEditor => {
    return gridState.gridApi?.getCellEditorInstances({ columns: [ field ] })[0];
  };

  const getInstanceValue = <T>(field: string): T => {
    return getCellEditorInstance(field)?.getValue();
  };

  const getComponentInstance = <T extends ICellInstance>(field: string): T => {
    return getCellEditorInstance(field)?.getFrameworkComponentInstance();
  };

  // Auto Adjust Grid Headers
  const autoSizeColumns = (): void => {
    if (!gridState.gridApi || !gridState.columnApi) {
      return;
    }

    gridState.toggleAutoSizeColumns ? gridState.gridApi.sizeColumnsToFit() : gridState.columnApi.autoSizeAllColumns();
    gridState.setToggleAutoSizeColumns(!gridState.toggleAutoSizeColumns);
  };

  // When Any Row Item is Selected
  const onRowSelected = (event: RowSelectedEvent) => {
    const rows = event.api.getSelectedRows().length;
    const isAllRowsSelected = event.api.getSelectedRows().length >= event.api.paginationGetPageSize();
    gridState.setHasSelectedRows(Boolean(rows));
    gridState.setIsAllRowsSelected(isAllRowsSelected);
  };

  // Grid Base Options
  const gridOptionsBase = (opt: IGridOptionsBase): Partial<GridOptions> => {
    const { isEditable, gridActionProps, editType } = opt;
    return {
      columnDefs: opt.columnDefs,
      defaultColDef: {
        flex: 1,
        sortable: true,
        filter: false,
        editable: isEditable || false,
        cellEditor: isEditable ? 'customCellEditor' : null,
        resizable: true,
        cellEditorParams: gridActionProps ? { ...gridActionProps, isEditable, isRowEditing: true } : null,
        cellRendererParams: gridActionProps ? { ...gridActionProps, isEditable, isRowEditing: false } : null,
        suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
          if (params.editing && !Utilities.hasPressedEnter(params.event)) {
            return true;
          }
          return !params.editing || Utilities.hasPressedEnter(params.event);
        },
        lockPosition: true,
      },
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      context: { componentParent: opt.context },
      editType: isEditable ? editType || 'fullRow' : null,
      pagination: true,
      paginationPageSize: 30,
      rowHeight: 50,
      stopEditingWhenGridLosesFocus: false,
      suppressClickEdit: !isEditable,
      postSort: filtersApi.postSort,
      onFilterChanged: filtersApi.onFilterChanged,
      onSortChanged: filtersApi.onSortChanged,
      onRowSelected,
      onGridReady,
      onRowEditingStarted,
      onRowEditingStopped,
      getRowStyle: () => rowStyle(gridState.isRowEditing, isEditable) as RowStyle,
      tabToNextCell: ({ previousCellPosition, nextCellPosition }: TabToNextCellParams) => {
        if (!gridState.isRowEditing) {
          return nextCellPosition;
        }
        return nextCellPosition.rowIndex === previousCellPosition.rowIndex ? nextCellPosition : previousCellPosition;
      },
      frameworkComponents: {
        customCellEditor: AgGridCellEditor,
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
        viewRenderer: AgGridViewRenderer,
        customAutoComplete: AgGridAutoComplete,
        customTimeEditor: AgGridDateTimePicker,
        agGridChipView: AgGridChipView,
        customFreeSoloChip: AgGridFreeSoloChip,
        checkBoxRenderer: AgGridCheckBox,
        statusRenderer: AgGridStatusBadge,
        agColumnHeader: AgColumnHeader,
        customTimeWidget: AgGridDateTimeWidget,
        customWeekDaysWidget: AgGridWeekDaysWidget,
        customTextAreaEditor: AgGridTextArea,
        customCellRenderer: AgGridCellRenderer,
        agGridLink: AgGridLinkView,
        customSelect: AgGridSelectControl,
      },
      defaultCsvExportParams: agGridUtilities.getGridExportParams() as CsvExportParams,
      defaultExcelExportParams: agGridUtilities.getGridExportParams() as ExcelExportParams,
      processCellForClipboard: agGridUtilities.processCellForClipboard,
    };
  };

  const fetchCellInstance = (columnName: string) => {
    return gridState.gridApi.getCellEditorInstances({ columns: [ `${columnName}` ] })[0].getFrameworkComponentInstance();
  };

  const isFilterPass = (
    dictionary: IFilterDictionary<TFilterType>,
    searchValue: string,
    selectedOption: TFilterType,
    isExactMatch?: boolean
  ): boolean => {
    const gridFilter = new GridFilter<TFilterType>({
      filterType: selectedOption,
      dictionary: dictionary,
    });

    return gridFilter.isFound(searchValue, isExactMatch);
  };

  const showAlert = (message: string, id: string, type: ALERT_TYPES = ALERT_TYPES.IMPORTANT) => {
    const alert: IAlert = {
      id,
      message,
      type,
      hideAfter: 5000,
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  };

  const _isAlreadyExists = (columns: string[], id: number, rowIndex?: number): boolean => {
    const gridEditorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns });
    if (!gridEditorInstance.length) {
      return false;
    }
    return gridState.data.some((model: TModel) => isRecordExists(columns, model, rowIndex) && model.id !== id);
  };

  const getFormattedValue = (value: any) => {
    return Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT);
  };

  const isRecordExists = (columns: string[], model: TModel, rowIndex?: number): boolean => {
    return columns.every((column: string) => {
      const modelValue = typeof model[column] === 'number' ? model[column].toString() : model[column];
      const value =
        getInstanceValue<TModel>(column) || gridState.gridApi.getDisplayedRowAtIndex(rowIndex)?.data[column];
      const instanceValue = typeof value === 'number' ? value.toString() : value;
      if (column === 'startDate' || column === 'endDate') {
        if (!modelValue && !instanceValue) {
          return true;
        }
        return Utilities.isEqual(getFormattedValue(modelValue), getFormattedValue(instanceValue));
      }
      // needs to return true for null values
      if (!instanceValue) {
        return true;
      }

      if (instanceValue instanceof Object) {
        // return true for null id's
        return Boolean(modelValue?.id || instanceValue?.id)
          ? Utilities.isEqual(modelValue?.id, instanceValue?.id)
          : true;
      }
      return Utilities.isEqual(modelValue, instanceValue);
    });
  };

  const auditFieldsWithAdvanceFilter = (isRowEditing: boolean): (ColDef | ColGroupDef)[] => {
    return auditFields(isRowEditing).reduce((previous, current) => {
      (current as ColGroupDef).children = (current as ColGroupDef).children.map((colDef: ColDef) => {
        if (Utilities.isEqual(colDef.field, 'modifiedBy') || Utilities.isEqual(colDef.field, 'createdBy')) {
          return {
            ...colDef,
            filter: 'agTextColumnFilter',
            filterParams: filtersApi.getAdvanceFilterParams(colDef.field, 2),
          };
        }
        return colDef;
      });
      previous.push(current);
      return previous;
    }, []);
  };
  return {
    auditFields,
    auditFieldsWithAdvanceFilter,
    generalFields,
    actionColumn,
    filtersApi,
    autoSizeColumns,
    onRowSelected,
    addNewItems,
    gridOptionsBase,
    _startEditingCell,
    _updateTableItem,
    cancelEditing,
    _removeTableItems,
    _getAllTableRows,
    getComponentInstance,
    getInstanceValue,
    _getTableItem,
    onRowEditingStarted,
    onRowEditingStopped,
    // refresh column sate
    reloadColumnState: () => gridState.columnApi?.setColumnState(gridState.columnApi?.getColumnState()),
    refreshSelectionState: () => {
      gridState.setHasSelectedRows(false);
      gridState.setIsAllRowsSelected(false);
    },
    fetchCellInstance,
    setColumnVisible,
    onGridReady,
    isFilterPass,
    expandGeneralDetails,
    showAlert,
    _isAlreadyExists,
    getCellEditorInstance,
    startEditingRow,
    _sortColumns,
    isRecordExists,
  };
}
