import { expect } from 'chai';
import * as sinon from 'sinon';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { AircraftModuleSecurity } from '../AircraftModuleSecurity';

describe('Aircraft Module Security Tests', () => {
  beforeEach(() => {
    sinon.stub(Logger, 'warning').returns();
  });

  afterEach(() => {
    AuthStore.onUserUnloaded();
    sinon.restore();
  });

  it('Admin and FP user have Edit access', () => {
    const user = new UserMock([USER_GROUP.ADMIN, USER_GROUP.FP_DATA_MANAGEMENT, USER_GROUP.FP_ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new AircraftModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });
});
