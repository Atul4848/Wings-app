import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIUserRef } from '../Interfaces';

@modelProtection
export class UserRefModel extends CoreModel implements ISelectOption {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  guid: string = '';
  csdUsername: string = '';

  constructor(data?: Partial<UserRefModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(user: IAPIUserRef): UserRefModel {
    if (!user) {
      return new UserRefModel();
    }

    const data: Partial<UserRefModel> = {
      id: user.personId || user.id,
      guid: user.personGuid || user.UserGuid || user.Id,
      firstName: user.firstName || user.FirstName,
      lastName: user.lastName || user.LastName,
      email: user.email || user.Username,
      csdUsername: user.UVGOProfile?.CSDUsername || user.UVGOProfile?.csdUsername,
    };

    return new UserRefModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIUserRef {
    return {
      id: this.id || 0,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      personGuid: this.guid,
    };
  }

  static deserializeList(users: IAPIUserRef[]): UserRefModel[] {
    return users ? users.map((user: IAPIUserRef) => UserRefModel.deserialize(user)) : [];
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  public get label(): string {
    const nameOrEmail = this.fullName || this.email;
    return this.csdUsername ? `${nameOrEmail} (${this.csdUsername})` : nameOrEmail;
  }

  public get value(): string | number {
    return this.guid || this.id;
  }
}
