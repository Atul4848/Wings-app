import { IBaseApiResponse } from '@wings-shared/core';
import {
  IAPIPermitApplied,
  IAPIPermitAppliedRequest,
  IAPIPermitExceptionRule,
  IAPIPermitLeadTime,
  IAPIPermitAdditionalInfo,
  IAPIRouteAirwayExtension,
  IAPIPermitDocument,
  IAPIDocumentRequest,
  IAPIPermitRequiredElement,
} from '../Interfaces';
import { IAPIPermitExceptionRuleRequest } from './API-permit-exception-rule.interface';

export interface IAPIPermit extends IBaseApiResponse {
  permitId?: number;
  country: IAPIPermitCountry;
  isRequired: boolean;
  isException: boolean;
  isADIZ: boolean;
  exception: string;
  extendedByNM: number;
  permitType: IAPIPermitType;
  permitAppliedTo: IBaseApiResponse;
  permitApplieds: IAPIPermitApplied[];
  permitExceptionRules: IAPIPermitExceptionRule[];
  leadTimes: IAPIPermitLeadTime[];
  permitAdditionalInfo: IAPIPermitAdditionalInfo;
  hasRouteOrAirwayExtension?: boolean;
  permitRouteAirwayExtensions: IAPIRouteAirwayExtension[];
  permitDocuments: IAPIPermitDocument[];
  permitRequiredElements: IAPIPermitRequiredElement[];
}

interface IAPIPermitCountry {
  countryId: number;
  code: string;
  name: string;
}

interface IAPIPermitType extends IBaseApiResponse {
  permitTypeId: number;
}

export interface IAPIPermitRequest extends IBaseApiResponse {
  countryId: number;
  countryCode: string;
  isRequired: boolean;
  isException: boolean;
  exception: string;
  permitTypeId: number;
  permitApplieds: IAPIPermitAppliedRequest[];
  permitExceptionRules: IAPIPermitExceptionRuleRequest[];
  leadTimes: IAPIPermitLeadTime[];
  permitAdditionalInfo: IAPIPermitAdditionalInfo;
  permitRouteAirwayExtensions: IAPIRouteAirwayExtension[];
  hasRouteOrAirwayExtension: boolean;
  permitDocuments: IAPIDocumentRequest[];
  permitRequiredElements: number[];
}
