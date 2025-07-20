import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAssociatedSiteRef extends IBaseApiResponse {
  associatedSiteId: string;
  siteSequenceNumber: string;
  associatedSiteName: string;
  siteUseId: number;
}
