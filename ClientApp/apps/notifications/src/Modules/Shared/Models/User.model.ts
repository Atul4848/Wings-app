import { IAPIUserResponse } from '@wings/shared';
import { ISelectOption, IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class UserModel extends IdNameModel<string> implements ISelectOption {
  firstName: string = '';
  lastName: string = '';
  customerNumber: string = '';
  email: string = '';
  csdUserId: number = 0;

  // this field is used to bind the search value with Autocomplete
  searchStr: string = '';

  constructor(data?: Partial<UserModel>) {
    super();
    Object.assign(this, data);
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: IAPIUserResponse): UserModel {
    if (!user) {
      return new UserModel();
    }

    const data: Partial<UserModel> = {
      id: user.UserId,
      firstName: user.FirstName,
      lastName: user.LastName,
      name: user.Username,
      customerNumber: user.CustomerNumber,
      email: user.Email,
      csdUserId: user.CsdUserId,
    };

    return new UserModel(data);
  }

  static deserializeList(users: IAPIUserResponse[]): UserModel[] {
    return users ? users.map((user: IAPIUserResponse) => UserModel.deserialize(user)) : [];
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    if (!Boolean(this.name) && !Boolean(this.email) && !Boolean(this.fullName)) {
      return this.searchStr;
    }
    if (!Boolean(this.email)) {
      return `${this.name} | ${this.fullName}`;
    }
    return `${this.name} | ${this.email} | ${this.fullName}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
