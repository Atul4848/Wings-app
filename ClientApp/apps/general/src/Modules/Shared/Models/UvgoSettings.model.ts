import { IAPIUvgoSettingsResponse } from '../Interfaces';
import { modelProtection, DATE_FORMAT, IdNameModel, ISelectOption } from '@wings-shared/core';
import { SettingOptionsModel } from './SettingOptions.model';
import moment from 'moment';

@modelProtection
export class UvgoSettings extends IdNameModel<string> {
  description: string = '';
  area: ISelectOption;
  settingType: ISelectOption;
  assemblyName: string;
  fullAssemblyInfo: string;
  lastConnectedOn: string;
  isConnected: boolean;
  isPublished: boolean;
  isEnabled: boolean = false;
  cronExpression?: string = '';
  options: SettingOptionsModel[] = [];

  constructor(data?: Partial<UvgoSettings>) {
    super();
    Object.assign(this, data);
    this.options = data?.options?.map(x => new SettingOptionsModel(x)) || [];
  }

  static deserialize(uvgoSetting: IAPIUvgoSettingsResponse): UvgoSettings {
    if (!uvgoSetting) {
      return new UvgoSettings();
    }
    const data: Partial<UvgoSettings> = {
      id: uvgoSetting.Id,
      name: uvgoSetting.Name,
      description: uvgoSetting.Description,
      area: { label: uvgoSetting.Area, value: uvgoSetting.Area },
      assemblyName: uvgoSetting.AssemblyName,
      fullAssemblyInfo: uvgoSetting.FullAssemblyInfo,
      settingType: { label: uvgoSetting.SettingType, value: uvgoSetting.SettingType },
      isEnabled: uvgoSetting.IsEnabled,
      isConnected: uvgoSetting.IsConnected,
      isPublished: uvgoSetting.IsPublished,
      lastConnectedOn: uvgoSetting.LastConnectedOn
        ? moment.utc(uvgoSetting.LastConnectedOn).local().format(DATE_FORMAT.API_FORMAT)
        : null,
      cronExpression: uvgoSetting.CronExpression,
      options: uvgoSetting.Options ? SettingOptionsModel.deserializeList(JSON.parse(uvgoSetting.Options)) : null,
    };

    return new UvgoSettings(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIUvgoSettingsResponse {
    return {
      Id: this.id,
      Name: this.name,
      Description: this.description,
      Area: this.area?.value as string,
      AssemblyName: this.assemblyName,
      SettingType: this.settingType?.value as string,
      IsEnabled: this.isEnabled,
      IsPublished: this.isPublished,
      CronExpression: this.cronExpression,
      Options: this.options?.length > 0 ? JSON.stringify(this.options.map(x => x.serialize())) : null,
    };
  }

  static deserializeList(uvgoSettings: IAPIUvgoSettingsResponse[]): UvgoSettings[] {
    return uvgoSettings
      ? uvgoSettings.map((uvgoSetting: IAPIUvgoSettingsResponse) => UvgoSettings.deserialize(uvgoSetting))
      : [];
  }
}
