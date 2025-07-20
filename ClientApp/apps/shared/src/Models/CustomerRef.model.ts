import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPICustomerRef } from '../Interfaces';

@modelProtection
export class CustomerRefModel extends CoreModel implements ISelectOption {
  number: string;
  partyId: number;
  startDate: string;
  endDate: string;

  constructor(data?: Partial<CustomerRefModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerRef): CustomerRefModel {
    if (!apiData) {
      return new CustomerRefModel();
    }

    const data: Partial<CustomerRefModel> = {
      id: apiData.customerId || apiData.id,
      name: apiData.name,
      number: apiData.number,
      partyId: apiData.partyId,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
    };

    return new CustomerRefModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerRef[]): CustomerRefModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPICustomerRef) => CustomerRefModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    if (this.name && this.number) {
      return `${this.name} (${this.number})`;
    }
    return this.name || this.number || '';
  }

  public get value(): string | number {
    return this.id;
  }
}
