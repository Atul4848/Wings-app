import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPermitValidityRequest, IAPIPermitValidity } from '../Interfaces';

@modelProtection
export class PermitValidityModel extends CoreModel {
  presetValidity: SettingsTypeModel;
  permitId: number = 0;
  toleranceMinus: string = '';
  tolerancePlus: string = '';
  flightOperationalCategory: SettingsTypeModel;

  constructor(data?: Partial<PermitValidityModel>) {
    super(data);
    Object.assign(this, data);
    this.flightOperationalCategory = new SettingsTypeModel(data?.flightOperationalCategory);
    this.presetValidity = new SettingsTypeModel(data?.presetValidity);
  }

  static deserialize(apiData: IAPIPermitValidity): PermitValidityModel {
    if (!apiData) {
      return new PermitValidityModel();
    }
    return new PermitValidityModel({
      ...apiData,
      flightOperationalCategory: new SettingsTypeModel({
        ...apiData.flightOperationalCategory,
        id: apiData.flightOperationalCategory?.flightOperationalCategoryId,
      }),
      toleranceMinus: apiData?.toleranceMinus,
      tolerancePlus: apiData?.tolerancePlus,
      permitId: apiData?.permitId,
      presetValidity: new SettingsTypeModel({
        ...apiData.presetValidity,
        id: apiData.presetValidity?.presetValidityId || apiData.presetValidity?.id,
      }),
      ...this.deserializeAuditFields(apiData),
    });
  }

  public serialize(): IAPIPermitValidityRequest {
    return {
      id: this.id,
      statusId: this.status?.id,
      toleranceMinus: this.toleranceMinus,
      tolerancePlus: this.tolerancePlus,
      permitId: this.permitId,
      presetValidityId: this.presetValidity?.id,
      flightOperationalCategoryId: this.flightOperationalCategory?.id,
    };
  }

  static deserializeList(apiDataList: IAPIPermitValidity[]): PermitValidityModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPermitValidity) => PermitValidityModel.deserialize(apiData))
      : [];
  }
}
