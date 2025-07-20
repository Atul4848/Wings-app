import { modelProtection } from '@wings-shared/core';
import { ISalesPersonResponse } from '../Interfaces';

@modelProtection
export class SalesPersonModel {
  firstName: string = '';
  lastName: string = '';
  username: string = '';

  constructor(data?: Partial<SalesPersonModel>) {
    Object.assign(this, data);
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: ISalesPersonResponse): SalesPersonModel {
    if (!user) {
      return new SalesPersonModel();
    }

    const data: Partial<SalesPersonModel> = {
      firstName: user.FirstName,
      lastName: user.LastName,
      username: user.Username,
    };

    return new SalesPersonModel(data);
  }



  static deserializeList(profiles: ISalesPersonResponse[]): SalesPersonModel[] {
    return profiles
      ? profiles.map((user: ISalesPersonResponse) => SalesPersonModel.deserialize(user))
      : [];
  }
}
