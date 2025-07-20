import {
  AuthStore,
  MODULE_NAMES,
  ModuleSecurityBase,
  ModulePermissions,
  MODULE_ACTIONS,
  USER_GROUP,
} from '@wings-shared/security';

const permissions: ModulePermissions = {
  [MODULE_ACTIONS.EDIT]: [ USER_GROUP.DATA_MANAGEMENT, USER_GROUP.ADMIN ],
};

class TimeZoneModuleSecurity extends ModuleSecurityBase<string> {
  constructor() {
    super(MODULE_NAMES.GEOGRAPHIC);
  }

  public init(): void {
    this.setModulePermissions(permissions);
  }

  /* istanbul ignore next */
  // used for world events
  public get isEventEditable(): boolean {
    return this.isEditable || AuthStore.user?.isUaUser || AuthStore.user?.isUwaMarketingUser;
  }

  /* istanbul ignore next */
  // used for world events settings
  public get isSettingsEditable(): boolean {
    return this.isEditable || AuthStore.user?.isUwaMarketingUser;
  }
}

const instance = new TimeZoneModuleSecurity();

export default instance;
export { TimeZoneModuleSecurity };
