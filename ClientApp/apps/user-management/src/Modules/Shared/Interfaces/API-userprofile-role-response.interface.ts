import { IAttributesResponse } from './API-attributes-response.interface';

export interface IAPIUserProfileRoleResponse {
  RoleId: string;
  UserRoleId: string;
  Name: string;
  DisplayName: string;
  Description: string;
  Permissions: string[];
  Attributes?: IAttributesResponse[];
  ApplicationId: string;
  AppServiceId: string;
  Enabled: boolean;
  Type?: string;
  IsTrial: boolean;
  ValidFrom: string;
  ValidTo: string;
}
