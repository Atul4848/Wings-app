import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPICustomsDecal, ICustomsDecalRequest } from '../Interfaces';
import { RegistryRefModel } from '@wings/shared';

@modelProtection
export class CustomsDecalModel extends CoreModel {
  customsDecalNumber: number;
  year: number;
  note: SettingsTypeModel;
  registry: RegistryRefModel;

  constructor(data?: Partial<CustomsDecalModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomsDecal): CustomsDecalModel {
    if (!apiData) {
      return new CustomsDecalModel();
    }
    const data: Partial<CustomsDecalModel> = {
      ...apiData,
      id: apiData.id,
      customsDecalNumber: apiData.customsDecalNumber,
      year: apiData.year,
      note: SettingsTypeModel.deserialize({
        ...apiData?.noteType,
        id: apiData?.noteType?.noteTypeId,
      }),
      registry: RegistryRefModel.deserialize(apiData.registry),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CustomsDecalModel(data);
  }

  static deserializeList(apiDataList: IAPICustomsDecal[]): CustomsDecalModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomsDecalModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): ICustomsDecalRequest {
    return {
      id: this.id,
      customsDecalNumber: this.customsDecalNumber || null,
      year: Number(this.year),
      noteTypeId: this.note?.id || null,
      registryId: this.registry.id,
      ...this._serialize(),
    };
  }
}
