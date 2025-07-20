import { CoreModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class CustomersModel extends CoreModel {
  id: number = 0;
  name: string = '';
  number: string = '';
  customerId: number = 0;
  operationalEssentialId: number = 0;
  partyId: number = 0;

  constructor(data?: Partial<CustomersModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: CustomersModel): CustomersModel {
    if (!apiData) {
      return new CustomersModel();
    }
    const data: Partial<CustomersModel> = {
      ...apiData,
      id: apiData.id,
      customerId: apiData.customerId,
      name: apiData.name,
      number: apiData.number,
      partyId: apiData.partyId
    };
    return new CustomersModel(data);
  }

  static deserializeList(apiDataList: CustomersModel[]): CustomersModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomersModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.name;
  }

}
