import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICustomerRef } from '@wings/shared';

interface IAPICustomerContact extends IBaseApiResponse {
  contactId: number;
  contactValue: string;
  contactExtension: string;
  contactName: string;
  contactMethod: IAPIContactMethod;
  contactType: IAPIContactType;
}

export interface IAPICommunication {
  contactCommunicationId: number;
  communicationLevel: ICommunicationLevel;
  contactRole: IContactRole | null;
  startDate: string;
  endDate: string;
  sequence: number;
  contactPriority: IContactPriority | null;
  customer: IAPICustomerRef | null;
  customerCommunicationAssociatedOffices: ICommunicationAssociatedOffices[];
  customerCommunicationAssociatedOperators: ICommunicationAssociatedOperators[];
  customerCommunicationAssociatedRegistries: ICustomerCommunicationAssociatedRegistries[];
  customerCommunicationAssociatedSites: ICustomerCommunicationAssociatedSites[];
  communicationCategories: ICommunicationCategories[];
  operatorCommunicationAssociations: IOperatorCommunicationAssociations[];
  registryCommunicationAssociations: IRegistryCommunicationAssociations[];
}

export interface IAPIContactCommunication extends IAPICustomerContact {
  communications: IAPICommunication[];
}

export interface IAPIContactCommunicationFlat extends IAPICustomerContact, IAPICommunication {}

interface IContactPriority {
  contactPriorityId: number;
  name: string;
}

interface ICommunicationLevel {
  communicationLevelId: number;
}

interface IContactRole {
  contactRoleId: number;
}

interface ICommunicationCategories {
  communicationCategoryId: number;
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

interface IOperatorCommunicationAssociations {
  operatorCommunicationAssociationId: number;
  operator: IOperator;
}

interface IRegistryCommunicationAssociations {
  registryCommunicationAssociationId: number;
  registry: IRegistry;
}

interface ICommunicationAssociatedOffices extends IBaseApiResponse {
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

interface ICommunicationAssociatedOperators {
  customerCommunicationAssociatedOperatorId: number;
  customerAssociatedOperator: ICustomerAssociatedOperator;
}

interface ICustomerAssociatedOperator {
  customerAssociatedOperatorId: number;
  operator: IOperator;
}

interface IOperator {
  operatorId: number;
  name: string;
}

interface ICustomerCommunicationAssociatedRegistries {
  customerCommunicationAssociatedRegistryId: number;
  customerAssociatedRegistry: ICustomerAssociatedRegistry;
}

interface ICustomerAssociatedRegistry {
  customerAssociatedRegistryId: number;
  registry: IRegistry;
}

interface IRegistry {
  registryId: number;
  name: string;
}

export interface ICustomerCommunicationAssociatedSites extends IBaseApiResponse {
  customerCommunicationAssociatedSiteId: number;
  customerAssociatedSite: ICustomerAssociatedSite;
}

export interface ICustomerAssociatedSite extends IBaseApiResponse {
  customerAssociatedSiteId: number;
  siteName: string;
  siteSequenceNumber: string;
  siteUseId: number;
}
