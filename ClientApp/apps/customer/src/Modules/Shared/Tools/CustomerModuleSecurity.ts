import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [ MODULE_ACTIONS.EDIT ]: [ USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};

class CustomerModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.CUSTOMER);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new CustomerModuleSecurity();

export default instance;
export { CustomerModuleSecurity };
