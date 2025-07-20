import { expect } from 'chai';
import * as sinon from 'sinon';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { RestrictionModuleSecurity } from '../RestrictionModuleSecurity';

describe('Restriction Module Security Tests', () => {
  beforeEach(() => {
    sinon.stub(Logger, 'warning').returns(null);
  });

  afterEach(() => {
    AuthStore.onUserUnloaded();
    sinon.restore();
  });

  it('Admin have Edit access', () => {
    const user = new UserMock([USER_GROUP.ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new RestrictionModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });

  it('QRG Admin User have Edit access', () => {
    const user = new UserMock([USER_GROUP.QRG_ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new RestrictionModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });

  it('Prevent edit if no user has been registered', () => {
    const securityModule = new RestrictionModuleSecurity();
    expect(securityModule.isEditable).to.be.false;
  });
});
