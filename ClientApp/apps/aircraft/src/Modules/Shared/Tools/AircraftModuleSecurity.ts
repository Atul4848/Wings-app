import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.FP_ADMIN, USER_GROUP.FP_DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};
class AircraftModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.AIRCRAFT);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new AircraftModuleSecurity();

export default instance;
export { AircraftModuleSecurity };
