import React from 'react';
import { Tooltip, withStyles } from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EditOutlined from '@material-ui/icons/EditOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IBaseActionProps, getBaseActionsStyles } from '@wings-shared/custom-ag-grid';
import { useGeographicModuleSecurity } from '../../Tools';
import { IClasses, ViewPermission, GRID_ACTIONS } from '@wings-shared/core';

interface Props extends IBaseActionProps {
  showEditButton?: boolean;
  showInfoButton?: boolean;
  classes?: IClasses;
  isDisabled?: boolean;
  onAction: (action: GRID_ACTIONS) => void;
  disableInfo?: boolean;
}

const GridReviewActions = ({
  classes = {},
  isDisabled,
  disableInfo,
  onAction,
  showInfoButton = true,
  showEditButton = false,
}: Props) => {
  const geographicModuleSecurity = useGeographicModuleSecurity();
  return (
    <div className={classes.buttonContainer}>
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <>
          <PrimaryButton
            classes={{ root: classes.root }}
            variant="outlined"
            color='primary'
            onClick={() => onAction(GRID_ACTIONS.APPROVE)}
            disabled={isDisabled}
          >
            <Tooltip title="Approve">
              <CheckOutlinedIcon />
            </Tooltip>
          </PrimaryButton>
          <PrimaryButton
            classes={{ root: classes.root }}
            variant="outlined"
            color='primary'
            onClick={() => onAction(GRID_ACTIONS.REJECT)}
            disabled={isDisabled}
          >
            <Tooltip title="Reject">
              <CancelOutlinedIcon />
            </Tooltip>
          </PrimaryButton>
          <ViewPermission hasPermission={showEditButton}>
            <PrimaryButton
              classes={{ root: classes.root }}
              variant="outlined"
              color='primary'
              onClick={() => onAction(GRID_ACTIONS.EDIT)}
              disabled={isDisabled}
            >
              <Tooltip title="Edit">
                <EditOutlined />
              </Tooltip>
            </PrimaryButton>
          </ViewPermission>
        </>
      </ViewPermission>
      <ViewPermission hasPermission={showInfoButton}>
        <PrimaryButton
          classes={{ root: classes.root }}
          variant="outlined"
          color='primary'
          onClick={() => onAction(GRID_ACTIONS.DETAILS)}
          disabled={disableInfo}
        >
          <Tooltip title="Details">
            <InfoOutlinedIcon />
          </Tooltip>
        </PrimaryButton>
      </ViewPermission>
    </div>
  );
};

export default withStyles(getBaseActionsStyles)(GridReviewActions);
