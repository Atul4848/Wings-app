import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAssociatedSiteRef } from '@wings/shared';

export interface IAPIAssociatedRegistrySite extends IBaseApiResponse {
  associatedRegistrySiteId: number;
  tssView: boolean;
  startDate: string;
  endDate: string;
  site: IAPIAssociatedSiteRef;
}
