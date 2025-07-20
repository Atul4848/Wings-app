
import { expect } from 'chai';
import { UserClaims } from '@okta/okta-auth-js';
import { UserModel } from '../Models';
import { USER_GROUP } from '../Enums';

const oidcUser: UserClaims = {
  sub: '',
  email_verified: true,
  name: 'Test',
};

describe('UserModel test', function () {
  it('has access return false if no user groups provided', function () {
    const user = new UserModel(oidcUser);
    expect(user.hasAccess(USER_GROUP.GENERAL)).to.be.false;
  });

  it('has access return false if groups has wrong format', function () {
    const user = new UserModel(oidcUser, '', ['uwa.app.admin', 'uwa.app.general']);
    expect(user.hasAccess(USER_GROUP.GENERAL)).to.be.false;
  });

  it('has access return true user in the group', function () {
    const user = new UserModel(oidcUser, '', ['uwa.wings.app.admin', 'uwa.wings.app.general']);
    expect(user.hasAccess(USER_GROUP.GENERAL)).to.be.true;
  });

  it('has access return false user in the group', function () {
    const user = new UserModel(oidcUser, '', ['uwa.wings.app.admin', 'uwa.wings.app.datamanagement']);
    expect(user.hasAccess(USER_GROUP.GENERAL)).to.be.false;
  });

  it('get authorizationGroups returns array of USER_GROUP', function () {
    const user = new UserModel(oidcUser, '', ['uwa.wings.app.admin', 'uwa.wings.app.datamanagement']);
    expect(user.authorizationGroups).to.eqls([USER_GROUP.ADMIN, USER_GROUP.DATA_MANAGEMENT]);
  });
});
