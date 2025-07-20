import { IBaseApiResponse } from '@wings-shared/core';
import { IAPITraveledHistorySubCategory } from './API-IAPITraveledHistorySubCategory.interface';

export interface IAPITraveledHistory extends IBaseApiResponse {
  isTraveledHistoryRequired: boolean;
  healthAuthorizationId?: number;
  traveledHistoryId?: number;
  travelHistoryTimeframe?: number;
  isOther?: boolean;
  countryLevelExclusions?: IAPICountryLevelExclusion[];
  sectionLevelExclusions?: IAPISectionLevelExclusion[];
  traveledHistoryCountries?: IAPITravelHistoryCountry[];
}

interface IAPITravelHistoryCountry extends IBaseApiResponse {
  countryId: number;
  code?: string;
  countryCode?: string;
}

export interface IAPICountryLevelExclusion extends IBaseApiResponse {
  countryLevelExclusionId?: number;
  countryLevel: string;
  link: string;
  travelHistoryTimeframe: number;
}

export interface IAPISectionLevelExclusion extends IBaseApiResponse {
  sectionLevelExclusionId?: number;
  countryLevel: string;
  notes: string;
  traveledHistoryCategory?: IAPITraveledHistoryCategory;
  traveledHistorySubCategory?: IAPITraveledHistorySubCategory;
  vaccinationStatus?: IAPIVaccinationStatus;
  travellerType?: IAPITravellerType;
  travellerTypeId: number;
  vaccinationStatusId: number;
  traveledHistorySubCategoryId: number;
  travelHistoryTimeframe: number;
}

interface IAPITraveledHistoryCategory extends IBaseApiResponse {
  traveledHistoryCategoryId: number;
}

interface IAPIVaccinationStatus extends IBaseApiResponse {
  vaccinationStatusId: number;
}

interface IAPITravellerType extends IBaseApiResponse {
  travellerTypeId: number;
}
