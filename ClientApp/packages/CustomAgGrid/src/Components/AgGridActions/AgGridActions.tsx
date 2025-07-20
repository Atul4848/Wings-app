import React, { ReactNode } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { getBaseActionsStyles } from '../AgGridBaseActions/AgGridBaseActions.styles';
import AgGridActionMenu from '../AgGridActionMenu/AgGridActionMenu';
import AgGridBaseActions from '../AgGridBaseActions/AgGridBaseActions';
import { IBaseActionProps, IActionMenuItem } from '../../Interfaces';
import { RowNode } from 'ag-grid-community';
import { GRID_ACTIONS } from '@wings-shared/core';

interface Props extends IBaseActionProps {
  actionMenus?: (node?: RowNode) => IActionMenuItem[];
  getVisibleState?: (node?: RowNode) => boolean;
}

@observer
class AgGridActions extends AgGridBaseActions<Props> {
  static defaultProps = {
    ...AgGridBaseActions.defaultProps,
    hideActionButtons: false,
    onAction: () => null,
  };

  constructor(props) {
    super(props);
  }

  /* istanbul ignore next */
  // Show or hide buttons based on conditions
  private get isVisible(): boolean {
    const { hideActionButtons, getVisibleState, node } = this.props;
    if (hideActionButtons) {
      return false;
    }
    if (typeof getVisibleState === 'function') {
      return getVisibleState(node);
    }
    return true;
  }

  private get viewActions(): ReactNode {
    const { rowIndex, node, isActionMenu, actionMenus } = this.props;

    if (!this.isVisible) {
      return null;
    }

    if (isActionMenu) {
      return (
        <AgGridActionMenu
          node={node}
          onMenuItemClick={(action: GRID_ACTIONS, title: string) => this.props.onAction(action, rowIndex, node, title)}
          dropdownItems={() => actionMenus(node)}
        />
      );
    }

    return this.renderActions;
  }

  render() {
    const { classes, isRowEditing } = this.props;
    return <div className={classes.buttonContainer}>{isRowEditing ? this.editActions : this.viewActions}</div>;
  }
}

export default withStyles(getBaseActionsStyles)(AgGridActions);
export { AgGridActions as PureAgGridActions };
