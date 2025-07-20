import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIUsers } from '../Interfaces';

@modelProtection
export class ActiveUsersModel extends IdNameModel {
  userId: number = 0;
  username: string = '';
  client: string = '';
  email: string = '';
  customerNumber: string = '';
  timestamp: string = '';
  isInternal: boolean;
  isInternalOps: boolean;
  assumedIdentity: number = 0;

  constructor(data?: Partial<ActiveUsersModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(activeUser: IAPIUsers): ActiveUsersModel {
    if (!activeUser) {
      return new ActiveUsersModel();
    }

    const data: Partial<ActiveUsersModel> = {
      userId: activeUser.userId,
      username: activeUser.username,
      client: activeUser.client,
      email: activeUser.email,
      customerNumber: activeUser.customerNumber,
      timestamp: activeUser.timestamp,
      isInternal: activeUser.isInternal,
      isInternalOps: activeUser.isInternalOps,
      assumedIdentity: activeUser.assumedIdentity,
    };

    return new ActiveUsersModel(data);
  }

  static deserializeList(activeUser: IAPIUsers[]): ActiveUsersModel[] {
    return activeUser
      ? activeUser.map((activeUsers: IAPIUsers) => ActiveUsersModel.deserialize(activeUsers))
      : [];
  }
}