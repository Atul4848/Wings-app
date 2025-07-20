import { IAPIUserCacheResponse } from '../Interfaces';

export class UserCacheModel {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  csdUserId: number;

  constructor(data?: Partial<UserCacheModel>) {
    Object.assign(this, data);
  }

  static deserialize(apiData?: IAPIUserCacheResponse) {
    if (!apiData) return new UserCacheModel();

    const data: Partial<UserCacheModel> = {
      userId: apiData.UserId,
      firstName: apiData.FirstName,
      lastName: apiData.LastName,
      username: apiData.Username,
      csdUserId: apiData.CSDUserId,
    };

    return new UserCacheModel(data);
  }

  static deserializeList(apiData?: any) {
    if (!apiData) return [];

    return apiData.map((item: any) => UserCacheModel.deserialize(item));
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  // required in auto complete
  public get label(): string {
    if (!Boolean(this.fullName) && !Boolean(this.username)) {
      return '';
    }
    return `${this.fullName} | ${this.username}`;
  }

  public get value(): string | number {
    return this.csdUserId;
  }
}
