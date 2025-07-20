import { CoreModel, ISelectOption } from '@wings-shared/core';
import { ICustomerCommunicationAssociatedSites, ICustomerSiteCommunicationAssociations } from '../Interfaces';
import { CustomerSiteCommAssociationModel } from './CustomerSiteCommAssociation.model';

export class CustomerCommunicationAssociatedSitesModel extends CoreModel implements ISelectOption {
  customerAssociatedSite: CustomerSiteCommAssociationModel;
  constructor(data?: Partial<CustomerCommunicationAssociatedSitesModel>) {
    super(data);
    Object.assign(this, data);
  }

  public get label(): string {
    return this.customerAssociatedSite.name;
  }

  public get value(): number {
    return this.customerAssociatedSite.id;
  }

  static deserialize(apiData: ICustomerCommunicationAssociatedSites): CustomerCommunicationAssociatedSitesModel {
    if (!apiData) {
      return new CustomerCommunicationAssociatedSitesModel();
    }
    const data: Partial<CustomerCommunicationAssociatedSitesModel> = {
      ...apiData,
      id: apiData.customerCommunicationAssociatedSiteId || apiData.id,
      customerAssociatedSite: CustomerSiteCommAssociationModel.deserialize(apiData.customerAssociatedSite),
    };
    return new CustomerCommunicationAssociatedSitesModel(data);
  }

  static deserializeList(
    apiDataList: ICustomerCommunicationAssociatedSites[]
  ): CustomerCommunicationAssociatedSitesModel[] {
    return apiDataList
      ? apiDataList.map(apiData => CustomerCommunicationAssociatedSitesModel.deserialize(apiData))
      : [];
  }

  public serialize(): ICustomerSiteCommunicationAssociations {
    return {
      id: this.id,
      siteName: this.customerAssociatedSite?.name,
      siteSequenceNumber: this.customerAssociatedSite?.sequence,
      siteUseId: this.customerAssociatedSite?.siteUseId,
      ...this._serialize(),
    };
  }
}
