import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};
class PermitModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.PERMITS);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new PermitModuleSecurity();

export default instance;
export { PermitModuleSecurity };
