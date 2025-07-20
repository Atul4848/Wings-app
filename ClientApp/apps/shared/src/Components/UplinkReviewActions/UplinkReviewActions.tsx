import React, { FC } from 'react';
import { Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react';
import { UIStore, ViewPermission } from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import { CancelOutlined, Edit, RemoveRedEyeOutlined } from '@material-ui/icons';
import { useStyles } from './UplinkReviewActions.styles';

interface Props {
  approveRejectPermission: boolean;
  viewDetailsPermission: boolean;
  disabledApproveReject: boolean;
  isRowEditing?: boolean;
  showEditIcon?: boolean;
  onEdit?: () => void;
  onApprove: () => void;
  onReject: () => void;
  onViewDetails: () => void;
}

const UplinkReviewActions: FC<Props> = ({ showEditIcon = false, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.actionButton}>
      <ViewPermission hasPermission={props.viewDetailsPermission}>
        <PrimaryButton variant="outlined"
          color="primary"
          disabled={UIStore.pageLoading || props.isRowEditing}
          onClick={props.onViewDetails}>
          <Tooltip title="Details">
            <RemoveRedEyeOutlined className={classes.icons} />
          </Tooltip>
        </PrimaryButton>
      </ViewPermission>
      <ViewPermission hasPermission={props.approveRejectPermission}>
        <>
          <PrimaryButton
            variant="outlined"
            color="primary"
            disabled={props.disabledApproveReject || UIStore.pageLoading}
            onClick={props.onApprove}
          >
            <Tooltip title="Approve">
              <CheckOutlinedIcon className={classes.icons} />
            </Tooltip>
          </PrimaryButton>
          <PrimaryButton
            variant="outlined"
            color="primary"
            disabled={props.disabledApproveReject || UIStore.pageLoading}
            onClick={props.onReject}
          >
            <Tooltip title="Reject">
              <CancelOutlined className={classes.icons} />
            </Tooltip>
          </PrimaryButton>
        </>
      </ViewPermission>
      <ViewPermission hasPermission={showEditIcon}>
        <PrimaryButton variant="outlined" color="primary" disabled={UIStore.pageLoading} onClick={props.onEdit}>
          <Tooltip title="Edit">
            <Edit className={classes.icons} />
          </Tooltip>
        </PrimaryButton>
      </ViewPermission>
    </div>
  );
};

export default observer(UplinkReviewActions);
