import { IdNameModel, Utilities, modelProtection } from '@wings-shared/core';
import { IAPISiteResponse } from '../Interfaces';

@modelProtection
export class SiteModel extends IdNameModel {
  number: string = '';
  location: string = '';
  siteUseId: string = '';
  endDate: null;
  services: string[] = [];

  constructor(data?: Partial<SiteModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(site: IAPISiteResponse): SiteModel {
    if (!site) {
      return new SiteModel();
    }
    const data: Partial<SiteModel> = {
      id: Utilities.getTempId(true),
      number: site.Number,
      location: site.Location,
      siteUseId: site.SiteUseId,
      endDate: site.EndDate,
      services: site.Services,
      name: site.Number,
    };

    return new SiteModel(data);
  }

  public serialize(): IAPISiteResponse {
    return {
      Number: this.number,
      Location: this.location,
      SiteUseId: this.siteUseId,
      EndDate: this.endDate,
      Services: this.services,
    };
  }

  static deserializeList(sites: IAPISiteResponse[]): SiteModel[] {
    return sites ? sites.map((site: IAPISiteResponse) => SiteModel.deserialize(site)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.location;
  }

  public get value(): string | number {
    return this.id;
  }
}
