import { IAPIFilterDictionary } from '@wings-shared/core';
import { LOCATION_ONBOARDING_APPROVAL_FILTERS } from '../Shared/Enums/LocationOnBoardingApprovals.enum';

export const gridFilters: IAPIFilterDictionary<LOCATION_ONBOARDING_APPROVAL_FILTERS>[] = [
  {
    columnId: 'vendor.name',
    apiPropertyName: 'VendorName',
    uiFilterType: LOCATION_ONBOARDING_APPROVAL_FILTERS.VENDOR_NAME,
  },
  {
    columnId: 'vendor.code',
    apiPropertyName: 'VendorCode',
    uiFilterType: LOCATION_ONBOARDING_APPROVAL_FILTERS.VENDOR_CODE,
  },
  {
    columnId: 'locationname',
    apiPropertyName: 'LocationName',
    uiFilterType: LOCATION_ONBOARDING_APPROVAL_FILTERS.LOCATION_NAME,
  },
  {
    columnId: 'airportReference.label',
    apiPropertyName: 'AirportName',
    uiFilterType: LOCATION_ONBOARDING_APPROVAL_FILTERS.AIRPORT_NAME,
  }
];



