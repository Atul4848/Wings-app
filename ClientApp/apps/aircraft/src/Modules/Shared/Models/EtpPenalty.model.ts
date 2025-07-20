import { IAPIEtpPenalty } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class EtpPenaltyModel extends CoreModel implements ISelectOption {
  biasFields: number = null;
  etpPenaltyBiasType: SettingsTypeModel;
  etpPenaltyApplyTo: SettingsTypeModel;
  etpPenaltyCategory: SettingsTypeModel;
  constructor(data?: Partial<EtpPenaltyModel>) {
    super(data);
    Object.assign(this, data);
    this.etpPenaltyBiasType = new SettingsTypeModel(data?.etpPenaltyBiasType);
    this.etpPenaltyApplyTo = new SettingsTypeModel(data?.etpPenaltyApplyTo);
    this.etpPenaltyCategory = new SettingsTypeModel(data?.etpPenaltyCategory);
  }

  static deserialize(apiData: IAPIEtpPenalty): EtpPenaltyModel {
    if (!apiData) {
      return new EtpPenaltyModel();
    }
    const data: Partial<EtpPenaltyModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpPenaltyBiasType: SettingsTypeModel.deserialize({
        ...apiData.etpPenaltyBiasType,
        id: apiData.etpPenaltyBiasType?.etpPenaltyBiasTypeId,
      }),
      etpPenaltyApplyTo: SettingsTypeModel.deserialize({
        ...apiData.etpPenaltyApplyTo,
        id: apiData.etpPenaltyApplyTo?.etpPenaltyApplyToId,
      }),
      etpPenaltyCategory: SettingsTypeModel.deserialize({
        ...apiData.etpPenaltyCategory,
        id: apiData.etpPenaltyCategory?.etpPenaltyCategoryId,
      }),
    };
    return new EtpPenaltyModel(data);
  }

  public serialize(): IAPIEtpPenalty {
    return {
      id: this.id || 0,
      biasFields: Utilities.getNumberOrNullValue(this.biasFields),
      etpPenaltyBiasTypeId: this.etpPenaltyBiasType?.id || null,
      etpPenaltyCategoryId: this.etpPenaltyCategory?.id,
      etpPenaltyApplyToId: this.etpPenaltyApplyTo?.id || null,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpPenalty[]): EtpPenaltyModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEtpPenalty) => EtpPenaltyModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
