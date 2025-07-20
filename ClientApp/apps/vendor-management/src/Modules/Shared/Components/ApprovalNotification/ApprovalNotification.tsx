import React, { FC } from 'react';
import { IBaseActionProps } from '@wings-shared/custom-ag-grid';
import { useStyles } from './ApprovalNotification.styles';

import { inject } from 'mobx-react';
import { useNavigate } from 'react-router';
import { Button } from '@material-ui/core';
import { ApprovalsStore } from '../../../../Stores';

interface Props extends IBaseActionProps {
  approvalsStore: ApprovalsStore;
  text: string;
  responseData: any;
}

const ApprovalNotification: FC<Props> = ({ responseData, text, approvalsStore }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  const handleClick = () => {
    approvalsStore.setVendorLocationData(responseData);
    navigate('/vendor-management/approvals');
  };

  return (
    <div className={classes.notificationPanel}>
      This {text} has pending changes from Uplink. Please review
      <Button variant="contained" color="primary" onClick={handleClick} className="clickHereButton">
        click here
      </Button>
    </div>
  );
};

export default inject('approvalsStore')(ApprovalNotification);
