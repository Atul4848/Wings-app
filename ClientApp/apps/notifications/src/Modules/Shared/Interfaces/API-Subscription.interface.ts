import { DELIVERY_TYPE, VERIFICATION_STATUS } from '../Enums';

export interface IAPISubscriptionResponse {
  SubscriptionId: number;
  EventTypeId: number;
  EventTypeName: string;
  IsEnabled: true;
  ContactId: number;
  Category: string;
  SubCategory: string;
  EventTypeCategory: string;
  ContactName: string;
  ContactValue: string;
  CSDUserId: number;
  DeliveryType: DELIVERY_TYPE;
  DeliveryTypeName: string;
  Status: VERIFICATION_STATUS;
  Filter: string;
  CustomerNumber: string;
  DeletedOn: string;
}
