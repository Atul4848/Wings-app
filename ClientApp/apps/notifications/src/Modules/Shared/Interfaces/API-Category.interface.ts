export interface IAPICategory {
  CategoryId: number;
  Name: string;
  DisplayName: string;
  IsSubCategory: boolean;
  CreatedOn?: string;
  IsApplied?: boolean;
  UpdatedEventTypesCount?: number;
  UpdatedSubscriptionsCount?: number;
}
