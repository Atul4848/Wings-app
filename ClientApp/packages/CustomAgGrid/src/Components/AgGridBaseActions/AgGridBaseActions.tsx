import React, { Component, ReactNode } from 'react';
import { ICellRendererReactComp } from 'ag-grid-react';
import EditIcon from '@material-ui/icons/Edit';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import { IBaseActionProps } from '../../Interfaces';
import { Tooltip } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { GRID_ACTIONS, ViewPermission } from '@wings-shared/core';

class AgGridBaseActions<P extends IBaseActionProps> extends Component<P> implements ICellRendererReactComp {
  public static defaultProps = {
    getDisabledState: () => false,
    classes: {},
    isRowEditing: false,
    showDeleteButton: true,
    showEditButton: true,
    showPreviewIcon: () => false,
  };

  public refresh(params: any): boolean {
    return true;
  }

  public getValue(): string {
    return this.props.value;
  }

  private get deleteDisableState(): boolean {
    const { getDeleteDisabledState, data } = this.props;
    if (typeof getDeleteDisabledState === 'function') {
      return getDeleteDisabledState(data);
    }
    return false;
  }

  private get editDisableState(): boolean {
    const { getEditDisabledState, data } = this.props;
    if (typeof getEditDisabledState === 'function') {
      return getEditDisabledState(data);
    }
    return false;
  }

  private get isEditable(): boolean {
    const { isEditable, node, getEditableState } = this.props;
    const isCallable: boolean = typeof getEditableState === 'function';
    return isCallable ? getEditableState(node) : isEditable;
  }

  private get tooltip(): string {
    const { node, getTooltip } = this.props;
    const isCallable: boolean = typeof getTooltip === 'function';
    return isCallable ? getTooltip(node) : '';
  }

  public get editActions(): ReactNode {
    const { classes, rowIndex, getDisabledState } = this.props;
    return (
      <>
        <Tooltip title={this.tooltip || 'Save Changes'}>
          <div>
            <PrimaryButton
              classes={{ root: classes.root }}
              variant="outlined"
              color="primary"
              disabled={getDisabledState()}
              onClick={() => this.props.onAction(GRID_ACTIONS.SAVE, rowIndex)}
            >
              <SaveIcon />
            </PrimaryButton>
          </div>
        </Tooltip>

        <Tooltip title="Cancel Changes">
          <div>
            <PrimaryButton
              classes={{ root: classes.root }}
              variant="outlined"
              color="primary"
              onClick={() => this.props.onAction(GRID_ACTIONS.CANCEL, rowIndex)}
            >
              <CancelIcon />
            </PrimaryButton>
          </div>
        </Tooltip>
      </>
    );
  }

  public get renderActions(): ReactNode {
    const { classes, rowIndex, showDeleteButton, showPreviewIcon, node, showEditButton } = this.props;
    if (showPreviewIcon(node)) {
      return (
        <Tooltip title="Preview">
          <PrimaryButton
            classes={{ root: classes.root }}
            variant="outlined"
            color="primary"
            onClick={() => this.props.onAction(GRID_ACTIONS.PREVIEW, rowIndex, node)}
          >
            <RemoveRedEye />
          </PrimaryButton>
        </Tooltip>
      );
    }
    return (
      <ViewPermission hasPermission={this.isEditable}>
        <>
          {showEditButton && (
            <Tooltip title="Edit Row">
              <div>
                <PrimaryButton
                  color="primary"
                  variant="outlined"
                  classes={{ root: classes.root }}
                  disabled={this.editDisableState}
                  onClick={() => this.props.onAction(GRID_ACTIONS.EDIT, rowIndex)}
                >
                  <EditIcon />
                </PrimaryButton>
              </div>
            </Tooltip>
          )}
          {showDeleteButton && (
            <Tooltip title="Delete Row">
              <div>
                <PrimaryButton
                  classes={{ root: classes.root }}
                  variant="outlined"
                  color="primary"
                  disabled={this.deleteDisableState}
                  onClick={() => this.props.onAction(GRID_ACTIONS.DELETE, rowIndex)}
                >
                  <DeleteIcon />
                </PrimaryButton>
              </div>
            </Tooltip>
          )}
        </>
      </ViewPermission>
    );
  }

  // require for test cases
  render() {
    return <></>;
  }
}

export default AgGridBaseActions;
