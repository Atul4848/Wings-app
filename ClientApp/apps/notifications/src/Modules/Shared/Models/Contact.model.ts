import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIContactResponse } from '../Interfaces';
import { DeliveryTypeModel } from './DeliveryType.model';

@modelProtection
export class ContactModel extends IdNameModel {
  userId: number = 0;
  customerNumber: string = '';
  value: string = '';  
  deliveryType: DeliveryTypeModel;  
  deliveryTypeName: string = ''
  hasSubscription: boolean = false;

  constructor(data?: Partial<ContactModel>) {
    super();
    Object.assign(this, data);    
    this.deliveryType = new DeliveryTypeModel(data?.deliveryType);
  }

  static deserialize(contact: IAPIContactResponse): ContactModel {
    if (!contact) {
      return new ContactModel();
    }

    const data: Partial<ContactModel> = {
      id: contact.ContactId,
      name: contact.Name,
      userId: contact.CSDUserId,
      customerNumber: contact.CustomerNumber,
      value: contact.Value,     
      deliveryTypeName: contact.DeliveryTypeName,
      deliveryType: DeliveryTypeModel.deserialize(contact.DeliveryType),
      hasSubscription: contact.HasSubscription,
    }

    return new ContactModel(data);
  }

  static deserializeList(contacts: IAPIContactResponse[]): ContactModel[] {
    return contacts ? contacts.map(contact => this.deserialize(contact)) : [];
  }
}