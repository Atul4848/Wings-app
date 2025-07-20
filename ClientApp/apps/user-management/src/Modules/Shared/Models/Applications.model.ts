import { IAPIApplicationsResponse } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class ApplicationsModel extends IdNameModel<string> {
  oktaClientId: string[] = [];

  constructor(data?: Partial<ApplicationsModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(application: IAPIApplicationsResponse): ApplicationsModel {
    if (!application) {
      return new ApplicationsModel();
    }
    const data: Partial<ApplicationsModel> = {
      id: application.Id,
      name: application.Name,
      oktaClientId: application.OktaClientIds,
    };
    return new ApplicationsModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIApplicationsResponse {
    return {
      Id: this.id,
      Name: this.name,
      OktaClientIds: this.oktaClientId,
    };
  }

  static deserializeList(applications: IAPIApplicationsResponse[]): ApplicationsModel[] {
    return applications
      ? applications.map((application: IAPIApplicationsResponse) => ApplicationsModel.deserialize(application))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
