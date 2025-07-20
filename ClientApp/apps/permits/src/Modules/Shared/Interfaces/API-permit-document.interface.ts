import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRuleValue } from './API-rule-value.interface';

export interface IAPIPermitDocument extends IBaseApiResponse {
  document: IAPIDocument;
  permitId: number;
  isApplicableToAllFarTypes: boolean;
  oracleModifiedDate: any;
  permitDocumentFarType: IAPIPermitDocumentFarType[];
  permitDocumentId: number;
  propertyName: string;
  ruleConditionalOperator: IAPIRuleConditionalOperator;
  ruleEntityType: IAPIRuleEntityType;
  ruleField: IBaseApiResponse;
  ruleValues: IAPIRuleValue[];
  appliedPermitClassifications: IAPIPermitClassifications[];
  appliedPermitDocumentAirports: IAPIPermitAirport[];
  appliedPermitDocumentStates: IAPIPermitState[];
}

interface IAPIRuleConditionalOperator extends IBaseApiResponse {
  ruleConditionalOperatorId: number;
}

interface IAPIRuleEntityType extends IBaseApiResponse {
  ruleEntityTypeId: number;
}

export interface IAPIDocument extends IBaseApiResponse {
  documentId: number;
  code: string;
}

export interface IAPIPermitClassifications extends IBaseApiResponse {
  appliedPermitClassificationId: number;
  permitClassification: IAPIClassification;
}

export interface IAPIPermitAirport extends IBaseApiResponse {
  appliedPermitDocumentAirportId: number;
  airportId: number;
  airportCode: string;
  airportName: string;
}
export interface IAPIPermitState extends IBaseApiResponse {
  appliedPermitDocumentStateId: number;
  stateId: number;
  code: string;
}

export interface IAPIClassification extends IBaseApiResponse {
  permitClassificationId: number;
}

export interface IAPIPermitDocumentFarType extends IBaseApiResponse {
  permitDocumentId: number;
  permitDocumentFarTypeId: number;
  farType: IAPIFarType;
}

export interface IAPIFarType extends IBaseApiResponse {
  farTypeId: number;
  cappsCode: string;
}

export interface IAPIDocumentRequest {
  id: number;
  documentId: number;
  permitId: number;
  isApplicableToAllFarTypes?: boolean;
  oracleModifiedDate: string;
  permitDocumentFarTypeIds: number[];
  propertyName: string;
  ruleConditionalOperatorId: number;
  ruleEntityTypeId: number;
  ruleValues: IAPIRuleValue[];
  appliedPermitClassifications: IAPIClassificationRequest[];
  appliedPermitDocumentAirports: IAPIAirportDocumentRequest[];
  appliedPermitDocumentStates: IAPIStateDocumentRequest[];
}

export interface IAPIClassificationRequest extends IBaseApiResponse {
  permitClassificationId: number;
}

export interface IAPIAirportDocumentRequest extends IBaseApiResponse {
  airportId: number;
  airportCode: string;
  airportName: string;
}

export interface IAPIStateDocumentRequest extends IBaseApiResponse {
  stateId: number;
  name: string;
  code: string;
}
