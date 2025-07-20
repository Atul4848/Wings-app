import React, { FC } from 'react';
import { withStyles } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/CheckOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import { APPROVE_REJECT_ACTIONS } from '../../Enums';
import { styles } from './ReviewActions.styles';
import { IClasses } from '@wings-shared/core';

interface Props {
  showRefreshButton?: boolean;
  showFileUploadButton?: boolean;
  disabled?: boolean;
  classes?: IClasses;
  onAction: (action: APPROVE_REJECT_ACTIONS) => void;
}

const ReviewActions: FC<Props> = ({
  classes,
  disabled,
  onAction,
  showRefreshButton = true,
  showFileUploadButton = false,
}) => {
  return (
    <div className={classes?.root}>
      {showRefreshButton && (
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={() => onAction(APPROVE_REJECT_ACTIONS.REFRESH)}
        >
          Refresh Time Zone
        </PrimaryButton>
      )}
      <PrimaryButton
        disabled={disabled}
        variant="contained"
        color="primary"
        onClick={() => onAction(APPROVE_REJECT_ACTIONS.APPROVE_SELECTED)}
      >
        Approve Selected
      </PrimaryButton>
      <PrimaryButton
        disabled={disabled}
        variant="contained"
        color="primary"
        onClick={() => onAction(APPROVE_REJECT_ACTIONS.REJECT_SELECTED)}
      >
        Reject Selected
      </PrimaryButton>
      {showFileUploadButton && (
        <PrimaryButton
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={() => onAction(APPROVE_REJECT_ACTIONS.FILE_UPLOAD)}
        >
          Import File
        </PrimaryButton>
      )}
    </div>
  );
};

export default withStyles(styles)(ReviewActions);
