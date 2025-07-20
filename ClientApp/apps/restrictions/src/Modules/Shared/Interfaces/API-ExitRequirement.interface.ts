import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIHealthForm } from './API-HealthForm.interface';
import { IAPIPaxCrew } from './API-PaxCrew.interface';

export interface IAPIExitRequirement extends IBaseApiResponse {
  paxCrewId: number;
  paxCrew?: IAPIPaxCrew;
  isExitRequirement: boolean;
  isSymptomBased?: boolean;
  isFormsRequired?: boolean;
  exitFormsRequired?: IAPIExitFormRequirement[];
  isPreDepartureTestRequired?: boolean;
  testTypeId?: number;
  testType?: ITestType;
  isArrivalTestVaccineExemption?: boolean;
  isPreDepartureTestVaccineExemption?: boolean;
  isProofToBoard?: boolean;
  consequences?: string;
  leadTime?: number;
  extraInformation?: string;
  boardingTypes?: IAPIBoardingType[] | number[];
  exitTestFrequencies?: IExitTestFrequency[];
  isInherited: boolean;
}

export interface IAPIExitFormRequirement extends IBaseApiResponse {
  exitFormsRequiredId?: number;
  formLeadTime: number;
  formInstructions: string;
  link: string;
  healthFormId: number;
  healthForm?: IAPIHealthForm;
}

interface ITestType extends IBaseApiResponse {
  testTypeId: number;
}

interface IExitTestFrequency extends IBaseApiResponse {
  exitTestFrequencyId?: number;
  interval: number;
}

export interface IAPIBoardingType extends IBaseApiResponse {
  boardingTypeId: number;
}
