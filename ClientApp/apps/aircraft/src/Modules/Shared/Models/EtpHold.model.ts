import { IAPIEtpHold } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  Utilities,
  SettingsTypeModel 
} from '@wings-shared/core';

@modelProtection
export class EtpHoldModel extends CoreModel implements ISelectOption {
  time: number = null;
  flightLevel: number = null;
  burn: number = null;
  etpHoldMethod?: SettingsTypeModel;
  constructor(data?: Partial<EtpHoldModel>) {
    super(data);
    Object.assign(this, data);
    this.etpHoldMethod = new SettingsTypeModel(data?.etpHoldMethod);
  }

  static deserialize(apiData: IAPIEtpHold): EtpHoldModel {
    if (!apiData) {
      return new EtpHoldModel();
    }
    const data: Partial<EtpHoldModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpHoldMethod: SettingsTypeModel.deserialize({
        ...apiData.etpHoldMethod,
        id: apiData.etpHoldMethod?.etpHoldMethodId,
      }),
    };
    return new EtpHoldModel(data);
  }

  public serialize(): IAPIEtpHold {
    return {
      id: this.id || 0,
      time: Utilities.getNumberOrNullValue(this.time),
      burn: Utilities.getNumberOrNullValue(this.burn),
      flightLevel: Utilities.getNumberOrNullValue(this.flightLevel),
      etpHoldMethodId: this.etpHoldMethod?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpHold[]): EtpHoldModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEtpHold) => EtpHoldModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
