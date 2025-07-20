import { IAPICacheSettingOption } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class CacheSettingOptionsModel {
    displayName: string = '';
    type: string = '';
    value: string = '';
    key: string = '';

    constructor(data?: Partial<CacheSettingOptionsModel>) {
      Object.assign(this, data);
    }

    static deserialize(cacheSettingOption: IAPICacheSettingOption): CacheSettingOptionsModel {
      if (!cacheSettingOption) {
        return new CacheSettingOptionsModel();
      }

      const data: Partial<CacheSettingOptionsModel> = {
        displayName: cacheSettingOption.DisplayName,
        type: cacheSettingOption.Type,
        value: cacheSettingOption.Value,
      };

      return new CacheSettingOptionsModel(data);
    }
}

