import { IClasses, regex, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { withStyles, TextField, Checkbox } from '@material-ui/core';
import { styles } from './SendTemplatePreview.styles';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { ChangeEvent, Component, ReactNode } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { DELIVERY_TYPE, TemplatePreviewModel, TemplateStore } from '../../../Shared';
import { filter, finalize } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import InfoIcon from '@material-ui/icons/Info';

type Props = {
  templateStore: TemplateStore;
  templateDeliveryType: string;
  templateContent: string;
  templateSubject: string;
  classes?: IClasses;
  isRootTemplate: boolean;
};

@inject('templateStore')
@observer
class SendTemplatePreview extends Component<Props> {
  @observable private inputValue: string = '';
  @observable private includeRootTemplate: boolean =
    this.props.templateDeliveryType === DELIVERY_TYPE.EMAIL ? true : false;

  @action
  private sendTestTemplate(): void {
    const { templateStore, isRootTemplate } = this.props;

    const templatePreview = new TemplatePreviewModel({
      type: this.props.templateDeliveryType,
      subject: this.props.templateSubject,
      sendTo: this.inputValue,
      content: this.props.templateContent,
      includeRootTemplate: !isRootTemplate ? this.includeRootTemplate : false,
    });

    UIStore.setPageLoader(true);
    templateStore
      .sendTemplatePreview(templatePreview)
      .pipe(
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
        filter((isDeleted: boolean) => isDeleted)
      )
      .subscribe(
        () => AlertStore.info('Template preview sent successfully!'),
        (error: AxiosError) => AlertStore.critical(error.message));
  }

  @action
  protected onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { value } = event.target;
    this.inputValue = value;
  }

  /* istanbul ignore next */
  private get isValidValue(): boolean {
    if (Utilities.isEqual(this.props.templateDeliveryType, 'EMAIL')) {
      return regex.email.test(this.inputValue);
    }
    if (Utilities.isEqual(this.props.templateDeliveryType, 'SMS')) {
      return regex.phoneNumber.test(this.inputValue);
    }
    return false;
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactNode {
    const { classes, isRootTemplate } = this.props as Required<Props>;
    return (
      <div className={classes.modalDetail}>
        <TextField
          className={classes.fullFlex}
          onChange={event => this.onChange(event)}
          required={true}
        />
        <PrimaryButton
          variant='contained'
          color='primary'
          onClick={() => this.sendTestTemplate()}
          disabled={!this.isValidValue}
        >
          Send
        </PrimaryButton>
        <div className={classes.rowContainer}>
          <div className={classes.iconSection}>
            <InfoIcon className={classes.icon} />
            Please enter valid
            {this.props.templateDeliveryType === DELIVERY_TYPE.EMAIL ? ' Email' : ' mobile number with country code.'}
          </div>
        </div>
        {this.props.templateDeliveryType === DELIVERY_TYPE.EMAIL &&
          <ViewPermission hasPermission={!isRootTemplate}>
            <div className={classes.checkBoxSection}>
              <Checkbox
                checked={this.includeRootTemplate}
                onChange={(_, checked) => this.includeRootTemplate = checked}
              ></Checkbox>
              <span>Include root template</span>
            </div>
          </ViewPermission>
        }
      </div>
    );
  }

  render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <Dialog
        title='Send Template Preview'
        open={true}
        classes={{
          dialogWrapper: classes.modalRoot,
          paperSize: classes.userMappedWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />
    )
  }
}

export default withStyles(styles)(SendTemplatePreview);
export { SendTemplatePreview as PureSendTemplatePreview };