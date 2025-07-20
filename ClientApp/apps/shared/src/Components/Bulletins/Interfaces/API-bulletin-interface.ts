import { IBaseApiResponse, ISelectOption } from '@wings-shared/core';

export interface IAPIBulletin extends IAPIBulletinRequest {
  bulletinId?: number;
  uaOffice?: IAPIUaOffice;
  bulletinLevel?: IAPIBulletinLevel;
  bulletinSource?: IAPIBulletinSource;
  bulletinEntity?: IAPIBulletinEntity;
  appliedBulletinTypes?: IAPIBulletinType[];
  bulletinPriority?: IAPIBulletinPriority;
  bulletinCAPPSCategory?: IAPIBulletinCAPPSCategory;
  vendorLocationAirport?: IAPIVendorLocationAirport;
}

export interface IAPIBulletinRequest extends IBaseApiResponse {
  startDate: string;
  endDate: string;
  bulletinText: string;
  internalNotes: string;
  sourceNotes: string;
  dmNotes: string;
  vendorName: string;
  notamNumber: string;
  bulletinCAPPSCategoryId: number;
  isUFN: boolean;
  runTripChecker: boolean;
  bulletinLevelId: number;
  bulletinEntityId: number;
  bulletinEntityName: string;
  bulletinEntityCode: string;
  uaOfficeId: number;
  uaOfficeName: string;
  bulletinSourceId: number;
  bulletinTypeIds: number[];
  bulletinPriorityId: number;
  syncToCAPPS: boolean;
  vendorLocationAirportId: number;
}

interface IAPIUaOffice extends IBaseApiResponse {
  uaOfficeId: number;
}

interface IAPIBulletinLevel extends IBaseApiResponse {
  bulletinLevelId: number;
}

interface IAPIBulletinSource extends IBaseApiResponse {
  bulletinSourceId: number;
}

interface IAPIBulletinEntity extends IBaseApiResponse {
  bulletinEntityId: number;
}

interface IAPIBulletinType extends IBaseApiResponse {
  bulletinType: { bulletinTypeId: number; bulletinTypeName: string };
}
interface IAPIBulletinPriority extends IBaseApiResponse {
  bulletinPriorityId: number;
}
interface IAPIBulletinCAPPSCategory extends IBaseApiResponse {
  bulletinCAPPSCategoryId: number;
}

interface IAPIVendorLocationAirport extends IBaseApiResponse {
  airportId: number;
  airportName: string;
  displayCode: string;
}
// View Mode only Do not remove
export interface IAPILocationAirport extends IAPIVendorLocationAirport, ISelectOption {}
