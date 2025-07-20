import { ActiveUsers } from '../Interfaces';
import { ActiveUsersModel } from './ActiveUsers.model';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class ActiveUserModel extends IdNameModel {
  tierType: string;
  tierTime: string;
  totalCount: string;
  users: ActiveUsersModel[] = [];

  constructor(data?: Partial<ActiveUserModel>) {
    super();
    Object.assign(this, data);
    this.users = data?.users?.map(x => new ActiveUsersModel(x)) || [];
  }

  static deserialize(activeUser: ActiveUsers): ActiveUserModel {
    if (!activeUser) {
      return new ActiveUserModel();
    }

    const data: Partial<ActiveUserModel> = {
      tierType: activeUser.TierType,
      tierTime: activeUser.TierTime,
      totalCount: activeUser.TotalCount,
      users: ActiveUsersModel.deserializeList(activeUser.Users),
    };

    return new ActiveUserModel(data);
  }

  static deserializeList(activeUser: ActiveUsers[]): ActiveUserModel[] {
    return activeUser
      ?.map((activeUser: ActiveUsers) =>
        ActiveUserModel.deserialize(activeUser)) || [];
  }
}