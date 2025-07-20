import { IAPIResponseVendorAddress } from './API-Response-VendorAddress';
import { IAPIResponseOwnership } from './API-Response-Ownership';
import { IAPIResponseVendorLocation } from './API-Response-VendorLocation';

export interface IAPIResponseVendor {
  id: number;
  name: string;
  code: string;
  vendorStatusId: number;
  vendorStatus: IAPIResponseVendorStatus;
  legalCompanyName: any;
  is3rdPartyLocation: any;
  isInvitationPacketSend: any;
  vendorEmailId: any;
  vendorAddress: IAPIResponseVendorAddress[];
  vendorOwnership: IAPIResponseOwnership[];
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
}

export interface IAPIResponseVendorStatus {
  id: number;
  name: string;
}

export interface IAPIResponseVendorUser{
  id: number;
  vendor: IAPIResponseVendor;
  email: string;
  givenName: string;
  surName: string;
  status: string;
  role: string;
  userRole: string;
  vendorUserLocation: IAPIResponseVendorLocation;
  isOptedSms: boolean;
}
