import React, { ReactNode } from 'react';
import { Typography, withStyles, Button } from '@material-ui/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CheckCircleIcon, CopyAltIcon } from '@uvgo-shared/icons';
import { styles } from './TemporaryPassword.styles';
import { IClasses } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';

interface Props {
  classes?: IClasses;
  title?: string;
  temporaryPassword: string;
  onClose?: () => void;
}

const dialogContent = (classes, temporaryPassword: string, handleClose): ReactNode => {
  return <>
    <div className={classes.checkIcon}>
      <CheckCircleIcon size="x-large" />
    </div>
    <div className={classes.statusText} severity="success">User's password updated with a temporary password.</div>
    <Typography>
      <div className={classes.inputLabel}>The temporary account password is:</div>
      <div className={classes.passwordText}>
        <ViewInputControl
          classes={{
            flexRow: classes.inputControl,
          }}
          type={EDITOR_TYPES.TEXT_FIELD}
          field={{ value: temporaryPassword }}
          isDisabled={true}
        />
        <PrimaryButton
          classes={{ root: classes.copyBtn }}
          variant="text"
          startIcon={<CopyAltIcon />}
          onClick={() => navigator.clipboard.writeText(temporaryPassword)}
        >
        </PrimaryButton>
      </div>
    </Typography>
    <Typography className={classes.infoText}>
      The user will be required to set a new password as soon as they log in.
    </Typography>
    <div className={classes.btnPosition}>
      <Button
        onClick={ handleClose }
      >
          Continue
      </Button>
    </div>
  </>;
}

const TemporaryPassword = ({ classes, title, temporaryPassword, onClose }: Props) => {
  const handleClose = onClose || (() => ModalStore.close());
  return (
    <Dialog
      classes={{
        dialogWrapper: classes.modalRoot,
        header: classes.headerWrapper,
      }}
      title={title}
      open={true}
      onClose={ handleClose }
      dialogContent={() => dialogContent(classes, temporaryPassword, handleClose)}
    />
  );
};
export default withStyles(styles)(TemporaryPassword);
