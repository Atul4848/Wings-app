import { IAPIEtpApuBurn } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  Utilities,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';

@modelProtection
export class EtpApuBurnModel extends CoreModel implements ISelectOption {
  time: number = null;
  burn: number = null;
  etpApuBurnMethod: SettingsTypeModel;
  constructor(data?: Partial<EtpApuBurnModel>) {
    super(data);
    Object.assign(this, data);
    this.etpApuBurnMethod = new SettingsTypeModel(data?.etpApuBurnMethod);
  }

  static deserialize(apiData: IAPIEtpApuBurn): EtpApuBurnModel {
    if (!apiData) {
      return new EtpApuBurnModel();
    }
    const data: Partial<EtpApuBurnModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpApuBurnMethod: SettingsTypeModel.deserialize({
        ...apiData.etpapuBurnMethod,
        id: apiData.etpapuBurnMethod?.etpapuBurnMethodId,
      }),
    };
    return new EtpApuBurnModel(data);
  }

  public serialize(): IAPIEtpApuBurn {
    return {
      id: this.id || 0,
      time: Utilities.getNumberOrNullValue(this.time),
      burn: Utilities.getNumberOrNullValue(this.burn),
      etpapuBurnMethodId: this.etpApuBurnMethod?.id || null,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpApuBurn[]): EtpApuBurnModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEtpApuBurn) => EtpApuBurnModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
