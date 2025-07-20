import { IAPIFilterDictionary } from '@wings-shared/core';
import { baseGridFiltersDictionary, BULLETIN_FILTERS } from '@wings/shared';

export const gridFilters: IAPIFilterDictionary<BULLETIN_FILTERS>[] = [
  ...baseGridFiltersDictionary<BULLETIN_FILTERS>(),
  {
    columnId: 'bulletinLevel',
    apiPropertyName: 'BulletinLevel.Name',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_LEVEL,
  },
  {
    columnId: 'bulletinEntity',
    apiPropertyName: 'BulletinEntity.Name',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_ENTITY,
  },
  {
    columnId: 'vendorLocationAirport',
    apiPropertyName: 'VendorLocationAirport.AirportName',
    uiFilterType: BULLETIN_FILTERS.VENDOR_LOCATION_AIRPORT,
  },
  {
    columnId: 'bulletinSource',
    apiPropertyName: 'BulletinSource.Name',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_SOURCE,
  },
  {
    columnId: 'bulletinPriority',
    apiPropertyName: 'BulletinPriority.Name',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_PRIORITY,
  },
  {
    columnId: 'appliedBulletinTypes',
    apiPropertyName: 'AppliedBulletinTypes.BulletinType.Name',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_TYPE,
  },
  {
    columnId: 'bulletinCAPPSCategory',
    apiPropertyName: 'BulletinCAPPSCategory.Code',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_CAPPS_CATEGORY_CODE,
  },
  {
    columnId: 'uaOffice',
    apiPropertyName: 'UAOffice.Name',
    uiFilterType: BULLETIN_FILTERS.UA_OFFICE,
  },
  {
    columnId: 'notamNumber',
    apiPropertyName: 'NotamNumber',
    uiFilterType: BULLETIN_FILTERS.NOTAM_ID,
  },
  {
    columnId: 'startDate',
    apiPropertyName: 'StartDate',
  },
  {
    columnId: 'endDate',
    apiPropertyName: 'EndDate',
  },
  {
    columnId: 'bulletinText',
    apiPropertyName: 'BulletinText',
  },
  {
    columnId: 'internalNotes',
    apiPropertyName: 'InternalNotes',
  },
  {
    columnId: 'sourceNotes',
    apiPropertyName: 'SourceNotes',
  },
  {
    columnId: 'isUFN',
    apiPropertyName: 'IsUFN',
  },
];

export const purgedBulletinsFilters: IAPIFilterDictionary<BULLETIN_FILTERS>[] = [
  {
    columnId: 'bulletinLevel',
    apiPropertyName: 'bulletinLevelName',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_LEVEL,
  },
  {
    columnId: 'bulletinEntity',
    apiPropertyName: 'bulletinEntityName',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_ENTITY,
  },
  {
    columnId: 'bulletinSource',
    apiPropertyName: 'bulletinSourceName',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_SOURCE,
  },
  {
    columnId: 'bulletinPriority',
    apiPropertyName: 'bulletinPriorityName',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_PRIORITY,
  },
  {
    columnId: 'appliedBulletinTypes',
    apiPropertyName: 'bulletinTypeName',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_TYPE,
  },
  {
    columnId: 'bulletinCAPPSCategory',
    apiPropertyName: 'bulletinCAPPSCategoryCode',
    uiFilterType: BULLETIN_FILTERS.BULLETIN_CAPPS_CATEGORY_CODE,
  },
  {
    columnId: 'uaOffice',
    apiPropertyName: 'uaOfficeName',
    uiFilterType: BULLETIN_FILTERS.UA_OFFICE,
  },
];
