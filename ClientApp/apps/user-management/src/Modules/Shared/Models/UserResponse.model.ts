import { IAPIUserResponse, IAPIUserRequest } from '../Interfaces';
import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';

const env: EnvironmentVarsStore = new EnvironmentVarsStore();

@modelProtection
export class UserResponseModel extends IdNameModel<string> {
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  role: ISelectOption;
  isInternal: boolean = false;
  csdUserId: number = 0;
  status: string = '';
  endDate: string = '';
  oktaUserId: string = '';
  phone: number = 0;
  customerNumber: string = '';
  creationDate: string = '';
  isEmailVerified: boolean = false;
  exists: boolean = false;
  isTFOEnabled: boolean = false;
  isFPList: boolean = false;
  provider: string = '';
  legacyUsername: string = '';
  message?: string = '';
  userGuid: string = '';
  assumedIdentity?: number = null;
  constructor(data?: Partial<UserResponseModel>) {
    super();
    Object.assign(this, data);
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: IAPIUserResponse): UserResponseModel {
    if (!user) {
      return new UserResponseModel();
    }

    const data: Partial<UserResponseModel> = {
      id: user.Id,
      firstName: user.FirstName,
      lastName: user.LastName,
      username: user.Username,
      email: user.Email,
      role: { label: user.Role, value: user.Role },
      isInternal: user.IsInternal,
      csdUserId: user.CsdUserId,
      status: user.Status,
      endDate: user.EndDate,
      phone: user.Phone,
      customerNumber: user.CustomerNumber,
      creationDate: user.CreationDate,
      isEmailVerified: user.ISEmailVerified,
      exists: user.Exists,
      isTFOEnabled: user.ISTFOEnabled,
      isFPList: user.ISFPList,
      provider: user.Provider,
      legacyUsername: user.LegacyUsername,
      message: user.Message,
      oktaUserId: user.OktaUserId,
      userGuid: user.UserGuid,
      assumedIdentity: user.AssumedIdentity,
    };

    return new UserResponseModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIUserRequest {
    return {
      UserId: this.id,
      FirstName: this.firstName,
      LastName: this.lastName,
      AssumedIdentity: this.assumedIdentity,
    };
  }

  static deserializeList(users: IAPIUserResponse[]): UserResponseModel[] {
    return users ? users.map((user: IAPIUserResponse) => UserResponseModel.deserialize(user)) : [];
  }

  // required in auto complete
  public get label(): string {
    if (this.fullName && this.email) {
      return `${this.fullName} | ${this.email}`;
    }
    return this.fullName || this.email;
  }

  public get value(): string | number {
    return this.id;
  }

  public get isQA(): boolean {
    const allowedDomains = [ 'universalweather.net', 'univ-wea.com' ];
    const domain: string = this.username?.split('@')[1]?.toLowerCase() ?? '';
    const isDevEnvironment: boolean = env.getVar(ENVIRONMENT_VARS.HOST_ENVIRONMENT) === 'DEV';

    if (!isDevEnvironment || !domain) return false;

    return allowedDomains.includes(domain);
  }
}
