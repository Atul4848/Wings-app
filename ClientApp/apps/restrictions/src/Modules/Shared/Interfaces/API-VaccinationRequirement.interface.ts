import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIPaxCrew } from './API-PaxCrew.interface';

export interface IAPIVaccinationRequirement extends IBaseApiResponse {
  vaccinePrivileges?: IAPIVaccinationPrivilege[];
  healthAuthorizationId: number;
  paxCrew?: IAPIPaxCrew;
  vaccinationType?: IAPIVaccinationType;
  leadTime: number;
  age: number;
  vaccinationRequirementIssuedCountries: IAPIVaccinationIssuedCountry[];
  vaccineManufacturers?: IAPIVaccineManufacture[];
  additionalInformation: string;
  isVaccinationRequired: boolean;
  isBoosterRequired?: boolean;
  isAgeExemption: boolean;
  expirationDays?: number;
  isDocumentationRequired: boolean;
  documentationRequirements: string;
  paxCrewId: number;
  vaccinationTypeId: number;
  vaccinePrivilegeIds: number[];
  vaccineManufacturerIds: number[];
  isInherited?: boolean;
  boosterVaccineExpiration?: number;
  vaccineBoosterManufacturers?: IAPIAcceptedVaccineManufacture[];
  vaccineBoosterManufacturerIds?: number[];
  isBoosterExpiry?: boolean;
  boosterExemptions?: string;
}

interface IAPIVaccinationType extends IBaseApiResponse {
  vaccinationTypeId: number;
}

interface IAPIVaccinationPrivilege extends IBaseApiResponse {
  vaccinationPrivilegeId: number;
}

interface IAPIVaccineManufacture extends IBaseApiResponse {
  vaccineManufacturerId: number;
}

interface IAPIAcceptedVaccineManufacture extends IBaseApiResponse {
  vaccineManufacturerId: number;
}

export interface IAPIVaccinationIssuedCountry extends IBaseApiResponse {
  healthAuthorizationid?: number;
  issuedCountryId: number;
  issuedCountryCode: string;
}
