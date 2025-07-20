import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPICustomerProfile } from '../Interfaces/API-CustomerProfile.interface';
import { CustomerProfileEntityModel } from './CustomerProfileEntityRequest.model';

@modelProtection
export class CustomerProfileModel extends CoreModel {
  customerName: string;
  customerNumber: string;
  partyId: number;
  customerProfileLevel: SettingsTypeModel;
  profileTopic: SettingsTypeModel;
  entities: CustomerProfileEntityModel[];
  startDate: string = null;
  endDate: string = null;
  text: string = '';
  isUFN: boolean;

  constructor(data?: Partial<CustomerProfileModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerProfile): CustomerProfileModel {
    if (!apiData) {
      return new CustomerProfileModel();
    }
    const data: Partial<CustomerProfileModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.customerProfileId || apiData.id,
      profileTopic: new SettingsTypeModel({
        ...apiData.profileTopic,
        id: apiData.profileTopic?.id || apiData.profileTopic?.profileTopicId,
      }),
      customerProfileLevel: new SettingsTypeModel({
        ...apiData.customerProfileLevel,
        id: apiData.customerProfileLevel?.id || apiData.customerProfileLevel?.customerProfileLevelId,
      }),
      entities: CustomerProfileEntityModel.deserializeList(apiData.entities),
    };
    return new CustomerProfileModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerProfile[]): CustomerProfileModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerProfileModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IAPICustomerProfile {
    return {
      id: this.id,
      customerProfileLevelId: this.customerProfileLevel?.id,
      customerName: this.customerName,
      customerNumber: this.customerNumber,
      partyId: this.partyId,
      profileTopicId: this.profileTopic.id,
      startDate: this.startDate,
      endDate: this.endDate,
      text: this.text,
      isUFN: this.isUFN,
      entities: this.entities?.map(c => {
        return {
          id: 0,
          entityCode: c?.entityCode,
          entityId: c?.entityId || c?.id,
          entityName: c?.entityName || c?.label,
        };
      }),
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
    };
  }
}
