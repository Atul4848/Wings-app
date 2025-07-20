import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIPermissionLeadTime } from './API-permission-lead-time.interface';
import { IAPIPermissionException } from './API-permission-exception.interface';
import { IAPIPermissionTolerance } from './API-permission-tolerance.interface';

export interface IAPIAirportPermission extends IAPIAirportPermissionRequest {
  permissionId?: number;
  permissionType: IAPIPermissionType;
  notificationType: IAPINotificationType;
  confirmationRequiredFors: IAPIConfirmationRequiredFor[];
  pprPurposes: IAPIPprPurpose[];
  permissionRequiredFors: IAPIRequiredFor[];
  documents: IAPIDocument[];
  permissionExceptions: IAPIPermissionException[];
  permissionLeadTimes: IAPIPermissionLeadTime[];
  permissionTolerances: IAPIPermissionTolerance[];
}

export interface IAPIAirportPermissionRequest extends IBaseApiResponse {
  startDate: string;
  endDate: string;
  idNumberItem18Format: string;
  templateID: string;
  formLink: string;
  idNumberIssued: boolean;
  idNumberRequiredInFlightPlan: boolean;
  slotAndPPRJointApproval: boolean;
  documentsRequired: boolean;
  specialFormsRequired: boolean;
  tbAorOpenScheduleAllowed: boolean;
  gabaNightSlotsAvailable: boolean;
  gabaPeakHourSlotsAvailable: boolean;
  airportGABAMaxArrivalSlotsPerDay: number;
  airportGABAMaxDepartureSlotsPerDay: number;
  permissionTypeId: number;
  notificationTypeId: number;
  documentIds: number[];
  pprPurposeIds: number[];
  permissionRequiredForIds: number[];
  confirmationRequiredForIds: number[];
  permissionVendors: IAPIVendors[];
  permissionExceptions: IAPIPermissionException[];
  permissionLeadTimes: IAPIPermissionLeadTime[];
  permissionTolerances: IAPIPermissionTolerance[];
  airportId: number;
}

interface IAPIPermissionType extends IBaseApiResponse {
  permissionTypeId: number;
}

interface IAPINotificationType extends IBaseApiResponse {
  notificationTypeId: number;
}

interface IAPIRequiredFor extends IBaseApiResponse {
  permissionRequiredForId: number;
  code: string;
}

interface IAPIPprPurpose extends IBaseApiResponse {
  pprPurposeId: number;
  code: string;
}

interface IAPIConfirmationRequiredFor extends IBaseApiResponse {
  confirmationRequiredForId: number;
  code: string;
}

interface IAPIDocument extends IBaseApiResponse {
  documentId?: number;
  code: string;
}

export interface IAPIVendors extends IBaseApiResponse {
  permissionId: number;
  vendorId: number;
  code: string;
}
