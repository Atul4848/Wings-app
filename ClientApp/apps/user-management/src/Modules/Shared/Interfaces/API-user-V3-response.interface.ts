import { IAPIUserV3ProfileResponse } from './API-user-V3-Profile-response.interface';
import { IAPIUserProfileRoleResponse } from './API-userprofile-role-response.interface';

export interface IAPIUserV3Response {
  Id: string;
  OktaUserId: string;
  FirstName: string;
  LastName: string;
  Username: string;
  Email: string;
  Roles?: IAPIUserProfileRoleResponse[];
  Status: string;
  EndDate: string;
  Preferences:any
  IsEmailVerified: boolean;
  Provider: string;
  CiscoUsername: string;
  UVGOProfile : IAPIUserV3ProfileResponse;
}
