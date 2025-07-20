import { IAPIServicesResponse } from '../Interfaces';
import { RolesModel } from './Roles.model';
import { IdNameModel, modelProtection } from '@wings-shared/core';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';

const env = new EnvironmentVarsStore();

@modelProtection
export class ServicesModel extends IdNameModel<string> {
  displayName: string = '';
  description: string = '';
  applicationName: string = '';
  applicationId: string = '';
  enabled: boolean = true;
  roles: RolesModel[] = [];

  constructor(data?: Partial<ServicesModel>) {
    super();
    Object.assign(this, data);
    this.roles = data?.roles?.map(x => new RolesModel(x)) || [];
    this.setIsUVgoToRoles();
  }

  static deserialize(service: IAPIServicesResponse): ServicesModel {
    if (!service) {
      return new ServicesModel();
    }
    const data: Partial<ServicesModel> = {
      id: service.Id,
      name: service.Name,
      description: service.Description,
      displayName: service.DisplayName,
      applicationName: service.ApplicationName,
      applicationId: service.ApplicationId,
      enabled: service.Enabled,
      roles: RolesModel.deserializeList(service.Roles),
    };
    return new ServicesModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIServicesResponse {
    return {
      Id: this.id,
      Name: this.name,
      DisplayName: this.displayName,
      Description: this.description,
      ApplicationName: this.applicationName,
      ApplicationId: this.applicationId,
      Enabled: this.enabled,
      Roles: this.roles?.map((roles: RolesModel) => roles.serialize()) || [],
    };
  }

  static deserializeList(services: IAPIServicesResponse[]): ServicesModel[] {
    return services ? services.map((service: IAPIServicesResponse) => ServicesModel.deserialize(service)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }

  public get isUVGOAppService(): boolean {
    return this.applicationId === env.getVar(ENVIRONMENT_VARS.UVGO_APPLICATION_ID);
  }

  private setIsUVgoToRoles(): void {
    this.roles.forEach(role => role.isUvgoAppRole = this.isUVGOAppService);
  }
}
