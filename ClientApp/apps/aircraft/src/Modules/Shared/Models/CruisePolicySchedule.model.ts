import { AccessLevelModel, SourceTypeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { CruiseScheduleModel } from './CruiseSchedule.model';
import { IAPICruisePolicySchedule } from '../Interfaces';

@modelProtection
export class CruisePolicyScheduleModel extends CruiseScheduleModel {
  id: number = 0;
  isDefault: boolean = false;
  schedule: SettingsTypeModel;

  constructor(data?: Partial<CruisePolicyScheduleModel>) {
    super(data);
    Object.assign(this, data);
    this.schedule = new SettingsTypeModel(data?.schedule);
  }

  static deserialize(apiData: IAPICruisePolicySchedule): CruisePolicyScheduleModel {
    if (!apiData) {
      return new CruisePolicyScheduleModel();
    }
    const data: Partial<CruisePolicyScheduleModel> = {
      ...apiData,
      schedule: SettingsTypeModel.deserialize({ ...apiData, name: apiData.profile }),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new CruisePolicyScheduleModel(data);
  }

  static deserializeList(apiDataList: IAPICruisePolicySchedule[]): CruisePolicyScheduleModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPICruisePolicySchedule) => CruisePolicyScheduleModel.deserialize(apiData))
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
