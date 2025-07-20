import React, { FC } from 'react';
import { Tooltip } from '@material-ui/core';
import { STATUS_BADGE_TYPE } from '../../Enums';
import { IBaseEditorProps } from '../../Interfaces';
import { ViewPermission } from '@wings-shared/core';
import { useStyles } from './AgGridStatusBadge.styles';
import { StatusBadge } from '@uvgo-shared/status-badges';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const AgGridStatusBadge: FC<IBaseEditorProps> = ({ value, ...props }) => {
  const classes = useStyles();
  const _label = typeof value === 'object' ? value.label : value;

  const badgeType = (): STATUS_BADGE_TYPE => {
    switch (_label.toLocaleLowerCase()) {
      case 'new':
      case 'scheduled':
        return STATUS_BADGE_TYPE.INITIAL;
      case 'processing':
      case 'running':
      case 'inprogress':
      case 'notmerged':
      case 'not merged':
      case 'inactive':
        return STATUS_BADGE_TYPE.PROGRESS;
      case 'completed':
      case 'merged':
      case 'active':
      case 'approved':
        return STATUS_BADGE_TYPE.ACCEPTED;
      case 'failure':
      case 'failed':
      case 'error':
      case 'rejected':
        return STATUS_BADGE_TYPE.REJECTED;
      case 'warning':
        return STATUS_BADGE_TYPE.UNDECIDED;
      default:
        return STATUS_BADGE_TYPE.INITIAL;
    }
  };

  const tooltip = (): string => {
    const isCallable: boolean = typeof props.getTooltip === 'function';
    return isCallable ? props.getTooltip(props?.node) : '';
  };

  if (!Boolean(_label)) {
    return null;
  }

  return (
    <div className={classes.root}>
      <span>
        <StatusBadge type={badgeType()} label={_label} isAutoWidth={true} />
      </span>
      <ViewPermission hasPermission={Boolean(tooltip())}>
        <Tooltip title={<span className={classes.tooltipMessage}>{tooltip()}</span>} color="error" arrow>
          <InfoOutlinedIcon />
        </Tooltip>
      </ViewPermission>
    </div>
  );
};

export default AgGridStatusBadge;
