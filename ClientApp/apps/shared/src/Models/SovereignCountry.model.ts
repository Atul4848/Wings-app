import { IAPISovereignCountry } from '../Interfaces';
import { ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class SovereignCountryModel extends SettingsTypeModel implements ISelectOption {
  code: string = '';
  isO2Code: string = '';
  constructor(data?: Partial<SovereignCountryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPISovereignCountry): SovereignCountryModel {
    if (!apiData) {
      return new SovereignCountryModel();
    }
    return new SovereignCountryModel({
      ...apiData,
      id: apiData.countryId || apiData.id,
      name: apiData.officialName || apiData.name,
      code: apiData.isO2Code || apiData.code,
    });
  }

  static deserializeList(apiDataList: IAPISovereignCountry[]): SovereignCountryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPISovereignCountry) => SovereignCountryModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return `${this.name} ${this.code && `(${this.code})`} `;
  }
}
