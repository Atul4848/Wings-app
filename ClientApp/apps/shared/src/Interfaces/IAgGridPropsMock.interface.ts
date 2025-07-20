import { ReactNode } from 'react';
import { ICellEditorParams, GridOptions } from 'ag-grid-community';

// Note Only used in test cases
export interface IAgGridPropsMock {
  isRowEditing: boolean;
  children?: ReactNode;
  gridOptions?: GridOptions;
}

export interface IParentComponentMock {
  onInputChange: (params: ICellEditorParams, value: string) => void;
  onDropDownChange: (params: ICellEditorParams, value: any) => void;
  onInputBlur: (params: ICellEditorParams, value: any) => void;
}
