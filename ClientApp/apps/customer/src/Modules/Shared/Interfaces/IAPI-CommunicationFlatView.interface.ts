import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomerRef } from '@wings/shared';
import { ICustomerCommunicationAssociatedSites } from './API-CustomerContact.interface';

export interface IAPICommunicationFlatView extends IBaseApiResponse {
  customerCommunicationId: number;
  startDate: string;
  endDate: string;
  communicationLevel: ICommunicationLevel;
  contactRole: IContactRole | null;
  sequence: number;
  contactPriority: IContactPriority | null;
  communicationCategories: ICommunicationCategories[];
  customerCommunicationAssociations: ICommunicationAssociation[];
  operatorCommunicationAssociations: IOperatorCommunicationAssociations[];
  registryCommunicationAssociations: IRegistryCommunicationAssociations[];
  customer: IAPICustomerRef | null;
  customerCommunicationAssociatedOffices: ICommunicationAssociatedOffice[];
  customerCommunicationAssociatedOperators: ICommunicationAssociatedOperator[];
  customerCommunicationAssociatedRegistries: ICommunicationAssociatedRegistry[];
  customerCommunicationAssociatedSites: ICustomerCommunicationAssociatedSites[];

  // contact fields
  contactId: number;
  contact: string;
  contactValue: string;
  contactExtension: string;
  contactName: string;
  contactMethod: IAPIContactMethod;
  contactType: IAPIContactType;
}

interface ICommunicationAssociation extends IBaseApiResponse {
  customerCommunicationAssociationId: number;
  customer: ICustomer;
  customerCommunicationAssociatedOffices: ICommunicationAssociatedOffice[];
  customerCommunicationAssociatedOperators: ICommunicationAssociatedOperator[];
  customerCommunicationAssociatedRegistries: ICommunicationAssociatedRegistry[];
  customerCommunicationAssociatedSites: ICommunicationAssociatedSite[];
}

interface IOperatorCommunicationAssociations {
  operatorCommunicationAssociationId: number;
  operator: IOperator;
}

interface IRegistryCommunicationAssociations {
  registryCommunicationAssociationId: number;
  registry: IRegistry;
}

interface ICommunicationAssociatedSite extends IBaseApiResponse {
  customerCommunicationAssociatedSiteId: number;
  customerAssociatedSite: ICustomerAssociatedSite;
}
interface ICustomerAssociatedSite extends IBaseApiResponse {
  customerAssociatedSiteId: number;
  startDate?: any;
  endDate?: any;
  siteName: string;
  siteSequenceNumber: string;
  siteUseId: number;
}
interface ICommunicationAssociatedRegistry {
  customerCommunicationAssociatedRegistryId: number;
  customerAssociatedRegistry: CustomerAssociatedRegistry;
}
interface CustomerAssociatedRegistry {
  customerAssociatedRegistryId: number;
  registry: IRegistry;
}
interface IRegistry {
  registryId: number;
  name: string;
}

interface ICommunicationAssociatedOperator {
  customerCommunicationAssociatedOperatorId: number;
  customerAssociatedOperator: CustomerAssociatedOperator;
}

interface CustomerAssociatedOperator {
  customerAssociatedOperatorId: number;
  operator: IOperator;
}
interface IOperator {
  operatorId: number;
  name: string;
}

interface ICommunicationAssociatedOffice extends IBaseApiResponse {
  customerCommunicationAssociatedOfficeId: number;
  customerAssociatedOffice: ICustomerAssociatedOffice;
}
interface ICustomerAssociatedOffice {
  customerAssociatedOfficeId: number;
  associatedOfficeId: number;
  associatedOfficeName: string;
  associatedOfficeCode: string;
  name: string;
  code: string;
  airport: IAirport;
}
interface IAirport {
  airportId: string;
  airportName: string;
  airportCode: string;
}
interface ICustomer extends IBaseApiResponse {
  customerId: number;
  partyId: number;
  name: string;
  number: string;
}
interface ICommunicationCategories {
  communicationCategoryId: number;
  name: string;
}
interface ICommunicationLevel {
  communicationLevelId: number;
  name: string;
}

interface IContactPriority {
  contactPriorityId: number;
  name: string;
}
interface IContactRole {
  contactRoleId: number;
  name: string;
}

interface IAPIContactMethod {
  contactMethodId: number;
  name: string;
}

interface IAPIContactType {
  contactTypeId: number;
  name: string;
}
