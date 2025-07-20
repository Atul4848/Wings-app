import React, { ReactNode } from 'react';
import { BaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { action, observable } from 'mobx';
import {
  ChannelStore,
  ContactModel,
  ContactStore,
  DeliveryTypeOptions,
  DELIVERY_TYPE,
  IAPIUpsertContactRequest,
  SubscriptionStore,
  UserModel,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { withStyles } from '@material-ui/core';
import { Observable, of } from 'rxjs';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { fields } from './Fields';
import { styles } from './UpsertContact.styles';
import { IClasses, IOptionValue, ISelectOption, Utilities, regex } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

type Props = {
  subscriptionStore: SubscriptionStore;
  contactStore: ContactStore;
  channelStore: ChannelStore;
  upsertContact: (request: IAPIUpsertContactRequest) => void,
  viewMode?: VIEW_MODE;
  contactId?: number;
  classes?: IClasses;
};

@inject('contactStore', 'channelStore', 'subscriptionStore')
@observer
class UpsertContact extends BaseUpsertComponent<Props, ContactModel> {
  @observable private contactModel = new ContactModel({ id: 0 });
  private readonly emailTooltipText: string = 'Enter valid email address consists of an email prefix ' +
    'and an email domain. For example, in the address example@mail.com, \'example\' is the email prefix ' +
    'and \'mail.com\' is the email domain';
  private readonly phoneNumberTooltipText: string = 'Enter valid 10 digit international number starting ' +
    'with country code. For example, +16667776767';
  @observable private tooltipText: string = this.emailTooltipText;
  constructor(props: Props) {
    super(props, fields);
  }

  /* istanbul ignore next */
  componentDidMount() {
    this.loader.showLoader();
    this.loadContactById()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader()),
      ).subscribe(
        (response: ContactModel) => {
          this.contactModel = response;
          this.setFormValues(this.contactModel);
          this.setValueFieldRules(this.contactModel.deliveryType.label);
          this.tooltipText = this.contactModel.deliveryType.name.toLowerCase() === 'email'
            ? this.emailTooltipText
            : this.phoneNumberTooltipText;
        },
        (error: AxiosError) => AlertStore.info(error.message)
      )
  }

  @action
  private loadContactById(): Observable<ContactModel> {
    const { contactStore, contactId } = this.props;
    if (!contactId) {
      return of(this.contactModel)
    }
    return contactStore.getContact(contactId)
  }

  @action
  private upsertContact(): void {
    const { contactId, upsertContact, contactStore } = this.props
    const { name, value, deliveryType } = this.form.values();
    const { csdUserId, customerNumber } = this.props.subscriptionStore.selectedUser as UserModel;

    const request: IAPIUpsertContactRequest = {
      ContactId: Number(contactId),
      Name: name,
      Value: value,
      CSDUserId: csdUserId,
      CustomerNumber: customerNumber,
      DeliveryType: deliveryType.value,
    }
    if (!contactStore.contacts.some(x => x.id !== contactId && x.value.toUpperCase() === value.toUpperCase())) {
      upsertContact(request);
    } else {
      AlertStore.critical('Contact already exists');
    }
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'Contacts',
      inputControls: [
        {
          fieldKey: 'deliveryType',
          type: EDITOR_TYPES.DROPDOWN,
          options: DeliveryTypeOptions.filter(x => x.value !== 'ALL'),
          isDisabled: this.contactModel.hasSubscription,
        },
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'value',
          type: EDITOR_TYPES.TEXT_FIELD,
          showExpandButton: false,
          isInputCustomLabel: true,
          tooltipText: this.tooltipText,
          isDisabled: this.contactModel.hasSubscription,
        },
      ],
    };
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    if (value && Utilities.isEqual(fieldKey, 'deliveryType')) {
      this.setValueFieldRules((value as ISelectOption).label);
      if ((value as ISelectOption).label === 'EMAIL') {
        this.tooltipText = this.emailTooltipText;
      }
      if ((value as ISelectOption).label === 'SMS') {
        this.tooltipText = this.phoneNumberTooltipText;
      }
    }

    this.getField(fieldKey).set(value);
  }


  /* istanbul ignore next */
  private setValueFieldRules(value: string): void {
    if (Utilities.isEqual(value, DELIVERY_TYPE.EMAIL)) {
      this.getField('value').set('rules', `required:true|regex:${regex.email}`);
    }
    if (Utilities.isEqual(value, DELIVERY_TYPE.SMS)) {
      this.getField('value').set('rules', `required:true|numeric|regex:${regex.phoneNumber}`);
    }
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <>
        {this.loader.spinner}
        <div className={classes.modalDetail}>
          {
            this.groupInputControls.inputControls
              .map((inputControl: IViewInputControl, index: number) =>
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  classes={{
                    flexRow: classes.fullFlex,
                  }}
                  field={this.getField(inputControl.fieldKey || '')}
                  isEditable={this.isEditable}
                  onValueChange={(option, fieldKey) => this.onValueChange(option, inputControl.fieldKey || '')}
                />
              )
          }
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant='contained'
              color='primary'
              onClick={() => this.upsertContact()}
              disabled={this.form.hasError}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  render(): ReactNode {
    const { classes, viewMode } = this.props as Required<Props>;
    return (
      <Dialog
        title={`${viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Contact`}
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

export default withStyles(styles)(UpsertContact);