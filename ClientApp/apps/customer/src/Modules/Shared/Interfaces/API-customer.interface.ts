import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAssociatedRegistries } from './API-AssociatedRegistries.interface';
import { IAPIAssociatedOperators } from './API-AssociatedOperators.interface';
import { IAPIAssociatedSites } from './API-AssociatedSites.interface';
import { IAPIAssociatedOffice } from './API-AssociatedOffice.interface';

export interface IAPICustomer extends IBaseApiResponse {
  name: string;
  number: string;
  customerId: number;
  partyId: number;
  partyNumber: string;
  partyAltName: string;
  partyType: string;
  corporateSegment: string;
  classification: string;
  startDate: string;
  endDate: string;
  region: string;
  collectorName: string;
  collectorId: string;
  creditRating: string;
  paymentTerms: string;
  creditAnalyst: string;
  dmClient: string;
  riskCode: string;
  accountStatus: string;
  collectionType: string;
  category: string;
  creditLimit: string;
  creditLimitCurr: string;
  associatedRegistries?: IAPIAssociatedRegistries[];
  associatedOperators?: IAPIAssociatedOperators[];
  associatedSites?: IAPIAssociatedSites[];
  associatedOffices?: IAPIAssociatedOffice[];
}
