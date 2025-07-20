import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIAirportCustomGeneral } from './API-airport-custom-general-info.interface';
import { IAPIIntlCustomsDetails } from './API-intl-customs-details.interface';
import { IAPIUsCustomsDetailsResponse } from './API-us-customs-details.interface';
import { IAPIAirportCustomsDetailInfo } from './API-airport-customs-detail-info.interface';

export interface IAPIAirportCustom extends IBaseApiResponse {
  generalInformation: IAPIAirportCustomGeneral;
  internationalCustomsInformation: IAPIIntlCustomsDetails;
  usCustomsInformation: IAPIUsCustomsDetailsResponse;
  customsDetail?: IAPIAirportCustomsDetailInfo; 
}
