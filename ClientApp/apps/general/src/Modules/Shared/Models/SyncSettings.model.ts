import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPISyncSettings } from '../Interfaces';
import { SyncSettingOptionsModel } from './SyncSettingOptions.model';

@modelProtection
export class SyncSettingsModel extends IdNameModel {
  key: string = '';
  name: string = '';
  details: string = '';
  isEnabled: boolean = false;
  options: SyncSettingOptionsModel[];
  type: string = '';

  constructor(data?: Partial<SyncSettingsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(syncSettings: IAPISyncSettings): SyncSettingsModel {
    if (!syncSettings) {
      return new SyncSettingsModel();
    }

    const options: SyncSettingOptionsModel[] = [];
    for (let index = 0; index < Object.keys(syncSettings.Options).length; index++) {
      const optionValue = Object.values(syncSettings.Options)[index];
      const option = SyncSettingOptionsModel.deserialize(optionValue);
      option.key = Object.keys(syncSettings.Options)[index];
      options.push(option);
    }

    const data: Partial<SyncSettingsModel> = {
      key: syncSettings.Key,
      name: syncSettings.Name,
      isEnabled: syncSettings.IsEnabled,
      details: syncSettings.Details,
      type: syncSettings.Type,
      options: options,
    };

    return new SyncSettingsModel(data);
  }
  static deserializeList(syncSettings: IAPISyncSettings[]): SyncSettingsModel[] {
    return syncSettings
      ? syncSettings.map((syncSetting: IAPISyncSettings) => SyncSettingsModel.deserialize(syncSetting))
      : [];
  }

  static serialize(syncSettings: SyncSettingsModel): IAPISyncSettings {
    let options = {};
    for (let index = 0; index < syncSettings.options.length; index++) {
      const optionValue = syncSettings.options[index];
      options = {
        ...options,
        [optionValue.key]: optionValue.value,
      };
    }
    return {
      Key: syncSettings.key,
      Name: syncSettings.name,
      IsEnabled: syncSettings.isEnabled,
      Details: syncSettings.details,
      Type: syncSettings.type,
      Options: options,
    };
  }
}
