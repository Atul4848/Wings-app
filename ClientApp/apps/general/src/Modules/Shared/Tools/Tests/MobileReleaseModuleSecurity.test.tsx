import { expect } from 'chai';
import * as sinon from 'sinon';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { MobileReleaseModuleSecurity } from '../MobileReleaseModuleSecurity';

describe('Mobile Release Module Security Tests', () => {
  beforeEach(() => {
    sinon.stub(Logger, 'warning').returns(null);
  });

  afterEach(() => {
    AuthStore.onUserUnloaded();
    sinon.restore();
  });

  it('Admin and Mobile Admin user have Edit access', () => {
    const user = new UserMock([USER_GROUP.MOBILE_RELEASE, USER_GROUP.ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new MobileReleaseModuleSecurity();
    expect(securityModule.isEditable).to.be.true;
  });
});
