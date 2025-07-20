import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedRegistrySite, IAssociatedRegistrySiteRequest } from '../Interfaces';
import { AssociatedSiteRefModel } from '@wings/shared';

@modelProtection
export class AssociatedRegistrySiteModel extends CoreModel {
  tssView: boolean;
  startDate: string = '';
  endDate: string = '';
  site: AssociatedSiteRefModel;

  constructor(data?: Partial<AssociatedRegistrySiteModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAssociatedRegistrySite): AssociatedRegistrySiteModel {
    if (!apiData) {
      return new AssociatedRegistrySiteModel();
    }
    const data: Partial<AssociatedRegistrySiteModel> = {
      ...apiData,
      id: apiData.associatedRegistrySiteId || apiData.id,
      site: AssociatedSiteRefModel.deserialize(apiData.site),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new AssociatedRegistrySiteModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedRegistrySite[]): AssociatedRegistrySiteModel[] {
    return apiDataList ? apiDataList.map(apiData => AssociatedRegistrySiteModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(customerNumber: string, customerAssociatedRegistryId: number): IAssociatedRegistrySiteRequest {
    return {
      id: this.id || 0,
      customerNumber,
      customerAssociatedRegistryId,
      siteUseId: this.site.siteUseId,
      associatedSiteId: this.site.id as any,
      associatedSiteSequenceNumber: this.site.sequence,
      associatedSiteName: this.site.name,
      tssView: this.tssView,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
    };
  }
}
