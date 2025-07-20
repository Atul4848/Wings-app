import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedSites } from '../Interfaces';
import { SalesRepModel } from './SalesRep.model';

@modelProtection
export class AssociatedSitesModel extends CoreModel implements ISelectOption {
  sequence: string;
  partyId: number;
  startDate: string;
  endDate: string;
  siteUsage: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  country: string;
  county: string;
  postalCode: string;
  gracePeriod: number;
  lateFeePercent: number;
  lateFeeStartDate: string;
  paymentTerms: string;
  poNumber: number;
  poExpirationDate: string;
  poAmount: string;
  demandClass: string;
  location: string;
  salesRep: SalesRepModel;
  multiOrg: boolean;
  primary: boolean;
  siteUseId: number;

  constructor(data?: Partial<AssociatedSitesModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return String(this.id) || this.name;
  }

  public get value(): number {
    return this.id;
  }

  static deserialize(apiData: IAPIAssociatedSites): AssociatedSitesModel {
    if (!apiData) {
      return new AssociatedSitesModel();
    }
    const data: Partial<AssociatedSitesModel> = {
      ...apiData,
      name: apiData.siteName || apiData.name,
      id: apiData.siteId || apiData.id,
      salesRep: SalesRepModel.deserialize(apiData.salesRep),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AssociatedSitesModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedSites[]): AssociatedSitesModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedSitesModel.deserialize(apiData)) : [];
  }
}
