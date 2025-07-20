import { DELIVERY_TYPE } from '../Enums';

export interface IAPIContactResponse {
  ContactId: number;
  Name: string;
  CSDUserId: number;
  CustomerNumber: string;
  Value: string;
  DeliveryType: DELIVERY_TYPE;
  DeliveryTypeName: string;
  HasSubscription: boolean;
}