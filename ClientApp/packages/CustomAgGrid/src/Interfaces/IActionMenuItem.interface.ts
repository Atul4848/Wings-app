import { GRID_ACTIONS } from '@wings-shared/core';
import { RowNode } from 'ag-grid-community';

export interface IActionMenuItem {
  title: string;
  action: GRID_ACTIONS;
  isHidden?: boolean;
  isDisabled?: boolean;
  to?: (node: RowNode) => string;
}
