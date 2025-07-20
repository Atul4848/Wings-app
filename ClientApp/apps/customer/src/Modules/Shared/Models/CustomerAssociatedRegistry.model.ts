import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPICustomerAssociatedRegistry } from '../Interfaces';

@modelProtection
export class CustomerAssociatedRegistryModel extends CoreModel {
  customerAssociatedRegistryId: number;
  registry: SettingsTypeModel;

  constructor(data?: Partial<CustomerAssociatedRegistryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerAssociatedRegistry): CustomerAssociatedRegistryModel {
    if (!apiData) {
      return new CustomerAssociatedRegistryModel();
    }
    const data: Partial<CustomerAssociatedRegistryModel> = {
      ...apiData,
      registry: new SettingsTypeModel({
        ...apiData,
        id: apiData.registry.registryId,
      }),
    };
    return new CustomerAssociatedRegistryModel(data);
  }

  static deserializeList(
    apiDataList: IAPICustomerAssociatedRegistry[]
  ): CustomerAssociatedRegistryModel[] {
    return apiDataList
      ? apiDataList.map(apiData => CustomerAssociatedRegistryModel.deserialize(apiData))
      : [];
  }
}
