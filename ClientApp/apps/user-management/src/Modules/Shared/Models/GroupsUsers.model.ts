import { IAPIGroupsUsers } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class GroupsUsersModel extends IdNameModel {
  userId: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  role: string = '';
  csdUserId: number = 0;
  status: string = '';
  provider: string = '';

  constructor(data?: Partial<GroupsUsersModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(groupUser: IAPIGroupsUsers): GroupsUsersModel {
    if (!groupUser) {
      return new GroupsUsersModel();
    }

    const data: Partial<GroupsUsersModel> = {
      id: groupUser.Id,
      userId: groupUser.UserId,
      firstName: groupUser.FirstName,
      lastName: groupUser.LastName,
      email: groupUser.Email,
      username: groupUser.Username,
      role: groupUser.Role,
      csdUserId: groupUser.CsdUserId,
      status: groupUser.Status,
      provider: groupUser.Provider,
    };

    return new GroupsUsersModel(data);
  }

  static deserializeList(groupsUsers: IAPIGroupsUsers[]): GroupsUsersModel[] {
    return groupsUsers ? groupsUsers.map((groupUser: IAPIGroupsUsers) => GroupsUsersModel.deserialize(groupUser)) : [];
  }
}
