import { IBaseApiResponse } from '@wings-shared/core';

export interface ICustomerCommRequest extends IBaseApiResponse {
  startDate: string;
  endDate: string | null;
  communicationLevelId: number;
  contactValue: string;
  contactExtension: string;
  contactName: string;
  contactRoleId: number | null;
  contactMethodId: number;
  contactTypeId: number;
  contactCommunicationId: number;
  priorityId: number | null;
  sequence: number | null;
  customerNumber: string;
  customerName: string;
  partyId: number;
  operatorCommunicationAssociations: number[];
  registryCommunicationAssociations: number[];
  contactCommunicationCategories: number[];
  customerRegistryCommunicationAssociations: number[];
  customerOperatorCommunicationAssociations: number[];
  customerOfficeCommunicationAssociations: number[];
  customerSiteCommunicationAssociations: ICustomerSiteCommunicationAssociations[];
}

export interface ICommunicationAssociationRequest {
  id: number;
  customerNumber: string;
  customerName: string;
  partyId: number;
  customerRegistryCommunicationAssociations: number[];
  customerOperatorCommunicationAssociations: number[];
  customerOfficeCommunicationAssociations: number[];
  customerSiteCommunicationAssociations: ICustomerSiteCommunicationAssociations[];
}

export interface ICustomerSiteCommunicationAssociations {
  id: number;
  siteName: string;
  siteSequenceNumber: string;
  siteUseId: number;
}
