import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPICustomerProfileEntityRequest } from '../Interfaces/API-CustomerProfile.interface';

@modelProtection
export class CustomerProfileEntityModel extends CoreModel {
  entityId: number;
  entityCode: string;
  entityName: string;

  constructor(data?: Partial<CustomerProfileEntityModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerProfileEntityRequest): CustomerProfileEntityModel {
    if (!apiData) {
      return new CustomerProfileEntityModel();
    }
    const data: Partial<CustomerProfileEntityModel> = {
      ...apiData,
      id: apiData.id,
      entityName: apiData.entityName,
      entityCode: apiData.entityCode,
      entityId: apiData.entityId,
    };
    return new CustomerProfileEntityModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerProfileEntityRequest[]): CustomerProfileEntityModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerProfileEntityModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    if (this.entityName && this.entityCode) {
      return `${this.entityName} (${this.entityCode})`;
    }
    return this.entityName;
  }

  public get value(): number {
    return this.entityId;
  }
}
