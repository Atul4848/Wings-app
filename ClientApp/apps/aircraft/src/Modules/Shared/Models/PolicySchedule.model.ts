import { SettingsProfileModel } from './SettingsProfile.model';
import { IAPIPolicySchedule } from '../Interfaces';
import { AccessLevelModel, SourceTypeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class PolicyScheduleModel extends SettingsProfileModel {
  id: number = 0;
  isDefault: boolean = false;
  schedule: SettingsTypeModel;

  constructor(data?: Partial<PolicyScheduleModel>) {
    super(data);
    Object.assign(this, data);
    this.schedule = new SettingsTypeModel(data?.schedule);
  }

  static deserialize(apiData: IAPIPolicySchedule): PolicyScheduleModel {
    if (!apiData) {
      return new PolicyScheduleModel();
    }
    const data: Partial<PolicyScheduleModel> = {
      ...apiData,
      schedule: SettingsTypeModel.deserialize({ ...apiData, name: apiData.profile }),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new PolicyScheduleModel(data);
  }

  static deserializeList(apiDataList: IAPIPolicySchedule[]): PolicyScheduleModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPolicySchedule) => PolicyScheduleModel.deserialize(apiData))
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
