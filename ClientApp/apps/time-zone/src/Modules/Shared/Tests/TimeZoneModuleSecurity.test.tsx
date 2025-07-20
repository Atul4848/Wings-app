import { expect } from 'chai';
import * as sinon from 'sinon';
import { TimeZoneModuleSecurity } from '../Tools/TimeZoneModuleSecurity';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';

describe('TimeZone Module Security Tests', () => {
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
    const securityModule = new TimeZoneModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });

  it('Data Manager User have Edit access', () => {
    const user = new UserMock([USER_GROUP.DATA_MANAGEMENT]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new TimeZoneModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });

  it('Prevent edit if no user has been registered', () => {
    const securityModule = new TimeZoneModuleSecurity();
    expect(securityModule.isEditable).to.be.false;
  });
});
