import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIRegistryRef } from '../Interfaces';

@modelProtection
export class RegistryRefModel extends CoreModel {
  constructor(data?: Partial<RegistryRefModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRegistryRef): RegistryRefModel {
    if (!apiData) {
      return new RegistryRefModel();
    }

    const data: Partial<RegistryRefModel> = {
      id: apiData.registryId || apiData.id,
      name: apiData.name,
    };

    return new RegistryRefModel(data);
  }

  static deserializeList(apiDataList: IAPIRegistryRef[]): RegistryRefModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIRegistryRef) => RegistryRefModel.deserialize(apiData)) : [];
  }
}
