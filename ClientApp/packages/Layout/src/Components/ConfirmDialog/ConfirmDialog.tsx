import React, { Component, ReactNode, ReactElement } from 'react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { DangerButton, PrimaryButton } from '@uvgo-shared/buttons';
import { styles } from './ConfirmDialog.styles';
import { withStyles } from '@material-ui/core/styles';
import { IClasses } from '@wings-shared/core';

interface Props {
  title: string;
  message: string;
  dialogContent?: ReactElement;
  yesButton?: string;
  isDisabledYesButton?: boolean;
  noButton?: string;
  isDeleteButton?: boolean;
  yesButtonVariant?: 'text' | 'outlined' | 'contained';
  noButtonVariant?: 'text' | 'outlined' | 'contained';
  onNoClick: () => void;
  onYesClick: () => void;
  onCloseClick?: () => void;
  defaultModal?: boolean;
  classes?: IClasses;
  disableBackdropClick?: boolean;
}

class ConfirmDialog extends Component<Props> {
  static defaultProps = {
    yesButton: 'Ok',
    noButton: 'Cancel',
    onCloseClick: () => ModalStore.close(),
    disableBackdropClick: false,
  };

  private get actionButton(): ReactNode {
    const {
      isDeleteButton,
      yesButtonVariant = 'contained',
      isDisabledYesButton,
      yesButton,
    } = this.props;
    if (isDeleteButton) {
      return (
        <DangerButton
          disabled={isDisabledYesButton}
          variant={yesButtonVariant}
          onClick={() => this.props.onYesClick()}
        >
          {yesButton}
        </DangerButton>
      );
    }

    return (
      <PrimaryButton
        disabled={isDisabledYesButton}
        variant={yesButtonVariant}
        onClick={() => this.props.onYesClick()}
      >
        {yesButton}
      </PrimaryButton>
    );
  }

  public render(): ReactNode {
    const {
      title,
      noButton,
      message,
      dialogContent,
      defaultModal = false,
      noButtonVariant = 'outlined',
      classes,
      disableBackdropClick
    } = this.props;
    if (defaultModal) {
      return (
        <Dialog
          title={title}
          open={true}
          classes={{
            dialogWrapper: classes.modalRoot,
            paperSize: classes.userMappedWidth,
            header: classes.headerWrapper,
            content: classes.content,
          }}
          onClose={() => this.props.onCloseClick()}
          dialogContent={() => (
            <>
              {message}
              {dialogContent}
            </>
          )}
          dialogActions={() => (
            <div className={classes.btnContainer}>
              <div className={classes.btnSection}>
                <PrimaryButton
                  variant={noButtonVariant}
                  onClick={() => this.props.onNoClick()}
                >
                  {noButton}
                </PrimaryButton>
              </div>
              <div className={classes.btnAlign}>{this.actionButton}</div>
            </div>
          )}
          disableBackdropClick={disableBackdropClick}
        />
      );
    }
    return (
      <Dialog
        title={title}
        open={true}
        onClose={() => this.props.onCloseClick()}
        dialogContent={() => (
          <>
            {message}
            {dialogContent}
          </>
        )}
        dialogActions={() => (
          <div>
            <PrimaryButton
              variant={noButtonVariant}
              onClick={() => this.props.onNoClick()}
            >
              {noButton}
            </PrimaryButton>
            {this.actionButton}
          </div>
        )}
        disableBackdropClick={this.props.disableBackdropClick}
      />
    );
  }
}
export default withStyles(styles)(ConfirmDialog as any);
