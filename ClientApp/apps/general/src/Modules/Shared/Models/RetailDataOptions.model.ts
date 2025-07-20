import { IAPIRetailDataOptionsResponse } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';
@modelProtection
export class RetailDataOptions {
  airport1Active: boolean = false;
  airport2Active: boolean = false;
  airport3Active: boolean = false;
  airport4Active: boolean = false;
  airportFlightpakActive: boolean = false;
  runway1Active: boolean = false;
  runway2Active: boolean = false;
  runway3Active: boolean = false;
  runway4Active: boolean = false;
  fboActive: boolean = false;
  fboServicesActive: boolean = false;
  hotelActive: boolean = false;
  attendenceActive: boolean = false;
  remarksActive: boolean = false;
  cateringActive: boolean = false;
  transportationActive: boolean = false;
  securityActive: boolean = false;
  airport1Inactive: boolean = false;
  airport2Inactive: boolean = false;
  airport3Inactive: boolean = false;
  airport4Inactive: boolean = false;
  airportFlightpakInactive: boolean = false;
  runway1Inactive: boolean = false;
  runway2Inactive: boolean = false;
  runway3Inactive: boolean = false;
  runway4Inactive: boolean = false;
  fboInactive: boolean = false;
  fboServicesInactive: boolean = false;
  hotelInactive: boolean = false;
  attendenceInactive: boolean = false;
  remarksInactive: boolean = false;
  cateringInactive: boolean = false;
  transportationInactive: boolean = false;
  securityInactive: boolean = false;

  constructor(data?: Partial<RetailDataOptions>) {
    Object.assign(this, data);
  }

  static deserialize(retailDataOption: IAPIRetailDataOptionsResponse): RetailDataOptions {
    if (!retailDataOption) {
      return new RetailDataOptions();
    }

    const data: Partial<RetailDataOptions> = {
      airport1Active: retailDataOption.Airport1Active,
      airport2Active: retailDataOption.Airport2Active,
      airport3Active: retailDataOption.Airport3Active,
      airport4Active: retailDataOption.Airport4Active,
      airportFlightpakActive: retailDataOption.AirportFlightpakActive,
      runway1Active: retailDataOption.Runway1Active,
      runway2Active: retailDataOption.Runway2Active,
      runway3Active: retailDataOption.Runway3Active,
      runway4Active: retailDataOption.Runway4Active,
      fboActive: retailDataOption.FboActive,
      fboServicesActive: retailDataOption.FboServicesActive,
      hotelActive: retailDataOption.HotelActive,
      attendenceActive: retailDataOption.AttendenceActive,
      remarksActive: retailDataOption.RemarksActive,
      cateringActive: retailDataOption.CateringActive,
      transportationActive: retailDataOption.TransportationActive,
      securityActive: retailDataOption.SecurityActive,
      airport1Inactive: retailDataOption.Airport1Inactive,
      airport2Inactive: retailDataOption.Airport2Inactive,
      airport3Inactive: retailDataOption.Airport3Inactive,
      airport4Inactive: retailDataOption.Airport4Inactive,
      airportFlightpakInactive: retailDataOption.AirportFlightpakInactive,
      runway1Inactive: retailDataOption.Runway1Inactive,
      runway2Inactive: retailDataOption.Runway2Inactive,
      runway3Inactive: retailDataOption.Runway3Inactive,
      runway4Inactive: retailDataOption.Runway4Inactive,
      fboInactive: retailDataOption.FboInactive,
      fboServicesInactive: retailDataOption.FboServicesInactive,
      hotelInactive: retailDataOption.HotelInactive,
      attendenceInactive: retailDataOption.AttendenceInactive,
      remarksInactive: retailDataOption.RemarksInactive,
      cateringInactive: retailDataOption.CateringInactive,
      transportationInactive: retailDataOption.TransportationInactive,
      securityInactive: retailDataOption.SecurityInactive,
    };

    return new RetailDataOptions(data);
  }
}