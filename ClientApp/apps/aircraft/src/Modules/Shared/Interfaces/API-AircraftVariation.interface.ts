import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAircraftVariation extends IBaseApiResponse {
  numberOfEngines: number;
  aircraftVariationOtherNames?: IAPIAircraftVariationOtherName[];
  aircraftVariationPopularNames?: IAPIAircraftVariationPopularName[];
  minimumRunwayLength: number;
  range: number;
  isManufactureDataLicense: boolean;
  manufactureDataLicenseStartDate: string;
  manufactureDataLicenseEndDate: string;
  maxCrosswind: number;
  maxTailWind: number;
  isPermissionToLoadRequired: boolean;
  make?: IAPIMake;
  model?: IAPIModel;
  aircraftVariationPerformances?: IAPIAircraftVariationPerformance[];
  series?: IAPISeries;
  engineType?: IAPIEngineType;
  aircraftVariationModifications?: IAPIAircraftVariationModification[];
  icaoTypeDesignator?: IAPIICAOTypeDesignator;
  fuelType?: IAPIFuelType;
  category?: IAPICategory;
  subCategory?: IAPISubCategory;
  fireCategory?: IAPIFireCategory;
  wakeTurbulenceCategory?: IAPIWakeTurbulenceCategory;
  distanceUOM?: IAPIDistanceUOMId;
  rangeUOM?: IAPIRangeUOM;
  windUOM?: IAPIWindUOM;
  aircraftVariationSTCManufactures?: IAPIAircraftVariationSTCManufacture[] | number[];
  aircraftVariationGenericRegistries?: IAPINavBlueGenericRegistry[];
  pictureUrl: string;
  pictureAccessTokenUrl?: string;
  engineTypeId: number;
  aircraftVariationPerformanceIds: number[];
  aircraftVariationModificationIds?: number[];
  icaoTypeDesignatorId: number;
  fuelTypeId: number;
  subCategoryId: number;
  fireCategoryId: number;
  wakeTurbulenceCategoryId: number;
  distanceUOMId: number;
  rangeUOMId: number;
  windUOMId: number;
  wingspan: number;
  comments: string;
  makeId: number;
  modelId: number;
  seriesId: number;
  aircraftVariationOtherNameIds: number[];
  categoryId: number;
  cappsModel: string;
  cappsEngineType: string;
  cappsSeries: string;
  cappsCruiseSchedule: string;
  isUwaFlightPlanSupported: boolean;
  aircraftVariationPopularNameIds?: number[];
  aircraftVariationId?: number;
  isVerificationComplete: boolean;
  aircraftVariationMilitaryDesignations?: IAPIAircraftVariationMilitaryDesignation[];
  aircraftVariationMilitaryDesignationIds: number[];
}

interface IAPIAircraftVariationMilitaryDesignation extends IBaseApiResponse {
  militaryDesignation: IAPIMilitaryDesignation;
}

interface IAPIMilitaryDesignation extends IBaseApiResponse {
  militaryDesignationId: number;
}

interface IAPIMake extends IBaseApiResponse {
  makeId: number;
}

export interface IAPINavBlueGenericRegistry extends IBaseApiResponse {
  navBlueGenericRegistryId?: number;
  navBlueGenericRegistry: string;
  rampHeight: number;
  mtow: number;
  zeroFuelWeight: number;
  maxLandingWeight: number;
  tankCapacity: number;
  bow: number;
  weightUOMName?: string;
}

export interface IAPIAircraftVariationSTCManufacture extends IBaseApiResponse {
  aircraftVariationSTCManufactureId: number;
  stcManufacture: IAPISTCManufacture;
}

export interface IAPIAircraftVariationPicture extends IBaseApiResponse {
  url?: string;
  picture?: string;
}

interface IAPIModel extends IBaseApiResponse {
  modelId: number;
}

interface IAPIAircraftVariationPerformance extends IBaseApiResponse {
  performance: IAPIPerformance;
}

interface IAPIPerformance extends IBaseApiResponse {
  performanceId: number;
  wakeTurbulenceCategory: IAPIWakeTurbulenceCategory;
}

interface IAPISeries extends IBaseApiResponse {
  seriesId: number;
}

interface IAPIAircraftVariationOtherName extends IBaseApiResponse {
  otherName: IAPIOtherName;
}

interface IAPIOtherName extends IBaseApiResponse {
  otherNameId: number;
}

interface IAPIAircraftVariationPopularName extends IBaseApiResponse {
  popularName: IAPIPopularName;
}

interface IAPIPopularName extends IBaseApiResponse {
  popularNameId: number;
}

interface IAPIEngineType extends IBaseApiResponse {
  engineTypeId: number;
}

interface IAPIAircraftVariationModification extends IBaseApiResponse {
  aircraftModification: IAPIModification;
}

interface IAPIModification extends IBaseApiResponse {
  aircraftModificationId: number;
}

interface IAPIFuelType extends IBaseApiResponse {
  fuelTypeId: number;
}

interface IAPIICAOTypeDesignator extends IBaseApiResponse {
  icaoTypeDesignatorId: number;
  propulsionType: IAPIPropulsionType;
}

interface IAPIPropulsionType extends IBaseApiResponse {
  propulsionTypeId: number;
  propulsionType: IAPIPropulsionType;
}

interface IAPICategory extends IBaseApiResponse {
  categoryId: number;
}

interface IAPISubCategory extends IBaseApiResponse {
  subCategoryId: number;
}

interface IAPIFireCategory extends IBaseApiResponse {
  fireCategoryId: number;
}

interface IAPIWakeTurbulenceCategory extends IBaseApiResponse {
  wakeTurbulenceCategoryId: number;
}

interface IAPIDistanceUOMId extends IBaseApiResponse {
  distanceUOMId: number;
}

interface IAPIRangeUOM extends IBaseApiResponse {
  rangeUOMId: number;
}

interface IAPIWindUOM extends IBaseApiResponse {
  windUOMId: number;
}

interface IAPISTCManufacture extends IBaseApiResponse {
  stcManufactureId: number;
}
