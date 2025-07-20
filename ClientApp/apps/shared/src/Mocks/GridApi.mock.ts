import { RowNode, GridApi, CellPosition, ICellEditorComp, IFilterComp, ColumnApi } from 'ag-grid-community';
import sinon, { SinonSpy } from 'sinon';
import { IGridApi } from '../Interfaces';

export class GridApiMock extends GridApi {
  applyTransaction: SinonSpy = sinon.fake();
  redrawRows: SinonSpy = sinon.fake();
  startEditingCell: SinonSpy = sinon.fake();
  stopEditing: SinonSpy = sinon.fake();
  ensureColumnVisible: SinonSpy = sinon.fake();
  onFilterChanged: SinonSpy = sinon.fake();
  setData: SinonSpy = sinon.fake();
  getValue: SinonSpy = sinon.fake();
  data: any;
  selectedRows: RowNode[];
  rowNodes: RowNode[];
  onSortChanged: SinonSpy = sinon.fake();
  ensureIndexVisible: SinonSpy = sinon.fake();
  isAnyFilterPresent: SinonSpy = sinon.fake();
  paginationSetPageSize: SinonSpy = sinon.fake();

  // extra fields
  editingCells: CellPosition[] = [];
  hasError: boolean;
  errorMessage: string;
  setSelectedOption: SinonSpy = sinon.fake();
  selectAll: SinonSpy = sinon.fake();
  deselectAll: SinonSpy = sinon.fake();
  setValue: SinonSpy = sinon.fake();
  setCustomError: SinonSpy = sinon.fake();
  getFirstDisplayedRow: SinonSpy = sinon.fake();
  currentPage: number;
  pageSize: number;
  _removeTableItems: SinonSpy = sinon.fake();

  constructor(object?: Partial<IGridApi>) {
    super();
    this.hasError = object?.hasError || false;
    this.errorMessage = object?.errorMessage || '';
    this.data = object?.data || [];
    this.getValue = object?.getValue || '';
    this.selectedRows = object?.selectedRows || [];
    this.rowNodes = object?.rowNodes || [];
    this.currentPage = object?.currentPage || 0;
    this.pageSize = object?.pageSize || 10;
    this.editingCells = object?.editingCells || [];
    this.setCustomError = object?.setCustomError || sinon.fake();
    this._removeTableItems = object?._removeTableItems || sinon.fake();
  }

  // Mock Functions
  public forEachNode = (callback: (rowNode, index) => void) => this.rowNodes.forEach(callback);
  public getSelectedRows = () => this.selectedRows;
  public getFilterInstance = (key, callback?: (filter: IFilterComp) => void) => null;
  public getCellEditorInstances = (): ICellEditorComp[] => [
    {
      getFrameworkComponentInstance: () => ({
        setSelectedOption: this.setSelectedOption,
        errorMessage: this.errorMessage,
        hasError: this.hasError,
        setValue: this.setValue,
        setRules: sinon.fake(),
        setCustomError: this.setCustomError,
        _removeTableItems: this._removeTableItems,
      }),
      getValue: () => this.getValue,
      getGui: () => null,
    },
  ];

  public getEditingCells = () => {
    return this.editingCells;
  };

  public getDisplayedRowAtIndex = () => {
    const rowNode = new RowNode(null);
    rowNode.data = this.data;
    rowNode.setData = this.setData;
    return rowNode;
  };

  public forEachNodeAfterFilter = () => {
    const rowNode = new RowNode(null);
    rowNode.data = this.data;
    rowNode.setData = this.setData;
    return [ rowNode ];
  };

  public getRowNode = () => {
    const rowNode = new RowNode(null);
    rowNode.data = this.data;
    rowNode.setData = this.setData;
    return rowNode;
  };

  public paginationGetCurrentPage = () => {
    return this.currentPage;
  };

  public paginationGetPageSize = () => {
    return this.pageSize;
  };

  public getColumnDefs = () => {
    return [];
  };

  public addNewItems = (items: any[], opt?: { startEditing: boolean; colKey: string }) => null;

}

export class ColumnApiMock extends ColumnApi {
  getAllDisplayedColumns: SinonSpy = sinon.fake();
  getAllColumns: SinonSpy = sinon.fake();
  setColumnVisible: SinonSpy = sinon.fake();
  setColumnGroupOpened: SinonSpy = sinon.fake();
  autoSizeAllColumns: SinonSpy = sinon.fake();
}
