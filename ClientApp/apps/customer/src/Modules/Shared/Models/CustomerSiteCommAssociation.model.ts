import { CoreModel } from '@wings-shared/core';
import { ICustomerAssociatedSite } from '../Interfaces/API-CustomerContact.interface';
import { ICustomerSiteCommunicationAssociations } from '../Interfaces/ICustomerCommRequest.interface';

export class CustomerSiteCommAssociationModel extends CoreModel  {
  sequence: string;
  siteUseId: number;

  constructor(data?: Partial<CustomerSiteCommAssociationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: ICustomerAssociatedSite): CustomerSiteCommAssociationModel {
    if (!apiData) {
      return new CustomerSiteCommAssociationModel();
    }
    const data: Partial<CustomerSiteCommAssociationModel> = {
      ...apiData,
      id: apiData.siteUseId || apiData.customerAssociatedSiteId || apiData.id,
      name: apiData.siteName,
      sequence: apiData.siteSequenceNumber,
    };
    return new CustomerSiteCommAssociationModel(data);
  }

  static deserializeList(apiDataList: ICustomerAssociatedSite[]): CustomerSiteCommAssociationModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerSiteCommAssociationModel.deserialize(apiData)) : [];
  }

  public serialize(): ICustomerSiteCommunicationAssociations {
    return {
      id: this.id,
      siteName: this.name,
      siteSequenceNumber: this.sequence,
      siteUseId: this.siteUseId,
      ...this._serialize(),
    };
  }
}
