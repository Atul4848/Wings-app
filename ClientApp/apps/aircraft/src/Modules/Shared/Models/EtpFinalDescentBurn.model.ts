import { IAPIEtpFinalDescentBurn } from '../Interfaces';
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
export class EtpFinalDescentBurnModel extends CoreModel implements ISelectOption {
  time: number = null;
  burn: number = null;
  distance: number = null;
  etpFinalDescentBurnMethod?: SettingsTypeModel;
  constructor(data?: Partial<EtpFinalDescentBurnModel>) {
    super(data);
    Object.assign(this, data);
    this.etpFinalDescentBurnMethod = new SettingsTypeModel(data?.etpFinalDescentBurnMethod);
  }

  static deserialize(apiData: IAPIEtpFinalDescentBurn): EtpFinalDescentBurnModel {
    if (!apiData) {
      return new EtpFinalDescentBurnModel();
    }
    const data: Partial<EtpFinalDescentBurnModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      etpFinalDescentBurnMethod: SettingsTypeModel.deserialize({
        ...apiData.etpFinalDescentBurnMethod,
        id: apiData.etpFinalDescentBurnMethod?.etpFinalDescentBurnMethodId,
      }),
    };
    return new EtpFinalDescentBurnModel(data);
  }

  public serialize(): IAPIEtpFinalDescentBurn {
    return {
      id: this.id || 0,
      time: Utilities.getNumberOrNullValue(this.time),
      burn: Utilities.getNumberOrNullValue(this.burn),
      distance: Utilities.getNumberOrNullValue(this.distance),
      etpFinalDescentBurnMethodId: this.etpFinalDescentBurnMethod?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpFinalDescentBurn[]): EtpFinalDescentBurnModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEtpFinalDescentBurn) => EtpFinalDescentBurnModel.deserialize(apiData))
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
