import { ISelectOption, IdNameModel } from '@wings-shared/core';
import { USER_LEVEL_ROLES } from '../Enums';

export class UserLevelRoleModel extends IdNameModel<USER_LEVEL_ROLES> implements ISelectOption {
  constructor(data?: Partial<UserLevelRoleModel>) {
    super();
    Object.assign(this, data);
    this.id = data?.id || USER_LEVEL_ROLES.UVX_TRIPS;
    this.name = data?.name || USER_LEVEL_ROLES.UVX_TRIPS;
  }

  static deserialize(deliveryType: USER_LEVEL_ROLES): UserLevelRoleModel {
    if (!deliveryType) {
      return new UserLevelRoleModel();
    }
    const data: Partial<UserLevelRoleModel> = {
      id: deliveryType,
      name: deliveryType,
    };
    return new UserLevelRoleModel(data);
  }

  static searilize(data: UserLevelRoleModel): USER_LEVEL_ROLES {
    if(!data)
      return USER_LEVEL_ROLES.UVX_TRIPS;

    return data.name as USER_LEVEL_ROLES;
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string {
    return this.id;
  }
}
