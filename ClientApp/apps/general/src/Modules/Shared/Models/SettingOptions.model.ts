import { IAPISettingOptions } from '../Interfaces';
import { IdNameModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';

@modelProtection
export class SettingOptionsModel extends IdNameModel {
  displayName: string = '';
  keyName: string = null;
  regex: string = '';
  type: ISelectOption;
  value: number | boolean = null;

  constructor(data?: Partial<SettingOptionsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(option: IAPISettingOptions): SettingOptionsModel {
    if (!option) {
      return new SettingOptionsModel();
    }
    const data: Partial<SettingOptionsModel> = {
      id: Utilities.getTempId(true),
      displayName: option.DisplayName,
      keyName: option.KeyName,
      regex: option.Regex,
      type: { label: option.Type, value: option.Type },
      value: option.Value,
    };

    return new SettingOptionsModel(data);
  }

  public serialize(): IAPISettingOptions {
    return {
      KeyName: this.keyName,
      DisplayName: this.displayName,
      Regex: this.regex,
      Type: this.type?.value as string,
      Value: this.value,
    };
  }

  static deserializeList(options: IAPISettingOptions[]): SettingOptionsModel[] {
    return options ? options.map((option: IAPISettingOptions) => SettingOptionsModel.deserialize(option)) : [];
  }
}
