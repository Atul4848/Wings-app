import { IBaseApiResponse } from '@wings-shared/core';
import { IAPISalesRep } from './API-SalesRep.interface';

export interface IAPIAssociatedSites extends IBaseApiResponse {
  siteId: number;
  sequence: string;
  siteName: string;
  partyId: number;
  startDate: string;
  endDate: string;
  siteUsage: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  country: string;
  county: string;
  postalCode: string;
  gracePeriod: number;
  lateFeePercent: number;
  lateFeeStartDate: string;
  paymentTerms: string;
  poNumber: number;
  poExpirationDate: string;
  poAmount: string;
  demandClass: string;
  location: string;
  salesRep: IAPISalesRep;
  multiOrg: boolean;
  primary: boolean;
  siteUseId: number;
}
