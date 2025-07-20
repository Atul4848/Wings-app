import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.SECURITY, USER_GROUP.ADMIN ],
};
class UserManagementModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.USER_MANAGEMENT);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new UserManagementModuleSecurity();

export default instance;
export { UserManagementModuleSecurity };
