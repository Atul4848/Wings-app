import { MODULE_NAMES,USER_GROUP,MODULE_ACTIONS} from '../Enums';
import { UserMock } from '../Mocks';
import { ModulePermissionsModel } from '../Models';
import { ModulePermissionsStore ,AuthStore} from '../Stores';
import { Logger } from '../Tools';
import { ModulePermissions } from '../Types';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('Permissions store', () => {
  const userModelMock = new UserMock([USER_GROUP.DATA_MANAGEMENT]).userModel;
  const permissionsMock: ModulePermissions = {
    [MODULE_ACTIONS.EDIT]: [USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN],
    [MODULE_ACTIONS.CREATE]: [USER_GROUP.ADMIN],
  };
  const alternativePermissionsMock: ModulePermissions = {
    [MODULE_ACTIONS.EDIT]: [USER_GROUP.ADMIN],
    [MODULE_ACTIONS.CREATE]: [USER_GROUP.ADMIN],
  };
  const moduleName = MODULE_NAMES.AIRPORTS;
  const alternativeModuleName = MODULE_NAMES.COUNTRY;

  let permissionsStore: ModulePermissionsStore;

  beforeEach(() => {
    sinon.stub(AuthStore, 'user').returns(userModelMock);
    permissionsStore = new ModulePermissionsStore();
    sinon.stub(Logger, 'warning').returns(null);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create instance correctly', () => {
    expect(permissionsStore instanceof ModulePermissionsStore).to.be.true;
  });

  describe('addModule', () => {
    it('should return ModulePermissionsModel', () => {
      const permissions = permissionsStore.addModule(moduleName, permissionsMock);
      expect(permissions instanceof ModulePermissionsModel).to.be.true;
    });

    it('should set permissions correctly', () => {
      const modulePermissions: ModulePermissionsModel = permissionsStore.addModule(moduleName, permissionsMock);
      expect(modulePermissions.permissions).to.eq(permissionsMock);
    });

    it('should replace permissions with new values', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      const newModulePermissions = permissionsStore.addModule(moduleName, alternativePermissionsMock);
      expect(newModulePermissions.permissions).to.eq(alternativePermissionsMock);
    });

    it('should notify the user if values have been replaced', () => {
      const loggerWarningMethod: sinon.SinonStub = Logger.warning as sinon.SinonStub;
      permissionsStore.addModule(moduleName, permissionsMock);
      expect(loggerWarningMethod.callCount).to.eq(0);
      permissionsStore.addModule(moduleName, alternativePermissionsMock);
      expect(loggerWarningMethod.callCount).to.eq(1);
    });
  });

  describe('getModulePermissions', () => {
    it('should return null if the module was not found', () => {
      const permissions = permissionsStore.getModulePermissions(moduleName);
      expect(permissions).to.be.null;
    });

    it('should return ModulePermissionsModel if the module was found', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      const permissions = permissionsStore.addModule(moduleName, permissionsMock);
      expect(permissions instanceof ModulePermissionsModel).to.be.true;
    });

    it('should notify the user if the module was not found', () => {
      const loggerWarningMethod: sinon.SinonStub = Logger.warning as sinon.SinonStub;
      expect(loggerWarningMethod.callCount).to.eq(0);
      permissionsStore.getModulePermissions(moduleName);
      expect(loggerWarningMethod.callCount).to.eq(1);
    });

    it('should not notify the user if the module was found', () => {
      const loggerWarningMethod: sinon.SinonStub = Logger.warning as sinon.SinonStub;
      permissionsStore.addModule(moduleName, permissionsMock);
      expect(loggerWarningMethod.callCount).to.eq(0);
    });
  });

  describe('hasModule', () => {
    it('should return false if the module does not exist', () => {
      expect(permissionsStore.hasModule(moduleName)).to.be.false;
      expect(permissionsStore.hasModule(alternativeModuleName)).to.be.false;
    });

    it('should return true if the module exists', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      expect(permissionsStore.hasModule(moduleName)).to.be.true;
      expect(permissionsStore.hasModule(alternativeModuleName)).to.be.false;
    });
  });

  describe('hasNotModule', () => {
    it('should return true if the module does not exist', () => {
      expect(permissionsStore.hasNotModule(moduleName)).to.be.true;
      expect(permissionsStore.hasNotModule(alternativeModuleName)).to.be.true;
    });

    it('should return true if the module exists', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      expect(permissionsStore.hasNotModule(moduleName)).to.be.false;
      expect(permissionsStore.hasNotModule(alternativeModuleName)).to.be.true;
    });
  });

  describe('removeModule', () => {
    it('should return module correctly', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      permissionsStore.addModule(alternativeModuleName, permissionsMock);

      permissionsStore.removeModule(moduleName);

      expect(permissionsStore.hasModule(moduleName)).to.be.false;
      expect(permissionsStore.hasModule(alternativeModuleName)).to.be.true;
    });
  });

  describe('removeAllModules', () => {
    it('should clear all storage', () => {
      permissionsStore.addModule(moduleName, permissionsMock);
      permissionsStore.addModule(alternativeModuleName, permissionsMock);

      expect(permissionsStore.hasModule(moduleName)).to.be.true;
      expect(permissionsStore.hasModule(alternativeModuleName)).to.be.true;

      permissionsStore.removeAllModules();

      expect(permissionsStore.hasModule(moduleName)).to.be.false;
      expect(permissionsStore.hasModule(alternativeModuleName)).to.be.false;
    });
  });
});
