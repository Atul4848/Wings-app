import { modelProtection, DATE_FORMAT, IdNameModel, ISelectOption } from '@wings-shared/core';
import { IAPICategory } from '../Interfaces';
import moment from 'moment';

@modelProtection
export class CategoryModel extends IdNameModel implements ISelectOption {
  displayName: string = '';
  createdOn: string = '';
  isApplied: boolean;
  isSubCategory: boolean;
  updatedEventTypesCount: number;
  updatedSubscriptionsCount: number;

  constructor(data?: Partial<CategoryModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(category: IAPICategory): CategoryModel {
    if (!category) {
      return new CategoryModel();
    }

    const data: Partial<CategoryModel> = {
      id: category.CategoryId,
      name: category.Name,
      displayName: category.DisplayName,
      isApplied: category.IsApplied,
      isSubCategory: category.IsSubCategory,
      createdOn: moment.utc(category.CreatedOn).local().format(DATE_FORMAT.API_FORMAT),
      updatedEventTypesCount: category.UpdatedEventTypesCount,
      updatedSubscriptionsCount: category.UpdatedSubscriptionsCount,
    };
    return new CategoryModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPICategory {
    return {
      CategoryId: this.id,
      Name: this.name,
      DisplayName: this.displayName,
      IsSubCategory: this.isSubCategory,
    };
  }

  static deserializeList(categories: IAPICategory[]): CategoryModel[] {
    return categories ? categories.map((category: IAPICategory) => CategoryModel.deserialize(category)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.name;
  }
}
