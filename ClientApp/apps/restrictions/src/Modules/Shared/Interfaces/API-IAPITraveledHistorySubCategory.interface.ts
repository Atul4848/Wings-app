import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPITraveledHistorySubCategory extends IBaseApiResponse {
  traveledHistorySubCategoryId?: number;
  traveledHistoryCategory?: IAPICategory;
  traveledHistoryCategoryId: number;
}

export interface IAPICategory extends IBaseApiResponse {
  traveledHistoryCategoryId: number;
}
