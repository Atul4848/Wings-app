import { IdNameModel, modelProtection } from '@wings-shared/core';
import { IAPIOrcaleUser } from '../Interfaces';

@modelProtection
export class OracleUser extends IdNameModel {
  userId: number =  0;
  username: string = '';
  description: string = '';
  email: string = '';
  

  constructor(data?: Partial<OracleUser>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(activeUser: IAPIOrcaleUser): OracleUser {
    if (!activeUser) {
      return new OracleUser();
    }

    const data: Partial<OracleUser> = {
      userId: activeUser.UserId,
      username: activeUser.Username,
      description: activeUser.Description,
      email: activeUser.Email,
    };

    return new OracleUser(data);
  }

  static deserializeList(activeUser: any): OracleUser[] {
    return activeUser
      ? activeUser.map((activeUsers: IAPIOrcaleUser) => OracleUser.deserialize(activeUsers))
      : [];
  }

  // required in auto complete
  public get label(): string {
    if (!Boolean(this.username)) {
      return '';
    }
    return `${this.username} | ${this.email}`;
  }

  public get value(): string | number {
    return this.userId;
  }
}