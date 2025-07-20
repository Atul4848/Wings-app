import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel, Utilities } from '@wings-shared/core';
import { IAPISectionLevelExclusion } from '../index';

@modelProtection
export class SectionLevelExclusionModel extends CoreModel implements ISelectOption {
  id: number = 0;
  countryLevel: string = '';
  traveledHistoryCategory: SettingsTypeModel;
  traveledhistorySubCategory: SettingsTypeModel;
  vaccinationStatus: SettingsTypeModel;
  travellerType: SettingsTypeModel;
  notes: string = '';
  travelHistoryTimeframe: number = null;
  constructor(data?: Partial<SectionLevelExclusionModel>) {
    super(data);
    Object.assign(this, data);
    this.traveledHistoryCategory = new SettingsTypeModel(data?.traveledHistoryCategory);
    this.traveledhistorySubCategory = new SettingsTypeModel(data?.traveledhistorySubCategory);
    this.travellerType = new SettingsTypeModel(data?.travellerType);
    this.vaccinationStatus = new SettingsTypeModel(data?.vaccinationStatus);
  }

  static deserialize(apiData: IAPISectionLevelExclusion): SectionLevelExclusionModel {
    if (!apiData) {
      return new SectionLevelExclusionModel();
    }
    const data: Partial<SectionLevelExclusionModel> = {
      ...apiData,
      id: apiData.sectionLevelExclusionId || apiData.id,
      traveledHistoryCategory: SettingsTypeModel.deserialize({
        ...apiData.traveledHistoryCategory,
        id: apiData.traveledHistoryCategory?.traveledHistoryCategoryId,
      }),
      vaccinationStatus: SettingsTypeModel.deserialize({
        ...apiData.vaccinationStatus,
        id: apiData.vaccinationStatus?.vaccinationStatusId,
      }),
      travellerType: SettingsTypeModel.deserialize({
        ...apiData.travellerType,
        id: apiData.travellerType?.travellerTypeId,
      }),
      traveledhistorySubCategory: SettingsTypeModel.deserialize({
        ...apiData.traveledHistorySubCategory,
        id: apiData.traveledHistorySubCategory?.traveledHistorySubCategoryId,
      }),
    };
    return new SectionLevelExclusionModel(data);
  }

  public serialize(): IAPISectionLevelExclusion {
    return {
      id: this.id,
      travellerTypeId: this.travellerType?.id,
      vaccinationStatusId: this.vaccinationStatus?.id,
      traveledHistorySubCategoryId: this.traveledhistorySubCategory?.id,
      countryLevel: this.countryLevel,
      notes: this.notes,
      travelHistoryTimeframe:  Utilities.getNumberOrNullValue(this.travelHistoryTimeframe),
    };
  }

  static deserializeList(apiDataList: IAPISectionLevelExclusion[]): SectionLevelExclusionModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPISectionLevelExclusion) => SectionLevelExclusionModel.deserialize(apiData))
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
