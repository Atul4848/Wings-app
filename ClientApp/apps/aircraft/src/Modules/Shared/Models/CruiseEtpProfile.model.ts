import { IAPICruiseEtpProfile } from '../Interfaces';
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
export class CruiseEtpProfileModel extends CoreModel implements ISelectOption {
  maxFlightLevel: number = null;
  maxFlightLevelIncrement: number = null;
  maxFlightLevelIncrementLimit: number = null;
  speed: string = '';
  additionalMaxFlightLevel1: number = null;
  additionalTime2: number = null;
  additionalMaxFlightLevel2: number = null;
  additionalTime1: number = null;
  etpCruise: SettingsTypeModel;
  constructor(data?: Partial<CruiseEtpProfileModel>) {
    super(data);
    Object.assign(this, data);
    this.etpCruise = new SettingsTypeModel(data?.etpCruise);
  }

  static deserialize(apiData: IAPICruiseEtpProfile): CruiseEtpProfileModel {
    if (!apiData) {
      return new CruiseEtpProfileModel();
    }
    const data: Partial<CruiseEtpProfileModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpCruise: SettingsTypeModel.deserialize({
        ...apiData.etpCruise,
        id: apiData.etpCruise?.etpCruiseId,
      }),
    };
    return new CruiseEtpProfileModel(data);
  }

  public serialize(): IAPICruiseEtpProfile {
    return {
      id: this.id || 0,
      maxFlightLevel: Utilities.getNumberOrNullValue(this.maxFlightLevel),
      maxFlightLevelIncrement: Utilities.getNumberOrNullValue(this.maxFlightLevelIncrement),
      maxFlightLevelIncrementLimit: Utilities.getNumberOrNullValue(this.maxFlightLevelIncrementLimit),
      speed: this.speed,
      additionalMaxFlightLevel1: Utilities.getNumberOrNullValue(this.additionalMaxFlightLevel1),
      additionalTime2: Utilities.getNumberOrNullValue(this.additionalTime2),
      additionalMaxFlightLevel2: Utilities.getNumberOrNullValue(this.additionalMaxFlightLevel2),
      additionalTime1: Utilities.getNumberOrNullValue(this.additionalTime1),
      etpCruiseId: this.etpCruise?.id || null,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPICruiseEtpProfile[]): CruiseEtpProfileModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPICruiseEtpProfile) => CruiseEtpProfileModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
