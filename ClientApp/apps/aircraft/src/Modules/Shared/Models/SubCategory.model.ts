import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPISubCategory } from '../Interfaces';

@modelProtection
export class SubCategoryModel extends CoreModel implements ISelectOption {
  category: SettingsTypeModel;
  constructor(data?: Partial<SubCategoryModel>) {
    super(data);
    Object.assign(this, data);
    this.category = new SettingsTypeModel(data?.category);
  }

  static deserialize(apiSubCategory: IAPISubCategory): SubCategoryModel {
    if (!apiSubCategory) {
      return new SubCategoryModel();
    }
    const data: Partial<SubCategoryModel> = {
      ...apiSubCategory,
      accessLevel: AccessLevelModel.deserialize(apiSubCategory.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiSubCategory.sourceType),
      category: SettingsTypeModel.deserialize({ ...apiSubCategory.category, id: apiSubCategory.category.categoryId }),
    };
    return new SubCategoryModel(data);
  }

  public serialize(): IAPISubCategory {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.category?.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPISubCategory[]): SubCategoryModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPISubCategory) => SubCategoryModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
