import { IdNameModel, modelProtection, Utilities } from '@wings-shared/core';
import { IAPIRoleResponse } from '../Interfaces';

type RoleType = 'internal' | 'external';

@modelProtection
export class RolesModel extends IdNameModel<string> {
    roleId: string = '';
    userRoleId: string = '';
    type: RoleType = 'external';
    displayName: string = '';
    description: string = '';
    permissions: string[] = [];
    enabled: boolean = true;
    isUvgoAppRole: boolean = null;

    constructor(data?: Partial<RolesModel>) {
      super();
      Object.assign(this, data);
    }

    static deserialize(role: IAPIRoleResponse): RolesModel {
      if (!role) {
        return new RolesModel();
      }
      const data: Partial<RolesModel> = {
        id: Utilities.getTempId(),
        roleId: role.RoleId,
        name: role.Name,
        description: role.Description,
        displayName: role.DisplayName,
        permissions: role.Permissions,
        enabled: role.Enabled,
        type: role.Type?.toLowerCase() as RoleType,
      };

      return new RolesModel(data);
    }

    public serialize(): IAPIRoleResponse {
      return {
        RoleId: this.roleId,
        Type: this.type?.toUpperCase(),
        Name: this.name,
        DisplayName: this.displayName,
        Description: this.description,
        Permissions: this.permissions,
        Enabled: this.enabled,
      };
    }

    static deserializeList(roles: IAPIRoleResponse[]): RolesModel[] {
      return roles
        ? roles.map((role: IAPIRoleResponse) => RolesModel.deserialize(role))
        : [];
    }

    // required in auto complete
    public get label(): string {
      return this.name;
    }

    public get value(): string | number {
      return this.id;
    }

    public get isInternal(): boolean {
      return this.type === 'internal';
    }

    public get isExternal(): boolean {
      return this.type === 'external';
    }
}