import { CoreModel, modelProtection } from '@wings-shared/core';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';

@modelProtection
export class UserModel extends CoreModel {
  csdUserId: any = null;
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNo: string = '';
  userName: string = '';
  password: any = null;
  preferences: any = null;
  groupIds: string[] = [];
  userId?: string | undefined;
  
  constructor(data?: Partial<UserModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return this.firstName;
  }

  public get value(): string | number {
    return this.groupIds[0];
  }

  public serialize(value, groupId, userId): UserModel {
    const env = new EnvironmentVarsStore();
    const uplinkId: string = env.getVar(ENVIRONMENT_VARS.UPLINK_UI_GROUP_ID);
    const groupIds = groupId ? [ groupId, uplinkId ] : [ uplinkId ];
    return new UserModel({
      csdUserId: this.csdUserId || null,
      email: value.email,
      firstName: value.givenName,
      lastName: value.surName,
      userName: value.username || value.email,
      phoneNo: value.phoneNo || '',
      password: this.password || null,
      preferences: this.preferences || null,
      groupIds: groupIds,
      userId: userId != 0 ? userId : value.userId,
    });
  }
  public serializeVendorUser(value, groupId, userId?: string): UserModel {
    const env = new EnvironmentVarsStore();
    const uplinkId: string = env.getVar(ENVIRONMENT_VARS.UPLINK_UI_GROUP_ID);
    const groupIds = groupId ? [ groupId, uplinkId ] : [ uplinkId ];
    return new UserModel({
      csdUserId: this.csdUserId || null,
      email: value.vendorEmailId,
      firstName: value.name,
      lastName: value.code,
      password: this.password || null,
      preferences: this.preferences || null,
      groupIds: groupIds,
      userId: userId != 0 ? userId : value.userId,
    });
  }
}
