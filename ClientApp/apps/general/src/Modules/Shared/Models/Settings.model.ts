import { IAPICacheSettingResponse, IAPIUpdateSettingRequest } from '../Interfaces';
import { CacheSettingOptionsModel } from './CacheSettingOptions.model';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class SettingsModel extends IdNameModel<string> {
  key: string = '';
  name: string = '';
  details: string = '';
  isEnabled: boolean = false;
  options: CacheSettingOptionsModel[];

  constructor(data?: Partial<SettingsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(cacheSetting: IAPICacheSettingResponse): SettingsModel {
    if (!cacheSetting) {
      return new SettingsModel();
    }

    const options: CacheSettingOptionsModel[] = [];
    for (let index = 0; index < Object.keys(cacheSetting.Options).length; index++) {
      const optionValue = Object.values(cacheSetting.Options)[index];
      const option = CacheSettingOptionsModel.deserialize(optionValue);
      option.key = Object.keys(cacheSetting.Options)[index];
      options.push(option);
    }

    const data: Partial<SettingsModel> = {
      id: cacheSetting.Key,
      key: cacheSetting.Key,
      name: cacheSetting.Name,
      details: cacheSetting.Details,
      isEnabled: cacheSetting.IsEnabled,
      options: options,
    };

    return new SettingsModel(data);
  }

  public static serialize(cacheSetting: SettingsModel): IAPIUpdateSettingRequest {
    let options = {};
    for (let index = 0; index < cacheSetting.options.length; index++) {
      const optionValue = cacheSetting.options[index];
      options = {
        ...options,
        [optionValue.key]: optionValue.value,
      };
    }
    return {
      isEnabled: cacheSetting.isEnabled,
      key: cacheSetting.key,
      options: options,
    };
  }

  static deserializeList(cacheSettings: IAPICacheSettingResponse[]): SettingsModel[] {
    return cacheSettings
      ? cacheSettings.map((cacheSetting: IAPICacheSettingResponse) => SettingsModel.deserialize(cacheSetting))
      : [];
  }
}
