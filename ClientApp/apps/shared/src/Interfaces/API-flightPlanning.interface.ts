import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIFlightPlanning extends IBaseApiResponse {
  acasiiEquippedTCASVersion?: string;
  countryId?: number;
  tcasRqrdFL?: number;
  rvsmSeparationMin?: number;
  rvsmLowerFL?: number;
  rvsmUpperFL?: number;
  rvsmItem10: boolean;
  is833KHzChnlSpaceRqrd: boolean;
  adsbRqrdAboveFL?: number;
  acasiIdataIsRqrd?: boolean;
  acasiiOrTCAS?: IAPIACASIIOrTCAS[] | null;
  rvsmComplianceExceptions?: IAPIRVSMComplianceExceptions[];
  bannedAircrafts?: IAPIBannedAircrafts[];
  noiseRestrictedAircrafts?: IAPINoiseRestrictedAircrafts[];
  documentsRequiredforFilings?: IAPIDocumentsRequiredforFilings[];
  appliedItem18Contents?: IAPIAppliedItem18Content[];
  appliedRequiredAircraftEquipments?: IAPIRequiredAircraftEquipment[];
  acasiiAdditionalInformations?: IAPIACASIIAdditionalInformation[];
}

export interface IAPIACASIIOrTCAS extends IBaseApiResponse {
  flightOperationalCategoryId: number;
}

export interface IAPIRVSMComplianceExceptions extends IBaseApiResponse {
  purposeOfFlightId: number;
}

export interface IAPIBannedAircrafts extends IBaseApiResponse {
  aircraftICAOTypeDesignatorId: number;
}

export interface IAPINoiseRestrictedAircrafts extends IBaseApiResponse {
  noiseChapterId: number;
}

export interface IAPIDocumentsRequiredforFilings extends IBaseApiResponse {
  permitDocumentId: number;
  code: string;
}
export interface IAPIAppliedItem18Content extends IBaseApiResponse {
  item18Content: IAPIItem18Content;
}
export interface IAPIItem18Content extends IBaseApiResponse {
  item18ContentId: number;
}

export interface IAPIRequiredAircraftEquipment extends IBaseApiResponse {
  aircraftEquipment: IAPIRequiredAircraftEquipmentId;
}
export interface IAPIRequiredAircraftEquipmentId extends IBaseApiResponse {
  aircraftEquipmentId: number;
}

export interface IAPIACASIIAdditionalInformation extends IBaseApiResponse {
  paxMin?: number;
  airworthinessDate?: string;
  mtowMin?: number;
  flightOperationalCategoryId: number;
  flightOperationalCategoryName: string;
  requirementType: IAPIRequirement;
}

export interface IAPIRequirement extends IBaseApiResponse {
  requirementTypeId?: number;
}

export interface IAPIACASIIAdditionalInformationRequest {
  id: number;
  paxMin?: number;
  airworthinessDate?: string;
  mtowMin?: number;
  flightOperationalCategoryId: number;
  flightOperationalCategoryName: string;
  requirementTypeId: number;
}

export interface IAPIAppliedItem18ContentRequest {
  id: number;
  item18ContentId: number;
}

export interface IAPIRequiredAircraftEquipmentRequest {
  id: number;
  aircraftEquipmentId: number;
}

export interface IAPIFlightPlanningRequest {
  id:number;
  acasiiEquippedTCASVersion?: string;
  countryId?: number;
  tcasRqrdFL?: number;
  rvsmSeparationMin?: number;
  rvsmLowerFL?: number;
  rvsmUpperFL?: number;
  rvsmItem10: boolean;
  is833KHzChnlSpaceRqrd: boolean;
  adsbRqrdAboveFL?: number;
  acasiIdataIsRqrd?: boolean;
  acasiiOrTCAS?: IAPIACASIIOrTCAS[] | null;
  rvsmComplianceExceptions?: IAPIRVSMComplianceExceptions[];
  bannedAircrafts?: IAPIBannedAircrafts[];
  noiseRestrictedAircrafts?: IAPINoiseRestrictedAircrafts[];
  documentsRequiredforFilings?: IAPIDocumentsRequiredforFilings[];
  appliedItem18Contents?: IAPIAppliedItem18ContentRequest[];
  appliedRequiredAircraftEquipments?: IAPIRequiredAircraftEquipmentRequest[];
  acasiiAdditionalInformations?: IAPIACASIIAdditionalInformationRequest[];
}