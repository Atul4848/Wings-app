export interface IAPIUserV3Request {
    id: string;
    oktaUserId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    status: string;
    provider: string;
    endDate: string | null;
    isEmailVerified: boolean;
    ciscoUsername: string;
    roles: IAPIUserRoleRequest[];
    UVGOProfile: IAPIUvgoProfileRequest;
}

export interface IAPIUserRoleRequest{
  roleId: String;
  attributes: IAPIAttributeRequest[];
}

export interface IAPIAttributeRequest{
  type: string;
  value: string;
}

export interface IAPIUvgoProfileRequest{
  csdUserId: number;
  csdUsername: string;
  jobRole: string;
  assumeIdentity?: number;
  activeCustomerId: string;
  activeCustomerSite: string;
  oracleFNDUsername: string;
  oracleFNDUserId: number;
  preferences: IAPIPreferencesRequest[];
}

export interface IAPIPreferencesRequest{
  key: string;
  value: string;
}