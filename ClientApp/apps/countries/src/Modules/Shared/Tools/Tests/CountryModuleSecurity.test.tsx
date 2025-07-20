import { expect } from 'chai';
import * as sinon from 'sinon';
import { ModeStore, MODE_TYPES } from '@wings-shared/mode-store';
import { AuthStore, Logger, USER_GROUP, UserMock } from '@wings-shared/security';
import { CountryModuleSecurity } from '../CountryModuleSecurity';
import { COUNTRY_MODULE_NAMES } from '../../Enums';

describe('Country Module Security Tests', () => {
  beforeEach(() => {
    sinon.stub(Logger, 'warning').returns(null);
  });

  afterEach(() => {
    AuthStore.onUserUnloaded();
    sinon.restore();
  });

  it('Admin have Edit access', () => {
    const user = new UserMock([ USER_GROUP.ADMIN ]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new CountryModuleSecurity();

    expect(securityModule.isEditable).to.be.true;
  });

  it('Data Manager User have Edit access', () => {
    const user = new UserMock([ USER_GROUP.DATA_MANAGEMENT ]).userModel;
    AuthStore.onUserLoaded(user, user.accessToken);
    const securityModule = new CountryModuleSecurity();

    expect(securityModule.isEditable).to.be.true;
  });

  it('Prevent edit if no user has been registered', () => {
    const securityModule = new CountryModuleSecurity();
    expect(securityModule.isEditable).to.be.false;
  });

  it('isSubModuleVisible should show/hide modules properly', () => {
    const securityModule: any = new CountryModuleSecurity();
    sinon.stub(securityModule, 'hiddenSubModules').value(['continents']);
    // expect(securityModule.isSubModuleVisible(COUNTRY_MODULE_NAMES.CONTINENTS)).to.be.false;
    // should show module
    expect(securityModule.isSubModuleVisible(COUNTRY_MODULE_NAMES.REGIONS)).to.be.true;
  });

  it('isSubModuleVisible should show hidden modules if dev mode is on', () => {
    ModeStore.switchMode(MODE_TYPES.DEV, true);
    const securityModule: any = new CountryModuleSecurity();
    sinon.stub(securityModule, 'hiddenSubModules').value(['continents']);
    expect(securityModule.isSubModuleVisible(COUNTRY_MODULE_NAMES.CONTINENTS)).to.be.true;
  });
});
