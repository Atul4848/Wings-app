import { IAPIRequestVendorAddress } from './API-Request-VendorAddress.interface';
import { IAPIRequestVendorLocationServiceComm } from './API-Request-VendorLocationServiceComm.interface';

export interface IAPIRequestVendor {
  id: number;
  code: string;
  name: string;
  userId: string;
  legalCompanyName: string;
  vendorStatusId: number;
  vendorStatus: IAPIRequestVendorStatus;
  is3rdPartyLocation: boolean;
  vendorEmailId: string;
  vendorAddress: IAPIRequestVendorAddress;
}

export interface IAPIRequestVendorStatus {
  id: number;
  name: string;
  userId: string;
}

export interface IAPIRequestVendorUser{
  id: number;
  vendor: IAPIRequestVendor;
  email: string;
  givenName: string;
  surName: string;
  status: IAPIRequestVendorStatus;
  userRole: string;
  vendorUserLocation: IAPIRequestVendorLocationServiceComm;
}