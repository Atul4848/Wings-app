
import { MODULE_ACTIONS,USER_GROUP } from '../Enums';
import { UserMock } from '../Mocks';
import { ModulePermissionsModel } from '../Models';
import { expect } from 'chai';

describe('ModulePermissionsModel', () => {
  const userMock = new UserMock([ USER_GROUP.DATA_MANAGEMENT ]);
  const permissionsMock = {
    [MODULE_ACTIONS.EDIT]: [USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN],
    [MODULE_ACTIONS.CREATE]: [USER_GROUP.ADMIN],
  };
  let modelInstance: ModulePermissionsModel;

  beforeEach(() => {
    modelInstance = new ModulePermissionsModel(userMock.userModel, permissionsMock);
  });

  it('should create a model instance correctly', () => {
    expect(modelInstance instanceof ModulePermissionsModel).to.be.true;
  });

  it('isGeneralUser should return false', () => {
    expect(modelInstance.isGeneralUser).to.be.false;
  });

  it('isDataManagerUser should return true', () => {
    expect(modelInstance.isDataManagerUser).to.be.true;
  });

  it('isAdminUser should return false', () => {
    expect(modelInstance.isAdminUser).to.be.false;
  });

  describe('hasAccessToAction', () => {
    it('should return true for EDIT', () => {
      expect(modelInstance.hasAccessToAction(MODULE_ACTIONS.EDIT)).to.be.true;
    });

    it('should return false for CREATE', () => {
      expect(modelInstance.hasAccessToAction(MODULE_ACTIONS.CREATE)).to.be.false;
    });
  });

  describe('hasAccessToAnyAction', () => {
    it('should return true for [EDIT, CREATE] actions', () => {
      const actions = [MODULE_ACTIONS.EDIT, MODULE_ACTIONS.CREATE];
      expect(modelInstance.hasAccessToAnyAction(actions)).to.be.true;
    });

    it('should return false for empty array', () => {
      const actions = [];
      expect(modelInstance.hasAccessToAnyAction(actions)).to.be.false;
    });
  });

  describe('hasAccessToAllActions', () => {
    it('should return false for empty array', () => {
      const actions = [];
      expect(modelInstance.hasAccessToAllActions(actions)).to.be.false;
    });

    it('should return false for [EDIT, CREATE] actions', () => {
      const actions = [MODULE_ACTIONS.EDIT, MODULE_ACTIONS.CREATE];
      expect(modelInstance.hasAccessToAllActions(actions)).to.be.false;
    });
  });

  describe('isUserInGroup', () => {
    it('should return true for DATA_MANAGEMENT', () => {
      expect(modelInstance.isUserInGroup(USER_GROUP.DATA_MANAGEMENT)).to.be.true;
    });

    it('should return false for ADMIN', () => {
      expect(modelInstance.isUserInGroup(USER_GROUP.ADMIN)).to.be.false;
    });
  });

  describe('isUserInAnyGroup', () => {
    it('should return false for empty array', () => {
      const groups = [];
      expect(modelInstance.isUserInAnyGroup(groups)).to.be.false;
    });

    it('should return true for [DATA_MANAGEMENT, ADMIN] array', () => {
      const groups = [USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN];
      expect(modelInstance.isUserInAnyGroup(groups)).to.be.true;
    });
  });

  describe('isUserInAllGroups', () => {
    it('should return false for empty array', () => {
      const groups = [];
      expect(modelInstance.isUserInAllGroups(groups)).to.be.false;
    });

    it('should return false for [DATA_MANAGEMENT, ADMIN] array', () => {
      const groups = [USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN];
      expect(modelInstance.isUserInAllGroups(groups)).to.be.false;
    });
  });
});
