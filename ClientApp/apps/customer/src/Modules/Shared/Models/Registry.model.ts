import { CoreModel, IBaseApiResponse, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPICustomer, IAPIRegistry } from '../Interfaces';
import { CustomerModel } from './Customer.model';

@modelProtection
export class RegistryModel extends CoreModel implements ISelectOption {
  name: string;
  associatedCustomers: CustomerModel[];
  constructor(data?: Partial<RegistryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRegistry): RegistryModel {
    if (!apiData) {
      return new RegistryModel();
    }
    const data: Partial<RegistryModel> = {
      ...apiData,
      id: apiData.registryId || apiData.id,
      associatedCustomers: CustomerModel.deserializeList(apiData.associatedCustomers as IAPICustomer[]),
      ...this.deserializeAuditFields(apiData),
    };
    return new RegistryModel(data);
  }

  static deserializeList(apiDataList: IAPIRegistry[]): RegistryModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => RegistryModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): IBaseApiResponse {
    return {
      id: this.id || 0,
      name: this.name,
      ...this._serialize(),
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}
