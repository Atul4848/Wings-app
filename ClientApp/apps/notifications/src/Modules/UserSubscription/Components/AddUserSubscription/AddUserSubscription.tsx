import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './AddUserSubscription.styles';
import { BaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { UIStore, Utilities, IClasses, ISelectOption, IOptionValue } from '@wings-shared/core';
import {
  CategoryEventTypeOptions,
  CategoryStore,
  ContactStore,
  EventTypeModel,
  EventTypeStore,
  IAPIAddUserSubscriptionRequest,
  SubscriptionStore,
  UserModel,
  UserSubscriptionModel,
} from '../../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { action, observable } from 'mobx';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { fields } from './Fields';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import classNames from 'classnames';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';

interface Props {
  subscriptionStore?: SubscriptionStore;
  contactStore?: ContactStore;
  eventTypeStore?: EventTypeStore;
  categoryStore?: CategoryStore;
  addUserSubscription: (request: IAPIAddUserSubscriptionRequest) => void;
  viewMode?: VIEW_MODE;
  classes?: IClasses;
}

@inject('subscriptionStore', 'eventTypeStore', 'categoryStore')
@observer
class AddUserSubscription extends BaseUpsertComponent<Props, UserSubscriptionModel> {
  @observable private eventTypes: EventTypeModel[] = [];
  private tooltipText: string = 'This field supports optional filters in json format for example: {"sample":123456}';

  constructor(Props) {
    super(Props, fields);
  }

  componentDidMount() {
    UIStore.setPageLoader(true);
    forkJoin([
      this.props.eventTypeStore?.getEventTypes(),
      this.props.categoryStore?.getCategories(),
      this.props.contactStore?.loadContacts(this.props.subscriptionStore?.selectedUser?.customerNumber || ''),
    ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(( eventTypes : EventTypeModel[]) => {
        this.eventTypes = eventTypes.filter(x => x.publicEnabled);
      });
  }

  /* istanbul ignore next */
  private get loadCategories(): ISelectOption[]{
    const categoryStore = this.props.categoryStore as CategoryStore;
    return categoryStore?.categories.filter(x => !x.isSubCategory);
  }

  /* istanbul ignore next */
  private get loadSubCategories(): ISelectOption[]{
    const categoryStore = this.props.categoryStore as CategoryStore;
    return categoryStore?.categories.filter(x => x.isSubCategory);
  }

  /* istanbul ignore next */
  private get loadEventTypes(): ISelectOption[] {
    return this.eventTypes
      .map(item => item.name as string)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map(item => ({ label: item, value: item }));
  }

  /* istanbul ignore next */
  private get loadContacts(): ISelectOption[] {
    const contactStore = this.props.contactStore as ContactStore;
    return contactStore?.contacts
      .map(item => `${item.name as string} | ${item.value as string}`)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map(item => ({ label: item, value: item }));
  }

  @action
  private addUserSubscription(): void {
    const { contact, category, subCategory, eventType, isEnabled, filter } = this.form.values();
    const { contactStore, addUserSubscription } = this.props;
    const { csdUserId, customerNumber } = this.props.subscriptionStore?.selectedUser as UserModel;
    const contactValue = (contact.value as string)?.split('|')[1].trim();
    const request: IAPIAddUserSubscriptionRequest = {
      CSDUserId: csdUserId,
      CustomerNumber: customerNumber,
      IsEnabled: isEnabled || false,
      Category: category?.value as string,
      SubCategory: subCategory?.value as string,
      EventTypeId: Number(this.eventTypes.find(x => x.name === (eventType?.value as string))?.id),
      ContactId: Number(contactStore?.contacts.find(x => x.value === contactValue)?.id),
      DeliveryType: null || '',
      Filter: filter,
    }
    addUserSubscription(request);
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls {
    return {
      title: 'Contacts',
      inputControls: [
        {
          fieldKey: 'contact',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadContacts,
        },
        {
          fieldKey: 'categoryEventType',
          type: EDITOR_TYPES.DROPDOWN,
          options: CategoryEventTypeOptions,
        },
        {
          fieldKey: 'category',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadCategories,
          isHidden: !this.isCategoryType,
        },
        {
          fieldKey: 'subCategory',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadSubCategories,
          isHidden: !this.isCategoryType,
        },
        {
          fieldKey: 'eventType',
          type: EDITOR_TYPES.DROPDOWN,
          options: this.loadEventTypes,
          isHidden: !this.isEventType,
        },
        {
          fieldKey: 'isEnabled',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'filter',
          type: EDITOR_TYPES.TEXT_FIELD,
          isHidden: this.showOrHideFilter,
          showExpandButton: false,
          customErrorMessage: this.isValidJson,
          tooltipText: this.tooltipText,
          isInputCustomLabel: true,
          multiline: true,
          rows: 10,
        },
      ],
    };
  }

  private get showOrHideFilter(): boolean {
    return !(this.isCategoryType && this.isCategorySelected) &&
      !(this.isEventType && this.isEventTypeSelected);
  }

  private get isCategorySelected(): boolean {
    return Boolean(this.getField('category')?.value?.value);
  }

  private get isEventTypeSelected(): boolean {
    return Boolean(this.getField('eventType')?.value?.value);
  }

  private get isCategoryType(): boolean {
    return this.getField('categoryEventType')?.value?.value === 'CategoryType';
  }

  private get isEventType(): boolean {
    return this.getField('categoryEventType')?.value?.value === 'EventType';
  }

  private get isValidJson(): string {
    const filter: string = this.getField('filter').value;
    const errMessage = 'The Filter field has invalid json format.';
    if (filter) {
      try {
        if (parseInt(filter)) {
          return errMessage;
        }
        JSON.parse(filter);
      }
      catch {
        return errMessage;
      }
    }
    return '';
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    if (value && Utilities.isEqual(fieldKey, 'categoryEventType')) {
      if ((value as ISelectOption).value === 'CategoryType') {
        this.setFormRules('eventType', false, 'Event Type');
        this.setFormRules('category', true, 'Category');
      }
      if ((value as ISelectOption).value === 'EventType') {
        this.setFormRules('eventType', true, 'Event Type');
        this.setFormRules('category', false, 'Category');
      }
      this.getField('category').set(null);
      this.getField('subCategory').set(null);
      this.getField('eventType').set(null);
    }
    this.getField(fieldKey).set(value);
  }

  /* istanbul ignore next */
  private get dialogContent(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <>
        {this.loader.spinner}
        <div className={classes.flexRow}>
          <div className={classes.flexWrap}>
            {
              this.groupInputControls.inputControls
                .filter(inputControl => !inputControl.isHidden)
                .map((inputControl: IViewInputControl, index: number) =>
                  <ViewInputControl
                    {...inputControl}
                    key={inputControl.fieldKey}
                    field={this.getField(inputControl.fieldKey || '')}
                    isEditable={this.isEditable}
                    onValueChange={(option, fieldKey) => this.onValueChange(option, inputControl.fieldKey || '')}
                    classes={{
                      flexRow: classNames({
                        [classes.filterField]: inputControl.fieldKey === 'filter',
                      }),
                    }}
                  />
                )
            }
          </div>
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="outlined"
              onClick={() => ModalStore.close()}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              variant='contained'
              color='primary'
              onClick={() => this.addUserSubscription()}
              disabled={this.form.hasError || this.isValidJson || UIStore.pageLoading}
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
        title={`${viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} User Subscription`}
        open={true}
        classes={{
          paperSize: classes.paperSize,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
      />

    )
  }
}

export default withStyles(styles)(AddUserSubscription);