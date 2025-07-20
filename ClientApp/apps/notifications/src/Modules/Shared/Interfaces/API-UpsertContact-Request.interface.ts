import { DELIVERY_TYPE } from '../Enums';

export interface IAPIUpsertContactRequest {
    ContactId: number;
    CSDUserId: number;
    Name: string;
    CustomerNumber: string;
    Value: string;
    DeliveryType: DELIVERY_TYPE;
}