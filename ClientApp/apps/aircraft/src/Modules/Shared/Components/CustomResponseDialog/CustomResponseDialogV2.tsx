import React, { FC, ReactNode } from 'react';
import { Container, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './CustomResponseDialog.styles';
import { UIStore } from '@wings-shared/core';

interface Props {
  message: string;
  heading?: string;
}

const CustomResponseDialogV2: FC<Props> = ({ message, heading }) => {
  const classes = useStyles();

  const dialogActions = (): ReactNode => {
    return (
      <PrimaryButton variant="contained" onClick={() => ModalStore.close()} disabled={UIStore.pageLoading}>
        Ok
      </PrimaryButton>
    );
  };

  const messageList = (): ReactNode => {
    return (
      <Container>
        {message.split(',').map((message, index) => (
          <Typography key={index}>{message}</Typography>
        ))}
      </Container>
    );
  };

  return (
    <Dialog
      title={heading || 'Import Failed'}
      open={true}
      classes={{
        paperSize: classes.modalWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={messageList}
      dialogActions={dialogActions}
    />
  );
};

export default observer(CustomResponseDialogV2);
