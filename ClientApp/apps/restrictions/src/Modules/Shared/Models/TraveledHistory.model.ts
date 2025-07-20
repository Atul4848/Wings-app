import { CountryModel } from '@wings/shared';
import { CoreModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';
import { IAPITraveledHistory } from '../index';
import { CountryLevelExclusionModel } from './CountryLevelExclusion.model';
import { SectionLevelExclusionModel } from './SectionLevelExclusion.model';

@modelProtection
export class TraveledHistoryModel extends CoreModel implements ISelectOption {
  id: number = 0;
  isTraveledHistoryRequired: boolean = null;
  healthAuthorizationId: number = 0;
  travelHistoryTimeframe: number = 0;
  isOther: boolean = false;
  traveledHistoryCountries: CountryModel[];
  countryLevelExclusions: CountryLevelExclusionModel[];
  sectionLevelExclusions: SectionLevelExclusionModel[];
  constructor(data?: Partial<TraveledHistoryModel>) {
    super(data);
    Object.assign(this, data);
    this.traveledHistoryCountries = data?.traveledHistoryCountries?.map(x => new CountryModel(x)) || [];
    this.countryLevelExclusions = data?.countryLevelExclusions?.map(x => new CountryLevelExclusionModel(x)) || [];
    this.sectionLevelExclusions = data?.sectionLevelExclusions?.map(x => new SectionLevelExclusionModel(x)) || [];
  }

  static deserialize(apiData: IAPITraveledHistory): TraveledHistoryModel {
    if (!apiData) {
      return new TraveledHistoryModel();
    }
    const data: Partial<TraveledHistoryModel> = {
      ...apiData,
      id: apiData.traveledHistoryId,
      countryLevelExclusions: apiData.countryLevelExclusions?.map(x => CountryLevelExclusionModel.deserialize(x)),
      traveledHistoryCountries: apiData.traveledHistoryCountries?.map(
        x =>
          new CountryModel({
            id: x.countryId || x.id,
            isO2Code: x.code || x.countryCode,
            name: x.name,
          })
      ),
      sectionLevelExclusions: apiData.sectionLevelExclusions?.map(x => SectionLevelExclusionModel.deserialize(x)),
    };
    return new TraveledHistoryModel(data);
  }

  public serialize(): IAPITraveledHistory {
    if (!this.isTraveledHistoryRequired) {
      return {
        id: this.id,
        isTraveledHistoryRequired: this.isTraveledHistoryRequired,
      };
    }
    return {
      id: this.id,
      isTraveledHistoryRequired: this.isTraveledHistoryRequired,
      travelHistoryTimeframe: Utilities.getNumberOrNullValue(this.travelHistoryTimeframe),
      isOther: this.isOther,
      sectionLevelExclusions: this.sectionLevelExclusions.map(x => x.serialize()),
      countryLevelExclusions: this.countryLevelExclusions.map(x => x.serialize()),
      traveledHistoryCountries: this.traveledHistoryCountries?.map(x => ({
        id: 0,
        countryId: x.id || x.countryId,
        countryCode: x.isO2Code,
      })),
    };
  }

  static deserializeList(apiDataList: IAPITraveledHistory[]): TraveledHistoryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPITraveledHistory) => TraveledHistoryModel.deserialize(apiData))
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
