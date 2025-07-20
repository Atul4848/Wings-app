import { modelProtection } from '@wings-shared/core';
import { IAPILookupUserResponse } from '../Interfaces';
import { UserResponseModel } from './index';

@modelProtection
export class LookupUserModel {
  users: UserResponseModel[];
  hasData: boolean;

  constructor(data?: Partial<LookupUserModel>) {
    Object.assign(this, data);
    this.users = data?.users?.map((user: UserResponseModel) => new UserResponseModel(user)) || [];
  }

  static deserialize(lookupUser: IAPILookupUserResponse): LookupUserModel {
    if (!lookupUser) {
      return new LookupUserModel();
    }

    const data: Partial<LookupUserModel> = {
      hasData: lookupUser.HasData,
      users: lookupUser.Users?.map(x => UserResponseModel.deserialize({ ...x.User, Message: x.Message })) || [],
    };

    return new LookupUserModel(data);
  }
}
