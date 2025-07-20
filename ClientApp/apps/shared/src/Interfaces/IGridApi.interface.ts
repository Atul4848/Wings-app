import { SinonSpy } from 'sinon';
import { CellPosition } from 'ag-grid-community';

export interface IGridApi {
  applyTransaction: SinonSpy;
  redrawRows: SinonSpy;
  startEditingCell: SinonSpy;
  stopEditing: SinonSpy;
  ensureColumnVisible: SinonSpy;
  onFilterChanged: SinonSpy;
  getEditingCells: () => CellPosition[];
  setSelectedOption: SinonSpy;
  editingCells: CellPosition[];
  hasError: boolean;
  errorMessage: string;
  data: any;
  setData: SinonSpy;
  getValue: any;
  selectedRows: any;
  rowNodes: any;
  selectAll: SinonSpy;
  deselectAll: SinonSpy;
  setValue: SinonSpy;
  setCustomError: SinonSpy;
  ensureIndexVisible: SinonSpy;
  setEditorType: SinonSpy;
  setConditionOperator: SinonSpy;
  currentPage: number;
  pageSize: number;
  _removeTableItems: SinonSpy;
}
