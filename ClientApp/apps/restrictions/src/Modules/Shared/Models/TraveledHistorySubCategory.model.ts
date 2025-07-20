import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPITraveledHistorySubCategory } from '../Interfaces';

@modelProtection
export class TraveledHistorySubCategoryModel extends CoreModel implements ISelectOption {
  category: SettingsTypeModel;
  constructor(data?: Partial<TraveledHistorySubCategoryModel>) {
    super(data);
    Object.assign(this, data);
    this.category = new SettingsTypeModel(data?.category);
  }

  static deserialize(apiSubCategory: IAPITraveledHistorySubCategory): TraveledHistorySubCategoryModel {
    if (!apiSubCategory) {
      return new TraveledHistorySubCategoryModel();
    }
    const data: Partial<TraveledHistorySubCategoryModel> = {
      ...apiSubCategory,
      accessLevel: AccessLevelModel.deserialize(apiSubCategory.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiSubCategory.sourceType),
      category: SettingsTypeModel.deserialize({
        ...apiSubCategory.traveledHistoryCategory,
        id: apiSubCategory.traveledHistoryCategory?.traveledHistoryCategoryId,
      }),
    };
    return new TraveledHistorySubCategoryModel(data);
  }

  public serialize(): IAPITraveledHistorySubCategory {
    return {
      ...this._serialize(),
      id: this.id,
      name: this.name,
      traveledHistoryCategoryId: this.category?.id,
    };
  }

  static deserializeList(apiDataList: IAPITraveledHistorySubCategory[]): TraveledHistorySubCategoryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPITraveledHistorySubCategory) =>
        TraveledHistorySubCategoryModel.deserialize(apiData)
      )
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
