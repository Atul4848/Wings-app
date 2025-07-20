import { IAPIUserResponse, IAPIUserRequest } from '../Interfaces';
import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class VendorUserResponseModel extends IdNameModel<string> {
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  role: ISelectOption;
  isInternal: boolean = false;
  csdUserId: number = 0;
  status: string = '';
  endDate: string = '';
  userId: string = '';
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
  constructor(data?: Partial<VendorUserResponseModel>) {
    super();
    Object.assign(this, data);
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: IAPIUserResponse): VendorUserResponseModel {
    if (!user) {
      return new VendorUserResponseModel();
    }

    const data: Partial<VendorUserResponseModel> = {
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
      userId: user.UserId,
      userGuid: user.UserGuid,
      assumedIdentity: user.AssumedIdentity,
    };

    return new VendorUserResponseModel(data);
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

  static deserializeList(users: IAPIUserResponse[]): VendorUserResponseModel[] {
    return users ? users.map((user: IAPIUserResponse) => VendorUserResponseModel.deserialize(user)) : [];
  }
}
