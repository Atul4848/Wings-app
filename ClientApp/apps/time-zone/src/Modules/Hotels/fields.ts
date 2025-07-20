import { baseGridFiltersDictionary } from '@wings/shared';
import { IAPIFilterDictionary } from '@wings-shared/core';
import { HOTEL_FILTERS } from '../Shared';

export const gridFilters: IAPIFilterDictionary<HOTEL_FILTERS>[] = [
  ...baseGridFiltersDictionary<HOTEL_FILTERS>(),
  {
    columnId: 'hotelName',
    apiPropertyName: 'Name',
    uiFilterType: HOTEL_FILTERS.NAME,
  },
  {
    columnId: 'hotelSource',
    apiPropertyName: 'HotelSource',
    uiFilterType: HOTEL_FILTERS.EXTERNAL_SOURCE,
  },
  {
    columnId: 'localPhoneNumber',
    apiPropertyName: 'LocalPhoneNumber',
    uiFilterType: HOTEL_FILTERS.LOCAL_PHONE_NUMBER,
  },
  {
    columnId: 'faxNumber',
    apiPropertyName: 'FaxNumber',
    uiFilterType: HOTEL_FILTERS.FAX_NUMBER,
  },
  {
    columnId: 'reservationEmail',
    apiPropertyName: 'ReservationEmail',
    uiFilterType: HOTEL_FILTERS.RESERVATION_EMAIL,
  },
  {
    columnId: 'frontDeskEmail',
    apiPropertyName: 'FrontDeskEmail',
    uiFilterType: HOTEL_FILTERS.FRONT_DESK_EMAIL,
  },
  {
    columnId: 'website',
    apiPropertyName: 'Website',
    uiFilterType: HOTEL_FILTERS.WEBSITE,
  },
];
