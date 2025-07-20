import { expect } from 'chai';
import * as sinon from 'sinon';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { PermitModuleSecurity } from '../PermitModuleSecurity';

describe('Permit Module Security Tests', () => {
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
    const securityModule = new PermitModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });
});
