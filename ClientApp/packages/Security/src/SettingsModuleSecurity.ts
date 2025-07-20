import { USER_GROUP, MODULE_ACTIONS, MODULE_NAMES } from './Enums';
import { ModuleSecurityBase } from './Tools';
import { ModulePermissions } from './Types/ModulePermissions.type';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [USER_GROUP.ADMIN],
};

class SettingsModuleSecurity extends ModuleSecurityBase<MODULE_NAMES> {
  constructor() {
    super(MODULE_NAMES.SETTINGS);
  }

  public updatePermissions(_permissions?: ModulePermissions): void {
    this.setModulePermissions(_permissions || permissions);
  }
}

const instance = new SettingsModuleSecurity();

export default instance;
export { SettingsModuleSecurity };
