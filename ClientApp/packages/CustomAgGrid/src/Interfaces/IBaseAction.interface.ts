import { ICellRendererParams, RowNode } from 'ag-grid-community';
import { GRID_ACTIONS, IClasses } from '@wings-shared/core';

export interface IBaseActionProps extends Partial<ICellRendererParams> {
  isActionMenu?: boolean; // Used for Dropdown menu
  isEditable?: boolean; // Used to check either user has permission to edit or not
  isRowEditing?: boolean; // Used to check if view is in edit mode or render mode
  showDeleteButton?: boolean; // Show or hide delete button from action menu
  showPreviewIcon?: (node?: RowNode) => boolean; // Show preview button from action menu
  hideActionButtons?: boolean; // show or hide action buttons
  classes?: IClasses;
  getTooltip?: (node?: RowNode) => string;
  getDisabledState?: () => boolean;
  getEditableState?: (node: RowNode) => boolean;
  onAction?: (actionType: GRID_ACTIONS, rowIndex: number, node?: RowNode, title?: string) => void;
  getDeleteDisabledState?: (node?: RowNode) => boolean;
  getEditDisabledState?: (node?: RowNode) => boolean;
  showEditButton?: boolean; // Show or hide edit button from action menu
}
