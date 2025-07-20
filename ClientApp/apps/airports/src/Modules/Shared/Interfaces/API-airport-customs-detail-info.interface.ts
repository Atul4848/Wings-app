import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomsLeadTime } from './API-customs-lead-time-interface';
import { IAPICustomsNote } from './API-customs-note-interface';

export interface IAPIAirportCustomsDetailInfo extends IBaseApiResponse {
  customsDetailId: number;
  airportId: number;
  canPassPermitLocation: boolean;
  tolerancePlus: number;
  toleranceMinus: number;
  uwaInternalProcessNotes: string;
  customsClearanceExternalProcess: string;
  specialInstructions: string;
  customsDocumentRequirements: IAPIDocumentsRequirement[];
  customsRequiredInformationTypes: IAPICustomsRequiredInformationType[];
  customsLeadTimes: IAPICustomsLeadTime[];
  notes: IAPICustomsNote[];
}

export interface IAPIDocumentsRequirement {
  id: number;
  customsDocumentRequirementId?: number;
  permitDocumentId: number;
  name: string;
  code: string;
}

export interface IAPICustomsRequiredInformationType {
  id: number;
  customsRequiredInformationTypeId?: number;
  requiredInformationType: RequiredInformationType;
}

export interface RequiredInformationType {
  id: number;
  requiredInformationTypeId: number;
  name?: string;
}

//REQUEST
export interface IAPIAirportCustomsDetailInfoRequest extends IBaseApiResponse {
  customsDetailId?: number;
  airportId: number;
  canPassPermitLocation: boolean;
  tolerancePlus: number;
  toleranceMinus: number;
  uwaInternalProcessNotes: string;
  customsClearanceExternalProcess: string;
  specialInstructions: string;
  trashRemovalVendor: string;
  trashRemovalRequestTemplate: string;
  internationalTrashAvailable: boolean;
  customsRequiredInformationTypes: number[];
  customsDocumentRequirements: IAPIDocumentsRequirement[];
  customsLeadTimes: IAPICustomsLeadTime[];
}
