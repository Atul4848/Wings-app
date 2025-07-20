import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPICustomerAssociatedSite } from '../Interfaces';

@modelProtection
export class CustomerAssociatedSiteModel extends CoreModel {
  customerAssociatedSiteId: number;
  startDate: string;
  endDate: string;
  siteName: string;
  siteSequenceNumber: string;
  siteUseId: number;
  constructor(data?: Partial<CustomerAssociatedSiteModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerAssociatedSite): CustomerAssociatedSiteModel {
    if (!apiData) {
      return new CustomerAssociatedSiteModel();
    }
    const data: Partial<CustomerAssociatedSiteModel> = {
      ...apiData,
    };
    return new CustomerAssociatedSiteModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerAssociatedSite[]): CustomerAssociatedSiteModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerAssociatedSiteModel.deserialize(apiData)) : [];
  }
}
