import { expect } from 'chai';
import { AuthStore, USER_GROUP, UserMock } from '@wings-shared/security';
import { CustomerModuleSecurity } from '../Tools/CustomerModuleSecurity';

describe('Customer Module Security Tests', () => {

  afterEach(() => {
    AuthStore.onUserUnloaded();
  });

  it('Admin have Edit access', () => {
    const user = new UserMock([USER_GROUP.ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new CustomerModuleSecurity();
    securityModule.init();
    expect(securityModule.isEditable).to.be.true;
  });
});
