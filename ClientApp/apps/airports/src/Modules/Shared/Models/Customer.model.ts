import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPICustomer } from '../Interfaces';

@modelProtection
export class CustomerModel extends CoreModel {
  customerId: number = 0;

  constructor(data?: Partial<CustomerModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiCustomer: IAPICustomer): CustomerModel {
    if (!apiCustomer) {
      return new CustomerModel();
    }
    const data: Partial<CustomerModel> = {
      customerId: apiCustomer.customerId || apiCustomer.id,
      name: apiCustomer.name,
    };
    return new CustomerModel(data);
  }

  static deserializeList(apiDataList: IAPICustomer[]): CustomerModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPICustomer) => CustomerModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPICustomer {
    return {
      customerId: this.customerId,
      name: this.name,
    };
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.name;
  }
  public get value(): number {
    return this.customerId;
  }
}
