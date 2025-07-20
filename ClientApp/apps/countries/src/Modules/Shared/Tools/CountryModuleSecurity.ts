import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';
import { COUNTRY_MODULE_NAMES } from '../Enums';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};

class CountryModuleSecurity extends ModuleSecurityBase<COUNTRY_MODULE_NAMES> {
  constructor() {
    super(MODULE_NAMES.COUNTRY);
    this.setModulePermissions(permissions);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new CountryModuleSecurity();

export default instance;
export { CountryModuleSecurity };
