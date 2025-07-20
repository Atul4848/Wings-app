import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.ADMIN, USER_GROUP.VENDOR_MANAGEMENT_ADMIN, USER_GROUP.DATA_MANAGEMENT ],
};
class VmsModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.VENDOR_MANAGEMENT);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new VmsModuleSecurity();

export default instance;
