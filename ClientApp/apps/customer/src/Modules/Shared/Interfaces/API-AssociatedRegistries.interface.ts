import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRegistry } from './API-registry.interface';
import { IAPITeam } from './API-Team.interface';
import { IAPIAssociatedOffice } from './API-AssociatedOffice.interface';
import { IAPICustomerRef } from '@wings/shared';

export interface IAPIAssociatedRegistries extends IBaseApiResponse {
  associatedRegistryId?: number;
  startDate: string;
  endDate: string;
  registry: IAPIRegistry;
  team: IAPITeam;
  associatedOffice: IAPIAssociatedOffice;
  associatedRegistryServiceTypes: IAPIAssociatedRegistryServiceTypes[];
  associatedRegistrySites: IAPIAssociatedRegistrySites[];
  customer: IAPICustomerRef;
}

export interface IAPIAssociatedRegistryServiceTypes {
  associatedRegistryServiceTypeId: number;
  serviceType: IAPIServiceType;
}

export interface IAPIServiceType {
  id: number;
  serviceTypeId: number;
  name: string;
  code: string;
}

export interface IAPIAssociatedRegistrySites {
  associatedRegistrySiteId: number;
  site: IAPISite;
}

export interface IAPISite {
  associatedSiteId: string | number;
  associatedSiteName: string;
}
