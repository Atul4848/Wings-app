import { IClasses } from '@wings-shared/core';
import { ICellEditorParams, RowNode } from 'ag-grid-community';

export interface IBaseEditorProps extends ICellEditorParams {
  placeHolder?: string;
  classes?: IClasses;
  isRequired?: (rowNode: RowNode) => boolean;
  isEditable?: boolean;
  getEditableState?: (node: RowNode) => boolean;
  getDisableState?: (node: RowNode) => boolean;
  getTooltip?: (node: RowNode) => string;
  minDate?: (node?: RowNode) => string;
  maxDate?: (node?: RowNode) => string;
  ignoreDate?: (node?: RowNode) => boolean; // used to ignore date value in time validation
  isRowEditing?: boolean;
}
