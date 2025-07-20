import { IAPISubCategory } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class SubCategoryModel extends CoreModel implements ISelectOption {
  category: SettingsTypeModel;
  constructor(data?: Partial<SubCategoryModel>) {
    super(data);
    Object.assign(this, data);
    this.category = new SettingsTypeModel(data?.category);
  }

  static deserialize(apiData: IAPISubCategory): SubCategoryModel {
    if (!apiData) {
      return new SubCategoryModel();
    }
    const data: Partial<SubCategoryModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData)
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
