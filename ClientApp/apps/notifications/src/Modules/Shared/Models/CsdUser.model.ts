import { modelProtection } from '@wings-shared/core';
import { IAPICSDUserResponse } from '../../../../../user-management/src/Modules';
import { UserModel } from './User.model';

@modelProtection
export class CsdUserModel extends UserModel {
  firstName: string = '';
  lastName: string = '';
  customerNumber: string = '';
  email: string = '';

  constructor(data?: Partial<CsdUserModel>) {
    super();
    Object.assign(this, data);
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: IAPICSDUserResponse): CsdUserModel {
    if (!user) {
      return new CsdUserModel();
    }

    const data: Partial<CsdUserModel> = {
      id: user.UserId,
      firstName: user.FirstName,
      lastName: user.LastName,
      name: user.Username,
      customerNumber: user.CustomerNumber,
      email: user.Email,
    };

    return new CsdUserModel(data);
  }

  static deserializeList(users: IAPICSDUserResponse[]): CsdUserModel[] {
    return users ? users.map((user: IAPICSDUserResponse) => CsdUserModel.deserialize(user)) : [];
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
