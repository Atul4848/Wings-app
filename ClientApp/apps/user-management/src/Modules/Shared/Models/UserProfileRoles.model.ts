import { IdNameModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';
import { IAPIUserProfileRoleResponse } from '../Interfaces';
import { AttributesModel } from './Attributes.model';
import { CustomerModel } from './Customer.model';
import { SiteModel } from '../Models/Sites.model';
import { ROLE_ACCESS_TYPE } from '../Enums';
import { RegistryModel } from './Registry.model';

type RoleType = 'internal' | 'external';

@modelProtection
export class UserProfileRolesModel extends IdNameModel<string> {
    roleId: string = '';
    userRoleId: string = '';
    type: RoleType = 'external';
    displayName: string = '';
    description: string = '';
    permissions: string[] = [];
    attributes: AttributesModel[] = [];
    customer?: CustomerModel | null;
    site?: SiteModel | null;
    customerNumber: string = '';
    siteNumber: string = '';
    applicationId: string = '';
    appServiceId: string = '';
    enabled: boolean;
    accessType: ROLE_ACCESS_TYPE = ROLE_ACCESS_TYPE.STANDARD;
    validFrom: string = '';
    validTo: string = '';
    registry?: RegistryModel | null;

    constructor(data?: Partial<UserProfileRolesModel>) {
      super();
      Object.assign(this, data);
      this.attributes = data?.attributes?.map(x => new AttributesModel(x)) || [];
      this.customer = data?.customer && new CustomerModel(data?.customer);
      this.site = data?.site && new SiteModel(data?.site);
      this.customerNumber = data?.attributes?.find(x => x.type === 'CustomerNumber')?.value ?? '';
      this.siteNumber = data?.attributes?.find(x => x.type === 'Site')?.value ?? '';
    }

    static deserialize(role: IAPIUserProfileRoleResponse): UserProfileRolesModel {
      if (!role) {
        return new UserProfileRolesModel();
      }
      const data: Partial<UserProfileRolesModel> = {
        id: Utilities.getTempId(),
        roleId: role.RoleId,
        userRoleId: role.UserRoleId,
        name: role.Name,
        description: role.Description,
        displayName: role.DisplayName,
        permissions: role.Permissions,
        attributes: AttributesModel.deserializeList(role.Attributes),
        applicationId: role.ApplicationId,
        appServiceId: role.AppServiceId,
        enabled: role.Enabled,
        type: role.Type?.toLowerCase() as RoleType,
        accessType: UserProfileRolesModel.getAccessType(role),
        validFrom: role.ValidFrom || '',
        validTo: role.ValidTo || '',
      };

      return new UserProfileRolesModel(data);
    }

    public serialize(): IAPIUserProfileRoleResponse { 
      return {
        RoleId: this.roleId,
        UserRoleId: this.userRoleId,
        Name: this.name,
        DisplayName: this.displayName,
        Description: this.description,
        Permissions: this.permissions,
        ApplicationId: this.applicationId,
        AppServiceId: this.appServiceId,
        Attributes: this.attributes?.map((attributes: AttributesModel) => attributes.serialize()) || [],
        Enabled: this.enabled,
        IsTrial: this.isTrial,
        ValidFrom: this.validFrom,
        ValidTo: this.validTo,
      };
    }

    static deserializeList(roles: IAPIUserProfileRoleResponse[]): UserProfileRolesModel[] {
      return roles
        ? roles.map((role: IAPIUserProfileRoleResponse) => UserProfileRolesModel.deserialize(role))
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

    public get isTrial(): boolean {
      return this.accessType === ROLE_ACCESS_TYPE.TRIAL;
    }

    static getAccessType(role: IAPIUserProfileRoleResponse): ROLE_ACCESS_TYPE {
      if (role.IsTrial) return ROLE_ACCESS_TYPE.TRIAL;

      if (role.ValidFrom || role.ValidTo) {
        return ROLE_ACCESS_TYPE.SUBSCRIPTION;
      }

      return ROLE_ACCESS_TYPE.STANDARD;
    }
}
