import { IAPIEtpInitialDescent } from '../Interfaces';
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
export class EtpInitialDescentModel extends CoreModel implements ISelectOption {
  normalProfile: string = '';
  icingProfile: string = '';
  fixedTime?: number = null;
  fixedBurn?: number = null;
  fixedDistance?: number = null;
  flightLevel?: number = null;
  etpLevelOff: SettingsTypeModel;
  etpMainDescent: SettingsTypeModel;
  etpAltDescent: SettingsTypeModel;
  constructor(data?: Partial<EtpInitialDescentModel>) {
    super(data);
    Object.assign(this, data);
    this.etpLevelOff = new SettingsTypeModel(data?.etpLevelOff);
    this.etpMainDescent = new SettingsTypeModel(data?.etpMainDescent);
    this.etpAltDescent = new SettingsTypeModel(data?.etpAltDescent);
  }

  static deserialize(apiData: IAPIEtpInitialDescent): EtpInitialDescentModel {
    if (!apiData) {
      return new EtpInitialDescentModel();
    }
    const data: Partial<EtpInitialDescentModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpLevelOff: SettingsTypeModel.deserialize({
        ...apiData.etpLevelOff,
        id: apiData.etpLevelOff?.etpLevelOffId,
      }),
      etpMainDescent: SettingsTypeModel.deserialize({
        ...apiData.etpMainDescent,
        id: apiData.etpMainDescent?.etpMainDescentId,
      }),
      etpAltDescent: SettingsTypeModel.deserialize({
        ...apiData.etpAltDescent,
        id: apiData.etpAltDescent?.etpAltDescentId,
      }),
    };
    return new EtpInitialDescentModel(data);
  }

  public serialize(): IAPIEtpInitialDescent {
    return {
      id: this.id || 0,
      normalProfile: this.normalProfile,
      icingProfile: this.icingProfile,
      fixedTime: Utilities.getNumberOrNullValue(this.fixedTime),
      fixedBurn: Utilities.getNumberOrNullValue(this.fixedBurn),
      fixedDistance: Utilities.getNumberOrNullValue(this.fixedDistance),
      flightLevel: Utilities.getNumberOrNullValue(this.flightLevel),
      etpLevelOffId: this.etpLevelOff?.id || null,
      etpMainDescentId: this.etpMainDescent?.id,
      etpAltDescentId: this.etpAltDescent?.id || null,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpInitialDescent[]): EtpInitialDescentModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEtpInitialDescent) => EtpInitialDescentModel.deserialize(apiData))
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
