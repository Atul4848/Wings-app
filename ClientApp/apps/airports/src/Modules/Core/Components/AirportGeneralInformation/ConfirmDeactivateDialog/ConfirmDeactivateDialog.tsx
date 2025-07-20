import { TextField } from '@material-ui/core';
import React, { FC, useState } from 'react';
import { ViewPermission } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';

type Props = {
  isActive: boolean;
  onYesClick: (deactivateReason: string) => void;
  onNoClick: () => void;
};

const ConfirmDeactivateDialog: FC<Props> = ({ isActive, onNoClick, onYesClick }) => {
  const [ deactivateReason, setDeactivateReason ] = useState('');
  const message: string = isActive ? 'Deactivate' : 'Activate';
  const hasError: boolean = deactivateReason.length > 300;

  return (
    <ConfirmDialog
      title={`Confirm ${message}`}
      message=""
      isDisabledYesButton={(isActive && !Boolean(deactivateReason)) || hasError}
      dialogContent={
        <>
          <p>Are you sure you want to {message} this airport?</p>
          <ViewPermission hasPermission={isActive}>
            <TextField
              autoComplete="off"
              label="Deactivate Reason"
              variant="outlined"
              rows={4}
              multiline
              value={deactivateReason}
              error={hasError}
              helperText={hasError ? 'The Deactivate Reason may not be greater then 300 characters' : ''}
              onChange={({ target }) => setDeactivateReason(target.value)}
            />
          </ViewPermission>
        </>
      }
      yesButton="Ok"
      onNoClick={onNoClick}
      onYesClick={() => onYesClick(deactivateReason)}
    />
  );
};

export default ConfirmDeactivateDialog;
