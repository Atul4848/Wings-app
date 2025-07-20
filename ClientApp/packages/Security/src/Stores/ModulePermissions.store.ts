import Logger from '../Tools/Logger';
import { MODULE_NAMES } from '../Enums/ModuleNames.enum';
import { ModulePermissionsModel, UserModel } from '../Models';
import { ModulePermissions } from '../Types/ModulePermissions.type';
import AuthStore from './Auth.store';

class ModulePermissionsStore {
  /**
   * @private
   * @desc
   * Map of all registered modules with theirs permissions
   */
  private modulesPermissions: Map<MODULE_NAMES, ModulePermissionsModel> = new Map();

  /**
   * @private
   * @desc
   * Return current user module from Auth store
   *
   * @return {UserModel}
   */
  private get currentUser(): UserModel {
    return AuthStore.user;
  }

  /**
   * @desc
   * Adds a new module with its permissions and returns created ModulePermissionsModel
   *
   * @param {MODULE_NAMES} moduleName
   * @param {Permissions} permissions
   * @return {ModulePermissionsModel}
   */
  public addModule(moduleName: MODULE_NAMES, permissions: ModulePermissions): ModulePermissionsModel {
    const permissionsModule: ModulePermissionsModel = new ModulePermissionsModel(this.currentUser, permissions);

    if (this.hasModule(moduleName)) {
      Logger.warning(`Module "${moduleName}" has been replaced with new permissions`, permissions);
    }

    this.modulesPermissions.set(moduleName, permissionsModule);

    return this.getModulePermissions(moduleName);
  }

  /**
   * @desc
   * Returns permissions for specified module or null if the module does not exist.
   *
   * @param moduleName
   * @return {ModulePermissionsModel | null}
   */
  public getModulePermissions(moduleName: MODULE_NAMES): ModulePermissionsModel | null {
    if (this.hasNotModule(moduleName)) {
      Logger.warning(`Module with name "${moduleName} does not exist"`);
      return null;
    }

    return this.modulesPermissions.get(moduleName);
  }

  /**
   * @desc
   * Checks if module with specified name already exists in storage
   *
   * @param {MODULE_NAMES} moduleName
   * @return {boolean}
   */
  public hasModule(moduleName: MODULE_NAMES): boolean {
    return this.modulesPermissions.has(moduleName);
  }

  /**
   * @desc
   * Checks if module with specified name does not exist in storage
   *
   * @param moduleName
   * @return {boolean}
   */
  public hasNotModule(moduleName: MODULE_NAMES): boolean {
    return !this.modulesPermissions.has(moduleName);
  }

  /**
   * @desc
   * Removes module with all permissions from store
   *
   * @param moduleName {MODULE_NAMES}
   * @return {void}
   */
  public removeModule(moduleName: MODULE_NAMES): void {
    this.modulesPermissions.delete(moduleName);
  }

  /**
   * @desc
   * Clears all storage
   *
   * @return {void}
   */
  public removeAllModules(): void {
    this.modulesPermissions.clear();
  }
}

const instance = new ModulePermissionsStore();

export default instance;
export { ModulePermissionsStore };
