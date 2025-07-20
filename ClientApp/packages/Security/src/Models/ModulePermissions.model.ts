import { UserModel } from './User.model';
import { ModulePermissions } from '../Types';
import { MODULE_ACTIONS, USER_GROUP } from '../Enums';

export class ModulePermissionsModel {
  readonly user: UserModel;
  readonly permissions: ModulePermissions;

  constructor(user: UserModel, permissions: ModulePermissions) {
    this.user = user;
    this.permissions = permissions;
  }

  /**
   * @desc
   * Checks if the user has access to the specified action. Otherwise returns boolean false.
   *
   * @param {MODULE_ACTIONS} action
   * @return {boolean}
   */
  public hasAccessToAction(action: MODULE_ACTIONS): boolean {
    const hasPermission = (userGroup: USER_GROUP) => this.permissions[action].includes(userGroup);
    const userGroups: USER_GROUP[] = this.user?.authorizationGroups || [];

    return userGroups.some(hasPermission);
  }

  /**
   * @desc
   * Returns boolean true if the user has access to at least one specified action. Otherwise returns boolean false.
   * Returns boolean false if actions array is empty.
   *
   * @param {MODULE_ACTIONS[]} actions
   * @return {boolean}
   */
  public hasAccessToAnyAction(actions: MODULE_ACTIONS[]): boolean {
    if (!actions.length) {
      return false;
    }

    return actions.some((action: MODULE_ACTIONS) => this.hasAccessToAction(action));
  }

  /**
   * @desc
   * Returns boolean true if the user has access to ALL specified actions. Otherwise returns boolean false.
   * Returns boolean false if actions array is empty.
   *
   * @param {MODULE_ACTIONS[]} actions
   * @return {boolean}
   */
  public hasAccessToAllActions(actions: MODULE_ACTIONS[]): boolean {
    if (!actions.length) {
      return false;
    }

    return actions.every((action: MODULE_ACTIONS) => this.hasAccessToAction(action));
  }

  /**
   * @desc
   * Checks if the user belongs to the specified group
   *
   * @param {USER_GROUP} group
   * @return {boolean}
   */
  public isUserInGroup(group: USER_GROUP): boolean {
    return this.user.authorizationGroups.includes(group);
  }

  /**
   * @desc
   * Returns boolean true if the user belongs to at least one specified user group. Otherwise returns boolean false.
   * Returns boolean false if groups array is empty.
   *
   * @param {USER_GROUP[]} groups
   * @return {boolean}
   */
  public isUserInAnyGroup(groups: USER_GROUP[]): boolean {
    if (!groups.length) {
      return false;
    }

    return groups.some((group: USER_GROUP) => this.isUserInGroup(group));
  }

  /**
   * @desc
   * Returns boolean true if the user belongs to ALL specified user group. Otherwise returns boolean false.
   * Returns boolean false if groups array is empty.
   *
   * @param {USER_GROUP[]} groups
   * @return {boolean}
   */
  public isUserInAllGroups(groups: USER_GROUP[]): boolean {
    if (!groups.length) {
      return false;
    }

    return groups.every((group: USER_GROUP) => this.isUserInGroup(group));
  }

  /**
   * @desc
   * Returns boolean true if the user belongs to GENERAL user group.
   *
   * @return {boolean}
   */
  public get isGeneralUser(): boolean {
    return this.isUserInGroup(USER_GROUP.GENERAL);
  }

  /**
   * @desc
   * Returns boolean true if the user belongs to DATA_MANAGEMENT user group.
   *
   * @return {boolean}
   */
  public get isDataManagerUser(): boolean {
    return this.isUserInGroup(USER_GROUP.DATA_MANAGEMENT);
  }

  /**
   * @desc
   * Returns boolean true if the user belongs to ADMIN user group.
   *
   * @return {boolean}
   */
  public get isAdminUser(): boolean {
    return this.isUserInGroup(USER_GROUP.ADMIN);
  }
}
