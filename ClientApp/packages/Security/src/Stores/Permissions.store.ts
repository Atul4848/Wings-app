import { action, observable } from 'mobx';
import { EnvironmentVarsStore } from '@wings-shared/env-store';
import { USER_ACCESS_ROLES } from '../Enums';

export declare type PermissionRoleItem = {
  RoleId: string;
  Name: typeof USER_ACCESS_ROLES | string;
  Enabled: boolean;
  Description: string;
  Permissions: string[];
}

export class PermissionsStore {
  env = new EnvironmentVarsStore();
  @observable roles: PermissionRoleItem[] = [];
  @observable permissions: Set<string> = new Set();
  @observable emitChanges: boolean = false;

  @action
  setEmitChanges(): void {
    this.emitChanges = !this.emitChanges;
  }

  @action
  setRoles(roles: PermissionRoleItem[]): void {
    this.roles = roles;
  }

  hasRole (role: typeof USER_ACCESS_ROLES | string): boolean {
    return this.roles.some((item: PermissionRoleItem) => item.Name === role);
  }

  hasAllRoles (roles: (typeof USER_ACCESS_ROLES | string)[]): boolean {
    return roles.every((role: typeof USER_ACCESS_ROLES | string) => this.hasRole(role));
  }

  hasAnyRole (roles: (typeof USER_ACCESS_ROLES | string)[]): boolean {
    return roles.some((role: typeof USER_ACCESS_ROLES | string) => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }

  hasAllPermissions (permissions: string[]): boolean {
    return permissions.every((item: string) => this.permissions.has(item));
  }

  hasAnyPermission (permissions: string[]): boolean {
    return permissions.some((item: string) => this.permissions.has(item));
  }

  setDataFromApi(apiData: any): void {
    if (!apiData || !apiData.Roles) {
      this.setRoles([]);
      return;
    }

    const roles: PermissionRoleItem[] = apiData.Roles.map((item: any) => ({
      RoleId: item.RoleId,
      Name: item.Name,
      Enabled: item.Enabled,
      Description: item.Description,
      Permissions: item.Permissions,
    }));

    this.permissions.clear();   // clear exiting permissions

    roles.forEach((role: PermissionRoleItem) => {
      role.Permissions.forEach((permission: string) => this.permissions.add(permission));
    });

    if (localStorage.debugger) {
      console.log('%cSet user roles', 'color: mediumOrchid; font-size: 13px;', roles);
    }

    this.setRoles(roles);
    this.setEmitChanges();
  }

  reset() {
    if (localStorage.debugger) {
      console.log('%cReset roles', 'color: mediumOrchid; font-size: 13px;');
    }
    this.setRoles([]);
    this.permissions.clear();
    this.setEmitChanges();
  }
}
