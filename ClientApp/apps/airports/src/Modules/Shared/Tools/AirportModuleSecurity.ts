import { MODULE_NAMES,ModulePermissions, MODULE_ACTIONS, USER_GROUP, ModuleSecurityBase } from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};
class AirportModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.AIRPORTS);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new AirportModuleSecurity();

export default instance;
export { AirportModuleSecurity };
