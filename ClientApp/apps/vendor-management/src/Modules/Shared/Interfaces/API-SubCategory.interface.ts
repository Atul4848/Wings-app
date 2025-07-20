import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPISubCategory extends IBaseApiResponse {
  category?: IAPICategory;
  categoryId: number;
}

export interface IAPICategory extends IBaseApiResponse {
  categoryId: number;
}
