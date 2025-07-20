import React, { FC, useMemo } from 'react';
import { StatusBadge } from '@uvgo-shared/status-badges';
import { IBaseActionProps, STATUS_BADGE_TYPE } from '@wings-shared/custom-ag-grid';
import { useStyles } from './ApprovalStatus.styles';

interface Props extends IBaseActionProps {
  fieldKey: string;
}

const ApprovalStatus: FC<Props> = ({ data, fieldKey }) => {
  const classes = useStyles();
  const status = useMemo(() => {
    if (!data) {
      return '';
    }
    return data.status.name;
  }, [ fieldKey ]);

  const _status = status.toLocaleLowerCase();

  const badgeType = useMemo(() => {
    switch (_status) {
      case 'new':
      case 'scheduled':
      case 'inactive':
        return STATUS_BADGE_TYPE.INITIAL;
      case 'running':
      case 'inprogress':
      case 'pending':
      case 'not merged':
        return STATUS_BADGE_TYPE.PROGRESS;
      case 'completed':
      case 'approved':
      case 'active':
        return STATUS_BADGE_TYPE.ACCEPTED;
      case 'rejected':
        return STATUS_BADGE_TYPE.REJECTED;
      default:
        return STATUS_BADGE_TYPE.INITIAL;
    }
  }, [ _status ]);

  return (
    <div className={classes.root}>
      <StatusBadge type={badgeType} label={status} isAutoWidth={true} />
    </div>
  );
};

export default ApprovalStatus;
