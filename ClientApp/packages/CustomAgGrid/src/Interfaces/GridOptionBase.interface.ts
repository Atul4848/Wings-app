import { ColDef } from 'ag-grid-community';

export interface IGridOptionsBase {
  context: any,
  columnDefs: ColDef[],
  isEditable?: boolean,
  gridActionProps?: object,
  editType?: string
}
