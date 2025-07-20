import { IAPIApplicationOktaClientResponse } from '../Interfaces';
import { IdNameModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class ApplicationOktaClientModel{
  name: string = '';
  oktaClientId: string = '';

  constructor(data?: Partial<ApplicationOktaClientModel>) {
    Object.assign(this, data);
  }

  static deserialize(application: IAPIApplicationOktaClientResponse): ApplicationOktaClientModel {
    if (!application) {
      return new ApplicationOktaClientModel();
    }
    const data: Partial<ApplicationOktaClientModel> = {
      name: application.Name,
      oktaClientId: application.OktaClientId,
    };
    return new ApplicationOktaClientModel(data);
  }

  static deserializeList(applications: IAPIApplicationOktaClientResponse[]): ApplicationOktaClientModel[] {
    return applications
      ? applications.map((application: IAPIApplicationOktaClientResponse) =>
        ApplicationOktaClientModel.deserialize(application))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.oktaClientId;
  }
}
