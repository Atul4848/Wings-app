import {
  AuthStore,
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.QRG_ADMIN, USER_GROUP.ADMIN, USER_GROUP.QRG_DATA_MANAGEMENT ],
};

class RestrictionModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.RESTRICTIONS);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }

  public get isQRGDataManagement(): boolean {
    return AuthStore.user?.isQRGDataManagement;
  }
}

const instance = new RestrictionModuleSecurity();

export default instance;
export { RestrictionModuleSecurity };
