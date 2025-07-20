import { USER_GROUP } from '../Enums';
import { UserModel } from '../Models';
import { UserClaims } from '@okta/okta-auth-js';

export class UserMock {
  private readonly groups: USER_GROUP[] = [];

  constructor(groups?: USER_GROUP[]) {
    this.groups = groups || [];
  }

  public get userModel(): UserModel {
    return new UserModel(this.oidcUser, this.encodeAccessToken(this.groups));
  }

  public get oidcUser(): UserClaims {
    const userSettings: UserClaims = {
      name: 'Test',
      iss: '',
      sub: '',
      aud: '',
      exp: 3000000,
      iat: 0,
    };

    return userSettings;
  }

  private encodeAccessToken(groups: USER_GROUP[]): string {
    return [
      btoa(JSON.stringify({ name: 'Test' })),
      btoa(JSON.stringify({ group: groups.map(g => `uwa.wings.app.${g.toLowerCase()}`) })),
    ].join('.');
  }
}
