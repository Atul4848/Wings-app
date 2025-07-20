import { CoreModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';
import { IAPICountryLevelExclusion } from '../index';

@modelProtection
export class CountryLevelExclusionModel extends CoreModel implements ISelectOption {
  id: number = 0;
  countryLevel: string = '';
  link: string = '';
  travelHistoryTimeframe: number = null;
  constructor(data?: Partial<CountryLevelExclusionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICountryLevelExclusion): CountryLevelExclusionModel {
    if (!apiData) {
      return new CountryLevelExclusionModel();
    }
    const data: Partial<CountryLevelExclusionModel> = {
      id: apiData.countryLevelExclusionId || apiData.id,
      ...apiData,
    };
    return new CountryLevelExclusionModel(data);
  }

  public serialize(): IAPICountryLevelExclusion {
    return {
      id: this.id,
      countryLevel: this.countryLevel,
      link: this.link,
      travelHistoryTimeframe:  Utilities.getNumberOrNullValue(this.travelHistoryTimeframe),
    };
  }

  static deserializeList(apiDataList: IAPICountryLevelExclusion[]): CountryLevelExclusionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPICountryLevelExclusion) => CountryLevelExclusionModel.deserialize(apiData))
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
