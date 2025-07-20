import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIAssociatedSiteRef } from '../Interfaces';

@modelProtection
export class AssociatedSiteRefModel extends CoreModel implements ISelectOption {
  sequence: string;
  siteUseId: number;
  location: string;

  constructor(data?: Partial<AssociatedSiteRefModel>) {
    super();
    Object.assign(this, data);
  }

  public get label(): string {
    return String(this.id) || this.name;
  }

  public get value(): number {
    return this.id;
  }

  static deserialize(apiData: IAPIAssociatedSiteRef): AssociatedSiteRefModel {
    if (!apiData) {
      return new AssociatedSiteRefModel();
    }

    const data: Partial<AssociatedSiteRefModel> = {
      id: (apiData.associatedSiteId as any) || apiData.id,
      name: apiData.associatedSiteName || apiData.name,
      sequence: apiData.siteSequenceNumber,
      siteUseId: apiData.siteUseId,
    };

    return new AssociatedSiteRefModel(data);
  }

  static deserializeList(apiDataList: IAPIAssociatedSiteRef[]): AssociatedSiteRefModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAssociatedSiteRef) => AssociatedSiteRefModel.deserialize(apiData))
      : [];
  }
}
