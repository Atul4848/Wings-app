import { ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPICountry } from '../Interfaces';

@modelProtection
export class CountryModel implements ISelectOption {
  countryId: number = null;
  countryName: string = '';
  countryCode: string = '';
  inActive: boolean = false;

  constructor(data?: Partial<CountryModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiCountry: IAPICountry): CountryModel {
    if (!apiCountry) {
      return new CountryModel();
    }
    const data: Partial<CountryModel> = {
      countryId: apiCountry.countryId,
      countryName: apiCountry.countryName,
      countryCode: apiCountry.countryCode,
      inActive: apiCountry.inActive,
    };
    return new CountryModel(data);
  }

  static deserializeList(apiPersonList: IAPICountry[]): CountryModel[] {
    return apiPersonList ? apiPersonList.map((apiPerson: IAPICountry) => CountryModel.deserialize(apiPerson)) : [];
  }

  // Need for AutoComplete
  public get label(): string {
    return this.countryName;
  }
  public get value(): string | number {
    return this.countryId;
  }
}
