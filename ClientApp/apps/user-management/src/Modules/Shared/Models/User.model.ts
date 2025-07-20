import { IAPIUserResponse } from '../Interfaces/API-user-profile-response.interface';
import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIUserV3Response, PreferencesModel, UserProfileRolesModel } from '../../Shared';

@modelProtection
export class UserModel extends IdNameModel<string> {
  csdUsername: string = '';
  activeCustomerId: string = '';
  activeCustomerSite: string = '';
  userId: string = '';
  oktaUserId: string = '';
  csdUserId: number;
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  oracleFNDUsername: string = '';
  oracleFNDUserId: number;
  lastLogin: string = '';
  status: string = '';
  provider: string = '';
  isEmailVerified: boolean;
  assumeIdentity?: number = 0;
  manualAssumedIdentity?: number = 0;
  jobRole: ISelectOption;
  endDate: string | null = null;
  preferences: PreferencesModel[] = [];
  roles: UserProfileRolesModel[] = [];
  customerNumber: string[] = [];
  customerSites: string[] = [];
  ciscoUsername: string = '';

  constructor(data?: Partial<UserModel>) {
    super();
    Object.assign(this, data);
    this.preferences = data?.preferences?.map(x => new PreferencesModel(x)) || [];
    this.roles = data?.roles?.map(x => new UserProfileRolesModel(x)) || [];
    this.roles.filter(x => x.customerNumber != '')
      .filter((role, index, self) => 
        self.findIndex(r => r.customerNumber === role.customerNumber) === index
      )
      .map(x => this.customerSites.push(`${x.customerNumber} - ${x.siteNumber}`)) || [];
  }

  public get fullCustomerSites(): string[] {
    return this.customerSites.filter(p => Boolean(p));
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }


  static deserialize(user: IAPIUserResponse): UserModel {
    if (!user) {
      return new UserModel();
    }

    const data: Partial<UserModel> = {
      id: user.Id,
      csdUsername: user.CSDUsername,
      activeCustomerId: user.ActiveCustomerId,
      activeCustomerSite: user.ActiveCustomerSite,
      userId: user.UserId,
      oktaUserId: user.OktaUserId,
      csdUserId: user.CSDUserId,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      username: user.Username,
      oracleFNDUsername: user.OracleFNDUsername,
      oracleFNDUserId: user.OracleFNDUserId,
      lastLogin: user.LastLogin,
      status: user.Status,
      provider: user.Provider,
      isEmailVerified: user.IsEmailVerified,
      assumeIdentity: user.AssumeIdentity,
      jobRole: { label: user.JobRole, value: user.JobRole },
      endDate: user.EndDate,
      preferences: user.Preferences.map(
        x => new PreferencesModel({ key: x as string, value: x as string })
      ),
      roles: UserProfileRolesModel.deserializeList(user.Roles),
    };

    return new UserModel(data);
  }

  static deserializeV3(user: IAPIUserV3Response): UserModel {
    if (!user) {
      return new UserModel();
    }

    const data: Partial<UserModel> = {
      id: user.Id,
      csdUsername: user.UVGOProfile.CSDUsername,
      activeCustomerId: user.UVGOProfile.ActiveCustomerId,
      activeCustomerSite: user.UVGOProfile.ActiveCustomerSite,
      userId: user.OktaUserId,
      oktaUserId: user.OktaUserId,
      csdUserId: user.UVGOProfile.CSDUserId,
      firstName: user.FirstName,
      lastName: user.LastName,
      username: user.Username,
      email: user.Email,
      oracleFNDUsername: user.UVGOProfile.OracleFNDUsername,
      oracleFNDUserId: user.UVGOProfile.OracleFNDUserId,
      lastLogin: user.UVGOProfile.LastLogin,
      status: user.Status,
      provider: user.Provider,
      isEmailVerified: user.IsEmailVerified,
      assumeIdentity: user.UVGOProfile.AssumeIdentity,
      manualAssumedIdentity: user.UVGOProfile.AssumeIdentity,
      jobRole: { label: user.UVGOProfile.JobRole, value: user.UVGOProfile.JobRole },
      endDate: user.EndDate,
      preferences: user.Preferences?.map(
        x => new PreferencesModel({ key: x as string, value: x as string })
      ),
      roles: UserProfileRolesModel.deserializeList(user.Roles),
      ciscoUsername: user.CiscoUsername
    };

    return new UserModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIUserResponse {
    return {
      Id: this.id,
      CSDUsername: this.csdUsername,
      ActiveCustomerId: this.activeCustomerId,
      ActiveCustomerSite: this.activeCustomerSite,
      UserId: this.userId,
      OktaUserId: this.oktaUserId,
      CSDUserId: this.csdUserId,
      FirstName: this.firstName,
      LastName: this.lastName,
      Username: this.username,
      Email: this.email,
      OracleFNDUsername: this.oracleFNDUsername,
      OracleFNDUserId: this.oracleFNDUserId,
      LastLogin: this.lastLogin,
      Status: this.status,
      Provider: this.provider,
      IsEmailVerified: this.isEmailVerified,
      AssumeIdentity: this.assumeIdentity,
      ManualAssumedIdentity: this.assumeIdentity,
      JobRole: this.jobRole?.value as string,
      EndDate: this.endDate,
      Preferences: this.preferences,
      Roles: this.roles?.map((roles: UserProfileRolesModel) => roles.serialize()) || [],
      CiscoUsername: this.ciscoUsername
    };
  }

  static deserializeList(users: IAPIUserResponse[]): UserModel[] {
    return users ? users.map((user: IAPIUserResponse) => UserModel.deserialize(user)) : [];
  }

  static deserializeListV3(users: IAPIUserV3Response[]): UserModel[] {
    return users ? users.map((user: IAPIUserV3Response) => UserModel.deserializeV3(user)) : [];
  }

  // required in auto complete
  public get label(): string {
    if (!Boolean(this.fullName) && !Boolean(this.username)) {
      return '';
    }
    return `${this.fullName} | ${this.username}`;
  }
  
  public get value(): string | number {
    return this.id;
  }

  public get rolesString(): string {
    return this.roles.map(role => role.name).sort().join(', ');
  }
}
