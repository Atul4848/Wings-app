import { IBaseApiResponse } from '@wings-shared/core';

export interface IAssociatedRegistrySiteRequest extends IBaseApiResponse {
  id: number;
  siteUseId: number;
  customerNumber: string;
  customerAssociatedRegistryId: number;
  associatedSiteId: string;
  associatedSiteSequenceNumber: string;
  associatedSiteName: string;
  tssView: boolean;
  startDate: string | null;
  endDate: string | null;
}
