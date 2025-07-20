import { IAPIHealthAuthorizationOverview } from './API-HealthAuthorizationOverview.interface';
import { IAPIEntryRequirement } from './API-EntryRequirement.interface';
import { IAPIExitRequirement } from './API-ExitRequirement.interface';
import { IApiGeneralInfo } from './API-GeneralInfo.interface';
import {
  IAPIQuarantineRequirement,
  IAPIVaccinationRequirement,
  IAPIDomesticMeasure,
  IAPIStayRequirement,
  IAPITraveledHistory,
} from './index';

export interface IApiHealthAuth extends IAPIHealthAuthorizationOverview {
  generalInformation?: IApiGeneralInfo;
  quarantineRequirements?: IAPIQuarantineRequirement[];
  vaccinationRequirements?: IAPIVaccinationRequirement[];
  entryRequirements?: IAPIEntryRequirement[];
  exitRequirements?: IAPIExitRequirement[];
  stayRequirements?: IAPIStayRequirement[];
  healthAuthorizationChangeRecords?: IAPIHealthAuthorizationChangeRecords[];
  domesticMeasure?: IAPIDomesticMeasure;
  traveledHistory?: IAPITraveledHistory;
}

export interface IAPIHealthAuthorizationChangeRecords {
  id: number;
  changedBy: string;
  notes: string;
  changedDate: string;
  healthAuthorizationChangeRecordId?: number;
}
