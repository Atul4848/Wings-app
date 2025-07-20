import React, { FC } from 'react';
import { ICellRendererParams, RowNode } from 'ag-grid-community';
import { Tooltip, IconButton } from '@material-ui/core';
import { EditIcon, InfoIcon, TrashIcon } from '@uvgo-shared/icons';
import useAgGridActionButtonStyles from './AgGridActionButton.style';
import { Link } from 'react-router-dom';

export interface AgGridActionButtonProps extends ICellRendererParams {
  onClick: (type, isEditable?: boolean) => void;
  to: (RowNode) => string;
  edit?: boolean;
  isEditOrDelete?: boolean;
  info?: boolean;
  isHidden: (node) => boolean;
  isDisabled: () => boolean;
  onAction: () => void;
  isActive: (node) => boolean;
}

const AgGridActionButton: FC<Partial<AgGridActionButtonProps>> = (props: Partial<AgGridActionButtonProps>) => {
  const {
    to,
    node,
    onClick,
    edit = false,
    isEditOrDelete = false,
    info = false,
    isActive,
    isHidden,
    isDisabled,
    onAction,
  } = props;
  const classes: Record<string, string> = useAgGridActionButtonStyles();
  if (isEditOrDelete) {
    return (
      !isHidden(node) && (
        <>
          <Tooltip
            classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
            placement="top"
            title="Edit"
            arrow
          >
            <IconButton color="primary" disabled={isDisabled()} onClick={() => onClick(node, true)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
            placement="top"
            title="Delete"
            arrow
          >
            <IconButton color="primary" disabled={isDisabled()} onClick={e => onClick(node)}>
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </>
      )
    );
  }
  if (info) {
    return (
      <Tooltip
        classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
        placement="top"
        title="User Info"
        arrow
      >
        {isDisabled() ? (
          <IconButton
            className={isActive(node) ? classes.infoIcon : ''}
            disabled={!isActive(node)}
            onClick={e => onClick(node)}
          >
            <InfoIcon />
          </IconButton>
        ) : (
          <IconButton className={isActive(node) ? classes.infoIcon : ''} onClick={e => onClick(node)}>
            <InfoIcon />
          </IconButton>
        )}
      </Tooltip>
    );
  }
  if (edit) {
    return (
      !isHidden(node) && (
        <Tooltip
          classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
          placement="top"
          title="Edit"
          arrow
        >
          {isDisabled() ? (
            <IconButton className={classes.disabled} disabled={isDisabled()} onClick={() => onAction()}>
              <EditIcon />
            </IconButton>
          ) : (
            <Link to={to(node)}>
              <IconButton onClick={() => onAction()}>
                <EditIcon />
              </IconButton>
            </Link>
          )}
        </Tooltip>
      )
    );
  }
  return (
    !isHidden(node) && (
      <Tooltip
        classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
        placement="top"
        title="Delete"
        arrow
      >
        <IconButton onClick={e => onClick(node)}>
          <TrashIcon />
        </IconButton>
      </Tooltip>
    )
  );
};

export default AgGridActionButton;
