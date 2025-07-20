import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIDomesticMeasure extends IBaseApiResponse {
  domesticMeasureId: number;
  isAgeExemption: boolean;
  ageExemptionInfo: string;
  age: number;
  isPPERequired: boolean;
  businessAvailable: string;
  isIdentificationRequiredOnPerson: boolean;
  isAllowedTravelInCountry: boolean;
  extraInformation: string;
  domesticMeasurePPERequired: IAPIDomesticMeasurePPERequired[] | number[];
  domesticMeasureIdRequired: IAPIDomesticMeasureIdRequired[] | number[];
  domesticMeasureRestrictedActivities: IAPIDomesticMeasureRestrictedActivity[];
  domesticTravelRequirements: string;
  domesticMeasureCurfewHours: IAPIDomesticMeasureCurfewHour[];
  isInherited: boolean;
  stateRegionSpecificInfo: string;
}

export interface IAPIDomesticMeasurePPERequired {
  domesticMeasurePPERequiredId: number;
  ppeType: IAPIPPEType;
}

export interface IAPIDomesticMeasureIdRequired {
  domesticMeasureIdRequiredId: number;
  idType: IAPIIdType;
}

interface IAPIPPEType extends IBaseApiResponse {
  ppeTypeId: number;
}

export interface IAPIDomesticMeasureRestrictedActivity extends IBaseApiResponse {
  domesticMeasureRestrictedActivityId?: number;
}

export interface IAPIDomesticMeasureCurfewHour extends IBaseApiResponse {
  domesticMeasureCurfewHourId?: number;
  curfewHourTypeId: number;
  curfewDetails: string;
  curfewTimeFrame: string;
  curfewExpirationDate: string;
  curfewHourType?: IAPICurfewHoursType;
}

interface IAPICurfewHoursType extends IBaseApiResponse {
  curfewHourTypeId: number;
}

interface IAPIIdType extends IBaseApiResponse {
  idTypeId: number;
}
