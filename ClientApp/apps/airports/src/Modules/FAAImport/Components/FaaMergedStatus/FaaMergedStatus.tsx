import React, { FC, useMemo } from 'react';
import { Tooltip } from '@material-ui/core';
import { FAA_MERGE_STATUS } from '../../../Shared';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { useStyles } from './FaaMergedStatus.styles';
import { mergeStatus } from '../../fields';
import { Utilities, ViewPermission } from '@wings-shared/core';
import { StatusBadge } from '@uvgo-shared/status-badges';
import { IBaseActionProps, STATUS_BADGE_TYPE } from '@wings-shared/custom-ag-grid';

interface Props extends IBaseActionProps {
  fieldKey: string;
}

// data: FaaPropertyTableViewModel | FAAImportProcess
const FaaMergedStatus: FC<Props> = ({ data, fieldKey }) => {
  const classes = useStyles();

  const status = useMemo(() => {
    if (!data) {
      return '';
    }
    return Utilities.isEqual(fieldKey, 'faaMergeAllStatus')
      ? data.faaMergeAllStatus?.name
      : Utilities.isEqual(fieldKey, 'faaImportStatus')
        ? data.faaImportStatus?.name
        : mergeStatus[data?.faaMergeStatus];
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
      case 'notmerged':
      case 'not merged':
        return STATUS_BADGE_TYPE.PROGRESS;
      case 'completed':
      case 'merged':
      case 'active':
        return STATUS_BADGE_TYPE.ACCEPTED;
      case 'failed':
        return STATUS_BADGE_TYPE.REJECTED;
      default:
        return STATUS_BADGE_TYPE.INITIAL;
    }
  }, [ _status ]);

  const permission = (): boolean => {
    return Utilities.isEqual(fieldKey, 'faaImportStatus')
      ? Utilities.isEqual(data.faaImportStatus?.name, 'Failed')
      : Utilities.isEqual(fieldKey, 'faaMergeStatus')
        ? Utilities.isEqual(data?.faaMergeStatus, FAA_MERGE_STATUS.FAILED)
        : false;
  };

  return (
    <div className={classes.root}>
      <span>
        <ViewPermission hasPermission={Boolean(status)}>
          <StatusBadge type={badgeType} label={status} isAutoWidth={true} />
        </ViewPermission>
      </span>
      <ViewPermission hasPermission={permission()}>
        <Tooltip
          title={<span className={classes.errorMessage}>{data?.processMessage || data?.validationMessage}</span>}
          color="error"
          arrow
        >
          <InfoOutlinedIcon />
        </Tooltip>
      </ViewPermission>
    </div>
  );
};

export default FaaMergedStatus;
