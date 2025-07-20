import { IAPISyncSettingOptions } from '../Interfaces';
import { IdNameModel, modelProtection, Utilities } from '@wings-shared/core';

@modelProtection
export class SyncSettingOptionsModel extends IdNameModel {
  displayName: string = '';
  type: string = '';
  value: string | boolean = '';
  key: string = '';

  constructor(data?: Partial<SyncSettingOptionsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(jobOptions: IAPISyncSettingOptions): SyncSettingOptionsModel {
    if (!jobOptions) {
      return new SyncSettingOptionsModel();
    }

    const data: Partial<SyncSettingOptionsModel> = {
      id: Utilities.getTempId(true),
      displayName: jobOptions.DisplayName,
      type: jobOptions.Type,
      value: jobOptions.Value,
    };

    return new SyncSettingOptionsModel(data);
  }

  static serialize(jobSettings: SyncSettingOptionsModel): IAPISyncSettingOptions {
    return {
      DisplayName: jobSettings.displayName,
      Type: jobSettings.type,
      Value: jobSettings.value,
    };
  }

  static deserializeList(jobSettings: IAPISyncSettingOptions[]): SyncSettingOptionsModel[] {
    return jobSettings
      ? jobSettings.map((jobOptions: IAPISyncSettingOptions) => SyncSettingOptionsModel.deserialize(jobOptions))
      : [];
  }
}
