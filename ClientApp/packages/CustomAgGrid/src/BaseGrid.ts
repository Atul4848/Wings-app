import React, { RefObject } from 'react';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowEditingStartedEvent,
  RowNode,
  SuppressKeyboardEventParams,
  CellPosition,
  TabToNextCellParams,
  ColumnApi,
  ValueFormatterParams,
  ColGroupDef,
  ColDef,
  ProcessCellForExportParams,
  ExportParams,
  ExcelCell,
  CsvCustomContent,
  SortChangedEvent,
  FilterModifiedEvent,
  RowSelectedEvent,
  RowStyle,
  ICellEditor,
} from 'ag-grid-community';
import { action, observable } from 'mobx';
import { AlertStore, IAlert, ALERT_TYPES } from '@uvgo-shared/alert';
import { AgGridActions, AgGridGroupHeader } from './Components';
import { IGridOptionsBase, IAPISortFilter, ICellInstance, IGridAPIAdvancedFilter } from './Interfaces';
import { Observable, Subject } from 'rxjs';
import { PureSearchHeader } from '@wings-shared/form-controls';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  DATE_FORMAT,
  GridPagination,
  IAPIGridRequest,
  IAPISearchFilter,
  UIStore,
  Utilities,
  GridFilter,
  IFilterDictionary,
  Loader,
  SORTING_DIRECTION,
  UnsubscribableComponent,
  SelectOption,
  IBaseGridFilterSetup,
  IGridSortFilter,
  rowStyle,
} from '@wings-shared/core';

interface WithId {
  id: string | number;
}

const defaultSetup: IBaseGridFilterSetup<any> = {
  defaultPlaceHolder: 'Search',
  apiFilterDictionary: [],
  filterTypesOptions: [],
  defaultFilterType: '',
  defaultSortFilters: [],
};
/* istanbul ignore next */
export class BaseGrid<TProps, TModel extends WithId, TFilterType extends string = any> extends UnsubscribableComponent<
  TProps
> {
  protected searchHeaderRef: RefObject<PureSearchHeader> = React.createRef<PureSearchHeader>();
  protected searchPlaceHolder: string = '';
  protected gridApi: GridApi = null;
  protected columnApi: ColumnApi = null;
  protected initialColDefs: (ColDef | ColGroupDef)[] = [];
  protected isRowEditingStarted$: Subject<boolean> = new Subject<boolean>();
  protected loader: Loader = new Loader(false);
  @observable protected toggleAutoSizeColumns: boolean = false;
  @observable protected searchValue: string | string[] = '';
  @observable protected commonErrorMessage: string = '';
  @observable protected selectedOption: TFilterType;
  @observable protected hasError: boolean = false;
  @observable protected isRowEditing: boolean = false;
  @observable protected data: TModel[] = []; // client side pagination
  @observable protected pagination: GridPagination = new GridPagination(); // server side pagination
  @observable protected sortFilters: IGridSortFilter[] = [];
  @observable protected isLoading: boolean = false; // used in Dialogs that renders Grid
  @observable
  protected gridAdvancedSearchFilters: IGridAPIAdvancedFilter[] = [];
  @observable protected hasSelectedRows: boolean = false;
  @observable protected clickedRowIndex: number = null;
  @observable protected allowSelectAll: boolean = true;
  @observable protected isAllRowsSelected: boolean = false;

  constructor(props: TProps, protected readonly filterSetup: IBaseGridFilterSetup<TFilterType> = defaultSetup) {
    super(props);
    if (filterSetup) {
      this.searchPlaceHolder = filterSetup?.defaultPlaceHolder;
      this.selectedOption = filterSetup?.defaultFilterType;
      this.sortFilters = filterSetup?.defaultSortFilters;
    }
  }

  componentWillUnmount() {
    const editingCells: CellPosition[] = this.gridApi?.getEditingCells();
    if (this.isRowEditing && editingCells?.length) {
      this._cancelEditing(editingCells[0].rowIndex);
    }
  }

  public get isProcessing(): boolean {
    return this.isRowEditing || UIStore.pageLoading;
  }

  // Check if All rows Are selected
  protected _isAllRowsSelected(event: RowSelectedEvent): void {
    if (!event.api) {
      return;
    }
    this.isAllRowsSelected = event.api.getSelectedRows().length >= event.api.paginationGetPageSize();
  }

  protected get _searchFilters(): IAPIGridRequest {
    if (!this.searchValue) {
      return null;
    }

    const property = this.filterSetup.apiFilterDictionary.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, this.selectedOption)
    );

    if (!property) {
      return null;
    }

    const searchCollection = Array.isArray(this.searchValue)
      ? this.searchValue.map((_searchValue, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return {
          propertyName: property.apiPropertyName,
          propertyValue: _searchValue,
          ...operator,
        };
      })
      : [
        {
          propertyName: property.apiPropertyName,
          propertyValue: this.searchValue,
        },
      ];

    return {
      searchCollection: JSON.stringify(searchCollection),
    };
  }

  protected get _sortFilters(): IAPIGridRequest {
    if (!Array.isArray(this.sortFilters)) {
      return null;
    }
    const apiSortFilters: IAPISortFilter[] = this.sortFilters.reduce<IAPISortFilter[]>(
      (acc: IAPISortFilter[], currentValue: IGridSortFilter) => {
        const property = this.filterSetup.apiFilterDictionary.find(({ columnId }) =>
          Utilities.isEqual(columnId, currentValue.colId)
        );

        if (property) {
          acc.push({
            propertyName: property.apiPropertyName,
            isAscending: currentValue.sort === SORTING_DIRECTION.ASCENDING,
          });
        }

        return acc;
      },
      []
    );

    if (!apiSortFilters.length) {
      return null;
    }

    return {
      sortCollection: JSON.stringify(apiSortFilters),
    };
  }

  protected get _gridAPIAdvancedFilterCollection(): IAPIGridRequest {
    if (!this.gridApi) {
      return null;
    }

    if (!Array.isArray(this.gridAdvancedSearchFilters)) {
      return null;
    }

    const gridAPISearchFilters: IAPISearchFilter[] = this.gridAdvancedSearchFilters
      .filter(filter => !Boolean(filter.miniFilterText))
      .reduce<IAPISearchFilter[]>((acc: IAPISearchFilter[], { coldId }: IGridAPIAdvancedFilter) => {
        const property = this.filterSetup.apiFilterDictionary.find(({ columnId }) =>
          Utilities.isEqual(columnId, coldId)
        );

        const filterAPI = this.gridApi.getFilterApiForColDef(this.gridApi.getColumnDef(coldId));
        let selectedValues: string[] = [];

        if (Boolean(filterAPI?.valueModel)) {
          selectedValues = Array.from(filterAPI?.valueModel?.selectedValues);
        }

        if (property && selectedValues.length > 0) {
          const hasMultiValue: boolean = selectedValues.length > 1;
          acc.push({
            propertyName: property.apiPropertyName,
            operator: 'and',
            propertyValue: hasMultiValue ? selectedValues : selectedValues[0],
            filterType: hasMultiValue ? 'in' : 'eq',
          });
        }

        return acc;
      }, []);

    if (!gridAPISearchFilters.length) {
      return null;
    }

    return {
      filterCollection: JSON.stringify(gridAPISearchFilters),
    };
  }

  protected get _gridAPIAdvancedSearchCollection(): IAPIGridRequest {
    if (!this.gridApi) {
      return null;
    }

    if (!Array.isArray(this.gridAdvancedSearchFilters)) {
      return null;
    }

    const gridAPISearchFilters: IAPISearchFilter[] = this.gridAdvancedSearchFilters
      .filter(filter => Boolean(filter.miniFilterText))
      .reduce<IAPISearchFilter[]>(
        (acc: IAPISearchFilter[], { coldId, miniFilterText, searchType }: IGridAPIAdvancedFilter) => {
          const property = this.filterSetup.apiFilterDictionary.find(({ columnId }) =>
            Utilities.isEqual(columnId, coldId)
          );

          if (property) {
            acc.push({
              propertyName: property.apiPropertyName,
              operator: 'and',
              propertyValue: miniFilterText,
              searchType: searchType === 'contains' ? '' : searchType,
            });
          }

          return acc;
        },
        []
      );

    if (!gridAPISearchFilters.length) {
      return null;
    }

    return {
      searchCollection: JSON.stringify(gridAPISearchFilters),
    };
  }

  protected _setColumnVisible(columnKey: string, isVisible: boolean): void {
    if (!this.columnApi) {
      return;
    }
    this.columnApi.setColumnVisible(columnKey, isVisible);
  }

  @action
  protected _setHasSelectedRows(hasSelectedRows: boolean): void {
    this.hasSelectedRows = hasSelectedRows;
  }

  @action
  protected _setIsRowEditing(isRowEditing: boolean): void {
    this.isRowEditing = isRowEditing;
  }

  @action
  protected _cancelEditing(rowIndex: number, removeRecord: boolean = true): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.stopEditing(true);
    const data: TModel = this._getTableItem(rowIndex);
    if (data.id === 0 && removeRecord) {
      this.gridApi.applyTransaction({ remove: [ data ] });
      this.updatePagination(this.pagination.totalNumberOfRecords - 1);
    }
  }

  protected _removeTableItems(items: TModel[]): void {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.applyTransaction({ remove: [ ...items ] });
    this.gridApi.redrawRows();
    this.updatePagination(this.pagination.totalNumberOfRecords - 1);
  }

  protected _updateTableItem(rowIndex: number, item: TModel): void {
    if (!this.gridApi) {
      return;
    }

    const rowNode: RowNode = this.gridApi.getDisplayedRowAtIndex(rowIndex);
    rowNode?.setData(item);
    this.data = Utilities.updateArray<TModel>(this.data, item, {
      replace: true,
      predicate: t => t.id === item.id,
    });
  }

  protected _sortColumns(rowIndex: number, item: TModel, sortColumn: string): void {
    this._updateTableItem(rowIndex, item);
    let sortedColoum = [ ...this.data ];

    if (sortColumn) {
      sortedColoum = sortedColoum.sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]));
      this.data = sortedColoum;
    }
  }

  protected _getTableItem(rowIndex: number): TModel {
    if (!this.gridApi) {
      return null;
    }

    const rowNode: RowNode = this.gridApi.getDisplayedRowAtIndex(rowIndex);
    return rowNode.data as TModel;
  }

  protected _getAllTableRows(): TModel[] {
    if (!this.gridApi) {
      return null;
    }

    this.gridApi.selectAll();
    const rowNode: TModel[] = this.gridApi.getSelectedRows();
    this.gridApi.deselectAll();
    return rowNode;
  }

  protected _startEditingRow(event: RowEditingStartedEvent): void {
    if (!this.gridApi) {
      return;
    }

    this._setIsRowEditing(true);
    const rowNodes: RowNode[] = Utilities.getRowNodes(event.api).filter(node => node?.rowIndex !== event.rowIndex);
    if (rowNodes.length) {
      this.gridApi.redrawRows({ rowNodes });
    }
    this.isRowEditingStarted$.next(true);
  }

  protected isAllColumnsVisible(): void {
    if (this.columnApi.getAllDisplayedColumns()?.length !== this.columnApi.getAllColumns()?.length) {
      const allColumnIds = (this.gridApi.getColumnDefs() as ColDef[]).map(x => x.colId);
      this.columnApi.setColumnsVisible(allColumnIds, true);
    }
  }

  protected _addNewItems(items: any[], opt?: { startEditing: boolean; colKey: string }): void {
    if (!this.gridApi) {
      return;
    }
    // Scroll to top before start editing 48260
    const pageSize = this.gridApi.paginationGetPageSize();
    const currentPage = this.gridApi.paginationGetCurrentPage();
    // Get first index of current page
    const addIndex = currentPage * pageSize;
    this.gridApi.ensureIndexVisible(addIndex);

    this.isAllColumnsVisible()
    this.gridApi.applyTransaction({ add: [ ...items ], addIndex });
    this.gridApi.redrawRows();

    if (opt && opt.startEditing) {
      this.gridApi.startEditingCell({ rowIndex: addIndex, colKey: opt.colKey });
    }
    this.updatePagination(this.pagination.totalNumberOfRecords + 1);
  }

  // update grid pagination on add/remove operations
  @action
  private updatePagination(totalNumberOfRecords: number): void {
    this.pagination = new GridPagination({
      ...this.pagination,
      totalNumberOfRecords: totalNumberOfRecords === -1 ? 0 : totalNumberOfRecords,
    });
  }

  protected _gridOptionsBase(opt: IGridOptionsBase): Partial<GridOptions> {
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
      suppressScrollOnNewData: false,
      suppressColumnVirtualisation: true,
      context: { componentParent: opt.context },
      editType: isEditable ? editType || 'fullRow' : null,
      pagination: true,
      paginationPageSize: 30,
      rowHeight: 50,
      stopEditingWhenGridLosesFocus: false,
      suppressClickEdit: !isEditable,
      postSort: rowNodes => this.postSort(rowNodes),
      onFilterChanged: () => this._onFilterChanged(),
      onSortChanged: (params: SortChangedEvent) => this._onSortChanged(params),
      isExternalFilterPresent: () => !!this.searchValue,
      onGridReady: (param: GridReadyEvent) => this._onGridReady(param),
      onRowEditingStarted: (event: RowEditingStartedEvent) => this._onRowEditingStarted(event),
      onRowEditingStopped: () => this._onRowEditingStopped(),
      getRowStyle: () => rowStyle(this.isRowEditing, isEditable) as RowStyle,
      tabToNextCell: ({ previousCellPosition, nextCellPosition }: TabToNextCellParams) => {
        if (!this.isRowEditing) {
          return nextCellPosition;
        }
        return nextCellPosition.rowIndex === previousCellPosition.rowIndex ? nextCellPosition : previousCellPosition;
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
      defaultCsvExportParams: this.getGridExportParams<CsvCustomContent>(),
      defaultExcelExportParams: this.getGridExportParams<ExcelCell[][]>(),

      processCellForClipboard: params => {
        const { accumulatedRowIndex, node, ...restProps } = params;
        const formatterParams: ValueFormatterParams = {
          ...restProps,
          node,
          colDef: params.column.getColDef(),
          data: params.value,
        };
        const { valueFormatter } = restProps.column.getColDef();
        return valueFormatter instanceof Function ? valueFormatter(formatterParams) : params.value;
      },
    };
  }

  private getGridExportParams<T>(): ExportParams<T> {
    return {
      processCellCallback: (params: ProcessCellForExportParams) => {
        const { accumulatedRowIndex, node, ...restProps } = params;
        const formatterParams: ValueFormatterParams = {
          ...restProps,
          node,
          colDef: params.column.getColDef(),
          data: params.value,
        };
        const { valueFormatter } = restProps.column.getColDef();
        return valueFormatter instanceof Function ? valueFormatter(formatterParams) : params.value;
      },
      allColumns: true,
      skipColumnGroupHeaders: true,
    };
  }

  // Sometimes needs to override ready event in parent component
  protected _onGridReady(param: GridReadyEvent): void {
    this.gridApi = param.api;
    this.columnApi = param.columnApi;
    this.initialColDefs = param.api.getColumnDefs();
  }

  protected _onRowEditingStarted(event: RowEditingStartedEvent): void {
    if (this.isProcessing) {
      this.gridApi.stopEditing();
      return;
    }
    this.hasError = true;
    this._startEditingRow(event);
    this._suppressFilters(true);
    this._setColumnVisible('auditDetails', false);
  }

  protected _onRowEditingStopped(): void {
    this._setColumnVisible('auditDetails', true);
    this._suppressFilters(false);
    this._setIsRowEditing(false);
    this.gridApi.redrawRows();
    this.hasError = false;
  }

  // refresh column sate
  protected _reloadColumnState(): void {
    this.columnApi?.setColumnState(this.columnApi?.getColumnState());
  }

  // ag grid life cycle method
  protected _onSortChanged({ api }: SortChangedEvent): void {
    // redraw rows to get the updated row index
    this.gridApi?.redrawRows();
    this.initialColDefs = api.getColumnDefs();
    this.sortFilters = api.getSortModel();
  }

  // ag grid life cycle method
  protected _onFilterChanged(): void {
    // redraw rows to get the updated rowIndex
    this.gridApi?.redrawRows();
    if (!this.gridApi?.getDisplayedRowCount()) {
      this.gridApi.showNoRowsOverlay();
      return;
    }
    this.gridApi.hideOverlay();
  }

  @action
  protected _setSearchValue(searchValue: string | string[]): void {
    if (!this.gridApi) {
      return;
    }

    // Cancel editing if user searching something
    const editingCells = this.gridApi.getEditingCells();
    if (editingCells?.length) {
      const { rowIndex } = editingCells[0];
      this._cancelEditing(rowIndex);
    }
    this.searchValue = searchValue;
    this.gridApi.onFilterChanged();
  }

  @action
  protected _setSelectedOption(selectedOption: TFilterType): void {
    if (!this.gridApi) {
      return;
    }

    this.selectedOption = selectedOption;
    this.searchPlaceHolder =
      !selectedOption || selectedOption === this.filterSetup.defaultFilterType
        ? this.filterSetup.defaultPlaceHolder
        : `Search by ${selectedOption}`;

    if (!this.searchValue) {
      return;
    }

    const editingCells: CellPosition[] = this.gridApi.getEditingCells();
    if (this.isRowEditing && editingCells?.length) {
      this._cancelEditing(editingCells[0].rowIndex);
    }
    this.searchValue = '';
    this.gridApi.onFilterChanged();
  }

  protected get _selectOptions(): SelectOption[] {
    return this.filterSetup.filterTypesOptions.map(option => new SelectOption({ name: option, value: option }));
  }

  protected _isFilterPass(dictionary: IFilterDictionary<TFilterType>, isExactMatch?: boolean): boolean {
    const gridFilter = new GridFilter<TFilterType>({
      filterType: this.selectedOption,
      dictionary: dictionary,
    });

    return gridFilter.isFound(this.searchValue, isExactMatch);
  }

  protected _startEditingCell(rowIndex: number, colKey: string): void {
    this.isAllColumnsVisible()
    this.gridApi.ensureColumnVisible(colKey);
    this.gridApi?.startEditingCell({ rowIndex, colKey });
  }

  // suppress filters and sortable in row editing mode
  protected _suppressFilters(suppress: boolean): void {
    if (!suppress) {
      this.gridApi.setColumnDefs(this.initialColDefs);
      return;
    }
    const colDefs: (ColDef | ColGroupDef)[] = this.gridApi.getColumnDefs().map((column: ColDef | ColGroupDef) => {
      column = this.setColDefProp(column, 'suppressMenu', true);
      column = this.setColDefProp(column, 'sortable', false);

      // needs for group columns
      if ('children' in column && column.children.length) {
        column.children = column.children.map((childColumn: ColDef) => {
          childColumn = this.setColDefProp(childColumn, 'suppressMenu', true);
          childColumn = this.setColDefProp(childColumn, 'sortable', false);
          return childColumn;
        });
      }
      return column;
    });

    this.gridApi.setColumnDefs(colDefs);
  }

  private setColDefProp(colDef: ColDef, key: keyof ColDef, value: boolean): ColDef | ColGroupDef {
    return { ...colDef, [key]: value };
  }

  protected getCellEditorInstance(field: string): ICellEditor {
    return this.gridApi?.getCellEditorInstances({ columns: [ field ] })[0];
  }

  protected getInstanceValue<T>(field: string): T {
    return this.getCellEditorInstance(field)?.getValue();
  }

  protected getComponentInstance<T extends ICellInstance>(field: string): T {
    return this.getCellEditorInstance(field)?.getFrameworkComponentInstance();
  }

  protected expandRow(rowIndex: number): void {
    this.gridApi.getDisplayedRowAtIndex(rowIndex).setExpanded(true);
  }

  protected _toggleExpandAll(value: boolean): void {
    this.gridApi.forEachNodeAfterFilter((rowNode: RowNode) => rowNode.setExpanded(value));
  }

  protected showAlert(message: string, id: string, type: ALERT_TYPES = ALERT_TYPES.IMPORTANT): void {
    const alert: IAlert = {
      id,
      message,
      type,
      hideAfter: 5000,
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  }

  protected _isAlreadyExists(columns: string[], id: number, rowIndex?: number): boolean {
    const gridEditorInstance: ICellEditor[] = this.gridApi.getCellEditorInstances({ columns });
    if (!gridEditorInstance.length) {
      return false;
    }
    return this.data.some((model: TModel) => this.isRecordExists(columns, model, rowIndex) && model.id !== id);
  }

  // compare record based on provided columns
  protected isRecordExists(columns: string[], model: TModel, rowIndex?: number): boolean {
    return columns.every((column: string) => {
      const modelValue = typeof model[column] === 'number' ? model[column].toString() : model[column];
      const value =
        this.getInstanceValue<TModel>(column) || this.gridApi.getDisplayedRowAtIndex(rowIndex)?.data[column];
      const instanceValue = typeof value === 'number' ? value.toString() : value;
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
  }

  public autoSizeColumns(): void {
    this.toggleAutoSizeColumns ? this.gridApi.sizeColumnsToFit() : this.columnApi.autoSizeAllColumns();
    this.toggleAutoSizeColumns = !this.toggleAutoSizeColumns;
  }

  // Ignore sorting for new Row
  protected postSort(rowNodes: RowNode[]): void {
    const rowIndex = rowNodes.findIndex(({ data }) => !Boolean(data.id));
    if (rowIndex !== -1) {
      const addIndex: number = this.gridApi?.getFirstDisplayedRow();
      rowNodes.splice(addIndex, 0, rowNodes.splice(rowIndex, 1)[0]);
    }
  }

  /* istanbul ignore next */
  protected get auditFieldsWithAdvanceFilter(): (ColDef | ColGroupDef)[] {
    return this.auditFields.reduce((previous, current) => {
      (current as ColGroupDef).children = (current as ColGroupDef).children.map((colDef: ColDef) => {
        if (Utilities.isEqual(colDef.field, 'modifiedBy') || Utilities.isEqual(colDef.field, 'createdBy')) {
          return {
            ...colDef,
            filter: 'agTextColumnFilter',
            filterParams: this.nameSearchFilterParams('contains', colDef.field, 2),
          };
        }
        return colDef;
      });
      previous.push(current);
      return previous;
    }, []);
  }

  /* istanbul ignore next */
  protected get auditFields(): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'AD',
        groupId: 'auditDetails',
        suppressMenu: true,
        children: [
          {
            headerName: 'Modified By',
            headerTooltip: 'Modified By',
            field: 'modifiedBy',
            headerComponent: 'customHeader',
            minWidth: 120,
            editable: false,
            sortable: true,
            cellEditorParams: {
              getDisableState: (node: RowNode) => this.isRowEditing,
            },
          },
          {
            headerName: 'Modified On',
            headerTooltip: 'Modified On',
            columnGroupShow: 'open',
            field: 'modifiedOn',
            minWidth: 120,
            cellEditor: 'customTimeEditor',
            editable: false,
            sortable: true,
            valueFormatter: ({ value }: ValueFormatterParams) =>
              Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
            cellEditorParams: {
              getDisableState: (node: RowNode) => this.isRowEditing,
            },
            comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
          },
          {
            headerName: 'Created By',
            headerTooltip: 'Created By',
            field: 'createdBy',
            columnGroupShow: 'open',
            minWidth: 120,
            editable: false,
            sortable: true,
            cellEditorParams: {
              getDisableState: (node: RowNode) => this.isRowEditing,
            },
          },
          {
            headerName: 'Created On',
            headerTooltip: 'Created On',
            columnGroupShow: 'open',
            field: 'createdOn',
            cellEditor: 'customTimeEditor',
            minWidth: 120,
            editable: false,
            sortable: true,
            valueFormatter: ({ value }: ValueFormatterParams) =>
              Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
            cellEditorParams: {
              getDisableState: (node: RowNode) => this.isRowEditing,
            },
            comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
          },
        ],
      },
    ];
  }

  /* istanbul ignore next */
  /* return text comparator for api side filters*/
  protected enableTextComparator(enable: boolean): any {
    if (enable) {
      return { textCustomComparator: () => true };
    }
    return {};
  }

  protected nameSearchFilterParams = (
    searchType: string,
    colId: string,
    textLength: number = 2,
    textComparator: boolean = true
  ) => ({
    filterOptions: [ searchType ],
    trimInput: true,
    debounceMs: 500,
    suppressAndOrCondition: true,
    ...this.enableTextComparator(textComparator),
    filterModifiedCallback: () => {
      const filterAPI = this.gridApi.getFilterApiForColDef(colId);
      const miniFilterText: string = filterAPI.eValueFrom1.eInput.value;
      const searchType: string = filterAPI.eType1.value;
      const filterData = this.gridAdvancedSearchFilters.find(filter => Utilities.isEqual(filter.coldId, colId));

      // for client side filters
      if (!miniFilterText && !textComparator) {
        this.gridApi.onFilterChanged();
      }

      if (miniFilterText && miniFilterText.length < textLength) {
        const filterAPI = this.gridApi.getFilterApiForColDef(colId);
        filterAPI.setModel(null);
        return;
      }

      if (
        (!Boolean(filterData) && !Boolean(miniFilterText)) ||
        Utilities.isEqual(filterData?.miniFilterText, miniFilterText)
      ) {
        return;
      }

      this.updateGridAdvancedSearchFilters(colId, searchType, miniFilterText);
      if (
        !Boolean(miniFilterText) ||
        (Utilities.isEqual(searchType, 'start') && miniFilterText?.length >= 1) ||
        (Utilities.isEqual(searchType, 'contains') && miniFilterText?.length >= textLength)
      ) {
        this.gridAdvancedSearchFilterDebounce$.next();
      }
    },
  });

  @action
  protected updateGridAdvancedSearchFilters(colId: string, searchType: string, miniFilterText: string): void {
    const index: number = this.gridAdvancedSearchFilters.findIndex(filter => filter.coldId === colId);
    const filterAPI = this.gridApi.getFilterApiForColDef(colId);
    let selectedValues: string[] = [];
    let allAvailableValue: string[] = [];

    if (!Boolean(searchType)) {
      selectedValues = Array.from(filterAPI?.valueModel?.selectedValues);
      allAvailableValue = filterAPI.valueModel.allValues;
    }

    if (!Boolean(miniFilterText) && index >= 0 && Boolean(searchType)) {
      this.gridAdvancedSearchFilters.splice(index, 1);
      return;
    }

    if (
      !Boolean(miniFilterText) &&
      index >= 0 &&
      !Boolean(searchType) &&
      selectedValues.length === allAvailableValue.length
    ) {
      this.gridAdvancedSearchFilters.splice(index, 1);
      return;
    }

    this.gridAdvancedSearchFilters = Utilities.updateArray(
      this.gridAdvancedSearchFilters,
      {
        coldId: colId,
        miniFilterText: miniFilterText,
        searchType: searchType,
      },
      {
        replace: index >= 0,
        predicate: t => t.coldId === colId,
      }
    );
    this._setSearchValue('');
    this._setSelectedOption(this.filterSetup.defaultFilterType);
    this.searchHeaderRef?.current?.searchInputRef?.current?.clearInputValue();
  }

  protected onGridApiFilterModified(filterModified: FilterModifiedEvent): void {
    const { column } = filterModified;
    const colId: string = column.getColId();
    const filterAPI = this.gridApi.getFilterApiForColDef(colId);
    if (filterAPI.filterNameKey === 'dateFilter') {
      return;
    }
    const miniFilterText: string = filterAPI?.getMiniFilter();
    const selectedValues: string[] = Array.from(filterAPI?.valueModel?.selectedValues);
    const allAvailableValue: string[] = filterAPI.valueModel.allValues;
    const filterData = this.gridAdvancedSearchFilters.find(filter => Utilities.isEqual(filter.coldId, colId));

    if (Utilities.isEqual(filterData?.miniFilterText, miniFilterText)) {
      return;
    }

    if (!Boolean(miniFilterText) && !Boolean(filterData) && selectedValues.length === allAvailableValue.length) {
      return;
    }

    this.updateGridAdvancedSearchFilters(colId, '', miniFilterText);

    if (typeof filterAPI.setMiniFilter === 'function') {
      this.gridAdvancedSearchFilterDebounce$.next();
    }
  }

  @action
  protected onFilterResetClickHandler(): void {
    this.gridAdvancedSearchFilters = this.gridAdvancedSearchFilters
      .map((advFilter: IGridAPIAdvancedFilter) => {
        const filterAPI = this.gridApi.getFilterApiForColDef(advFilter.coldId);
        filterAPI.setModel(null);
        filterAPI.onFilterChanged();
        return advFilter;
      })
      .filter(search => Boolean(search.miniFilterText));
    this.gridAdvancedSearchFilterDebounce$.next();
    this.gridAdvancedSearchFilters = [];
  }

  protected setMiniFilterTextDebounce(): void {
    this.debounce$.pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$)).subscribe(() => {
      this.gridAdvancedSearchFilters.forEach(({ coldId, miniFilterText }: IGridAPIAdvancedFilter) => {
        const filterAPI = this.gridApi.getFilterApiForColDef(coldId);

        if (typeof filterAPI.setMiniFilter === 'function') {
          //first we need to reset mini filter
          filterAPI.setMiniFilter('');
          filterAPI.setMiniFilter(miniFilterText);
        } else {
          filterAPI.eValueFrom1.value = miniFilterText;
        }
      });
    });
  }

  // update search value with debounce time to add some time delay before making api call
  protected gridAdvancedSearchFilterApplied(): void {
    if (this.gridAdvancedSearchFilters.length) {
      this.debounce$.next();
    }
  }

  protected onAdvanceSearch$(): Observable<string> {
    return this.gridAdvancedSearchFilterDebounce$.pipe(debounceTime(1000), takeUntil(this.destroy$));
  }
}
