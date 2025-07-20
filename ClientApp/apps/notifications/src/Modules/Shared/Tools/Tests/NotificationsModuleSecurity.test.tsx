import { expect } from 'chai';
import * as sinon from 'sinon';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { NotificationsModuleSecurity } from '../NotificationsModuleSecurity';

describe('Notifications Module Security Tests', () => {
  beforeEach(() => {
    sinon.stub(Logger, 'warning').returns(null);
  });

  afterEach(() => {
    AuthStore.onUserUnloaded();
    sinon.restore();
  });

  it('Admin and Notification user have Edit access', () => {
    const user = new UserMock([USER_GROUP.NOTIFICATIONS, USER_GROUP.ADMIN]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new NotificationsModuleSecurity();
    expect(securityModule.isEditable).to.be.true;
  });
});
