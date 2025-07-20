import { VENDOR_USER_TYPE_ENUM } from '@wings/shared';

export interface IAPIUserResponse {
  Id: string;
  FirstName: string;
  LastName: string;
  Username: string;
  Email: string;
  Role: string;
  IsInternal: boolean;
  CsdUserId: number;
  Status: string;
  EndDate: string;
  Phone: number;
  CustomerNumber: string;
  CreationDate: string;
  ISEmailVerified: boolean;
  Exists: boolean;
  ISTFOEnabled: boolean;
  ISFPList: boolean;
  Provider: string;
  LegacyUsername: string;
  Message?: string;
  UserId: string;
  UserGuid: string;
  AssumedIdentity?: number;
}

export interface VendorUserData {
  isDataAvailable: boolean;
  phoneNo: string;
  email: string;
  username: string;
  emailType: VENDOR_USER_TYPE_ENUM;
}
