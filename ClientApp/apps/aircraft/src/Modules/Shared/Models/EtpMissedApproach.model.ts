import { IAPIEtpMissedApproach } from '../Interfaces';
import { AccessLevelModel, CoreModel, ISelectOption, SourceTypeModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class EtpMissedApproachModel extends CoreModel implements ISelectOption {
  time: number = null;
  distance: number = null;
  burn: number = null;
  constructor(data?: Partial<EtpMissedApproachModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIEtpMissedApproach): EtpMissedApproachModel {
    if (!apiData) {
      return new EtpMissedApproachModel();
    }
    const data: Partial<EtpMissedApproachModel> = {
      ...apiData,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new EtpMissedApproachModel(data);
  }

  public serialize(): IAPIEtpMissedApproach {
    return {
      id: this.id || 0,
      time: Number(this.time),
      burn: Number(this.burn),
      distance: Number(this.distance),
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEtpMissedApproach[]): EtpMissedApproachModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIEtpMissedApproach) => EtpMissedApproachModel.deserialize(apiData))
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
