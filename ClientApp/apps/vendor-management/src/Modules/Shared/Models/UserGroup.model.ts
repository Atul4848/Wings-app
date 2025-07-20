import { IAPIUserGroup } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';

@modelProtection
export class UserGroupModel extends BaseModel {
  description: string = '';
  unlocked: boolean = false;
  idleTimeout: number = 0;

  constructor(data?: Partial<UserGroupModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(userGroup: IAPIUserGroup): UserGroupModel {
    if (!userGroup) {
      return new UserGroupModel();
    }

    const data: Partial<UserGroupModel> = {
      id: userGroup.Id,
      name: userGroup.Name,
      description: userGroup.Description,
      unlocked: userGroup.Unlocked,
      idleTimeout: userGroup.IdleTimeout,
    };

    return new UserGroupModel(data);
  }

  mapExistingUserGroups(groups:UserGroupModel[]){
    if(groups)
    {
      return groups.find(g=>g.name==this.name);
    }
    else
    {
      return this;
    }
  }

  static deserializeList(userGroups: IAPIUserGroup[]): UserGroupModel[] {
    return userGroups ? userGroups.map((userGroup: IAPIUserGroup) => UserGroupModel.deserialize(userGroup)) : [];
  }
}
