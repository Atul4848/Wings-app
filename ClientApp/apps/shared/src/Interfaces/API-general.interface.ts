import { IBaseApiResponse } from '@wings-shared/core';
import { IAPICountry } from './API-country.interface';

export interface IAPIGeneral extends IBaseApiResponse {
  isMedicalInsuranceRecommended: boolean;
  charterMaxLiquidInML: number;
  domesticCountries: Partial<IAPICountry>[];
  navigators: IAPINavigators[];
  fullAviationSecurityCheckRqrdOnDepartures: IAPIFullAviationSecurityCheckRqrdOnDepartures[];
  businessDays?: IAPIBusinessDay[];
}

export interface IAPINavigators {
  appliedNavigatorId: number;
  navigator: IAPINavigator;
}
export interface IAPINavigator {
  navigatorId: 0;
  name: string;
}
export interface IAPIFullAviationSecurityCheckRqrdOnDepartures {
  fullAviationSecurityCheckRqrdOnDepartureId: number;
  flightOperationalCategoryId: number;
  name: string;
}
export interface IAPIGeneralRequest extends IBaseApiResponse {
  countryId?: number;
  isMedicalInsuranceRecommended: boolean;
  charterMaxLiquidInML: number;
  domesticCountries?: number[];
  navigators: IAPINavigatorRequest[];
  fullAviationSecurityCheckRqrdOnDepartures: IAPIFullAviationSecurityCheckRqrdOnDeparturesrRequest[];
  businessDays?: number[];
}
export interface IAPINavigatorRequest {
  id: number;
  navigatorId: number;
}

export interface IAPIFullAviationSecurityCheckRqrdOnDeparturesrRequest {
  id: number;
  flightOperationalCategoryId: number;
  name: string;
}
export interface IAPIBusinessDay {
  dayOfWeekId: number;
  name: string;
}
