import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.MOBILE_RELEASE, USER_GROUP.ADMIN ],
};
class MobileReleaseModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.GENERAL);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new MobileReleaseModuleSecurity();

export default instance;
export { MobileReleaseModuleSecurity };
