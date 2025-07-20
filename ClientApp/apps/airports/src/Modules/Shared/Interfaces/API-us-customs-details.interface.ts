import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIUsCustomsDetailsRequest extends IBaseApiResponse {
  airportId: number;
  cbpPortTypeId: number;
  cbpFactUrl: string;
  biometricCapabilitiesForeignNationals: boolean;
  areaPortAssignmentId: number;
  fieldOfficeOversightId: number;
  satelliteLocation: boolean;
  driveTimeInMinutes: number;
  preClearClearanceLocation: string;
  preClearClearanceFBOVendorLocationId: number;
  preClearClearanceFBOVendorLocationCode: string;
  preClearClearanceFBOVendorLocationName: string;
  preClearRequiredInformation: string;
  isPreClearInternationalTrash: boolean;
  preClearUWAProcessNotes: string;
  preClearCustomsClearanceProcess: string;
  preClearSpecialInstruction: string;
  preClearanceDocuments: IPreClearDocument[];
  preClearCustomsLocations: number[];
  reimbursableServicesProgram: IReimbursableServicesProgramModel;
}

export interface IPreClearDocument {
  id: number;
  permitDocumentId?: number;
  code: string;
  name: string;
}

export interface IAPIUsCustomsDetailsResponse extends IBaseApiResponse {
  airport: IAirport;
  preClearClearanceLocation: string;
  cbpPortType: ICBPPortType;
  cbpFactSheetURL: string;
  biometricCapabilitiesForeignNationals: boolean;
  satelliteLocation: boolean;
  driveTimeInMinutes: number;
  areaPortAssignment: IAreaPortAssignment;
  fieldOfficeOversight: IFieldOfficeOversight;
  preClearance: IPreClear;
  reimbursableServicesProgram: IReimbursableServicesProgramModel;
}

interface IAirport {
  airportId: number;
  code: string;
  name: string;
}

interface ICBPPortType {
  cbpPortTypeId: number;
  name: string;
}

interface IAreaPortAssignment {
  areaPortAssignmentId: number;
  name: string;
}

interface IFieldOfficeOversight {
  fieldOfficeOversightId: number;
  name: string;
}

interface IPreClear {
  preClearClearanceFBOVendor: IPreClearClearanceFBOVendor;
  preClearClearanceLocation: string;
  preClearRequiredInformation: string;
  preClearUWAProcessNotes: string;
  preClearCustomsClearanceProcess: string;
  preClearSpecialInstruction: string;
  isPreClearInternationalTrash: boolean;
  preClearanceDocuments: IPreClearDocumentResponse[];
  preClearCustomsLocations: IPreClearCustomLocationResponse[];
}

export interface IReimbursableServicesProgramModel {
  id: number;
  subscribedAirport?: boolean;
  instructions?: string;
  contact?: IAPICustomsContact;
}
export interface IAPICustomsContact extends IBaseApiResponse {
  customsContactId: number;
}

export interface IPreClearClearanceFBOVendor {
  vendorLocationId: number;
  vendorLocationCode: string;
  vendorLocationName: string;
}

export interface IPreClearDocumentResponse {
  id?: number;
  preClearanceDocumentId: number;
  permitDocumentId?: number;
  code: string;
  name: string;
}

export interface IPreClearCustomLocationResponse {
  id?: number;
  preClearCustomsLocationInformationId: number;
  customsLocationInformationId: number;
  name: string;
}
