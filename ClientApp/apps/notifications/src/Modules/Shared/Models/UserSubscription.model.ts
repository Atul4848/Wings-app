import moment from 'moment';
import { DELIVERY_TYPE, VERIFICATION_STATUS } from '../Enums';
import { IAPISubscriptionResponse } from '../Interfaces';
import { DATE_FORMAT, IdNameModel } from '@wings-shared/core';

export class UserSubscriptionModel extends IdNameModel {
  eventTypeId: number = 0;
  eventTypeName: string = '';
  subscriptionCategory: string = '';
  category: string = '';
  subscriptionType: string = '';
  subCategory: string = '';
  eventTypeCategory: string = '';
  isEnabled: boolean = true;
  contactId: number = 0;
  contactName: string = '';
  contactValue: string = '';
  userId: number = 0;
  deliveryType: DELIVERY_TYPE = DELIVERY_TYPE.EMAIL;
  deliveryTypeName: string = '';
  status: VERIFICATION_STATUS;
  filter: string = '';
  customerNumber: string = '';
  deletedOn: string = '';

  constructor(data?: Partial<UserSubscriptionModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(subscription: IAPISubscriptionResponse): UserSubscriptionModel {
    if (!subscription) {
      return new UserSubscriptionModel();
    }

    const data: Partial<UserSubscriptionModel> = {
      id: subscription.SubscriptionId,
      category: subscription.Category,
      subscriptionType: subscription.EventTypeId ? 'EventType' : 'Category',
      eventTypeCategory: subscription.EventTypeCategory,
      subscriptionCategory: this.getCategory(subscription.Category, subscription.SubCategory),
      subCategory: subscription.SubCategory,
      eventTypeId: subscription.EventTypeId,
      eventTypeName: subscription.EventTypeName,
      isEnabled: subscription.IsEnabled,
      contactId: subscription.ContactId,
      contactName: subscription.ContactName,
      contactValue: subscription.ContactValue,
      userId: subscription.CSDUserId,
      deliveryType: subscription.DeliveryType,
      deliveryTypeName: subscription.DeliveryTypeName,
      status: subscription.Status || VERIFICATION_STATUS.PENDING,
      filter: subscription.Filter,
      customerNumber: subscription.CustomerNumber,
      deletedOn: subscription.DeletedOn
        ? moment.utc(subscription.DeletedOn).local().format(DATE_FORMAT.API_FORMAT)
        : '',
    };

    return new UserSubscriptionModel(data);
  }

  static getCategory(category: string, subCategory: string): string {
    if (Boolean(category) && Boolean(subCategory)) {
      return `${category}/${subCategory}`;
    }
    return Boolean(category) ? category : null;
  }

  static deserializeList(subscriptions?: IAPISubscriptionResponse[]): UserSubscriptionModel[] {
    return subscriptions ? subscriptions.map(subscription => this.deserialize(subscription)) : [];
  }
}
