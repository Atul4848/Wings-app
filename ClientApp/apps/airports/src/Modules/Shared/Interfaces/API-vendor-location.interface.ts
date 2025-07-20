import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIVendorLocation extends IBaseApiResponse {
  code: string ;
  vendorId: number ;
  vendor: IVendor;
  vendorLocationId: number ;
  airportRank: number;
  vendorLocationStatus: IBaseApiResponse;
  operationalEssential: ILocationOperationalEssential;
}

export interface IVendor extends IBaseApiResponse {
  code: string;
}

export interface ILocationOperationalEssential {
  vendorLevel: IBaseApiResponse;
  appliedOperationType: IAppliedOperationalType[];
}
export interface IAppliedOperationalType {
  operationType: IBaseApiResponse;
}

