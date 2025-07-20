import {
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.NOTIFICATIONS, USER_GROUP.NOTIFICATIONS_ADMIN, USER_GROUP.ADMIN ],
};
class NotificationsModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.NOTIFICATIONS);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }
}

const instance = new NotificationsModuleSecurity();

export default instance;
export { NotificationsModuleSecurity };
