import React, { FC } from 'react';
import { Tooltip } from '@material-ui/core';
import { IBaseActionProps } from '@wings-shared/custom-ag-grid';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { FaaPropertyTableViewModel, useAirportModuleSecurity } from '../../../Shared';
import { useStyles } from './FAAGridActions.styles';
import { ViewPermission } from '@wings-shared/core';

interface Props extends IBaseActionProps {
  data: FaaPropertyTableViewModel;
  onMerge: () => void;
  onEdit: () => void;
  disabled: boolean;
  hideMergeButton: boolean;
  hideEditButton?: boolean;
}

const FAAGridActions: FC<Props> = ({ data, disabled, hideMergeButton, hideEditButton, ...props }) => {
  const classes = useStyles()
  const airportModuleSecurity = useAirportModuleSecurity();

  if (!airportModuleSecurity.isEditable) {
    return null;
  }

  return (
    <div className={classes.root}>
      <ViewPermission hasPermission={!hideEditButton && !Boolean(data.tableName)}>
        <Tooltip title="Edit This Record" disableHoverListener={disabled}>
          <div>
            <PrimaryButton
              classes={{ root: classes.buttonRoot }}
              variant="outlined"
              color="primary"
              onClick={props.onEdit}
              disabled={disabled}
            >
              <EditOutlinedIcon />
            </PrimaryButton>
          </div>
        </Tooltip>
      </ViewPermission>
      <ViewPermission hasPermission={!hideMergeButton}>
        <PrimaryButton
          classes={{ root: classes.buttonRoot }}
          variant="outlined"
          color="primary"
          onClick={props.onMerge}
          disabled={disabled}
        >
          <Tooltip title="Merge">
            <CheckOutlinedIcon />
          </Tooltip>
        </PrimaryButton>
      </ViewPermission>
    </div>
  );
};

export default (FAAGridActions);
