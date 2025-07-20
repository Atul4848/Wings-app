import React, { ReactNode, ReactNodeArray } from 'react';
import { Container, Typography, withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { styles } from './CustomResponseDialog.styles';
import { IClasses, UIStore, UnsubscribableComponent } from '@wings-shared/core';

interface Props {
  message: string;
  classes?: IClasses;
  heading?: string;
}

@observer
class CustomResponseDialog extends UnsubscribableComponent<Props> {
  private get dialogActions(): ReactNode {
    return (
      <PrimaryButton variant="contained" onClick={() => ModalStore.close()} disabled={UIStore.pageLoading}>
        Ok
      </PrimaryButton>
    );
  }

  private get messageList(): ReactNodeArray {
    const { message } = this.props;
    return message.split(',').map((message, index) => <Typography key={index}>{message}</Typography>);
  }

  public render() {
    const { classes, heading } = this.props as Required<Props>;

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
        dialogContent={() => <Container>{this.messageList}</Container>}
        dialogActions={() => this.dialogActions}
      />
    );
  }
}
export default withStyles(styles)(CustomResponseDialog);
