import { modelProtection, Utilities, DATE_FORMAT, CoreModel, ISelectOption } from '@wings-shared/core';
import { IAPIATSAirport } from '../Interfaces';
import moment from 'moment';

@modelProtection
export class ATSAirportModel extends CoreModel implements ISelectOption {
  officialICAOCode: string = '';
  faaCode: string = '';
  uwaAirportCode: string = '';
  iata: string = '';
  billingIATA: string = '';
  airportName: string = '';
  longitudeDegrees: number = null;
  latitudeDegrees: number = null;
  airportUsageTypeId: number = null;
  airportLandingTypeId: number = null;
  airportFrequencyId: number = null;
  statusId: number = null;
  statusName: string = '';
  cityCode?: string = '';
  countryCode?: string = '';
  icao: string = '';
  stateCode?: string = '';
  error?: string = '';
  // DST
  utcToDaylightSavingsConversion: string = '';
  utcToDSTMessage: string = '';
  // STD
  utcToStandardTimeConversion: string = '';
  utcToSDTMessage: string = '';
  inactive: boolean = false;

  constructor(data?: Partial<ATSAirportModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiAirport: IAPIATSAirport): ATSAirportModel {
    if (!apiAirport) {
      return new ATSAirportModel();
    }
    const data: Partial<ATSAirportModel> = {
      id: apiAirport.airportId || apiAirport.id || Utilities.getTempId(true),
      officialICAOCode: apiAirport.officialICAOCode,
      faaCode: apiAirport.faaCode,
      uwaAirportCode: apiAirport.uwaAirportCode,
      iata: apiAirport.iata,
      billingIATA: apiAirport.billingIATA,
      airportName: apiAirport.airportName,
      longitudeDegrees: apiAirport.longitudeDegrees,
      latitudeDegrees: apiAirport.latitudeDegrees,
      airportUsageTypeId: apiAirport.airportUsageTypeId,
      airportLandingTypeId: apiAirport.airportLandingTypeId,
      airportFrequencyId: apiAirport.airportFrequencyId,
      statusId: apiAirport.statusId,
      statusName: apiAirport.statusName,
      createdOn: apiAirport.createdOn,
      modifiedOn: apiAirport.modifiedOn,
      cityCode: apiAirport.cityCode,
      countryCode: apiAirport.countryCode,
      icao: apiAirport.icao,
      stateCode: apiAirport.stateCode,
      error: apiAirport.error,
      utcToStandardTimeConversion: apiAirport.utcToStandardTimeConversion,
      utcToDaylightSavingsConversion: apiAirport.utcToDaylightSavingsConversion,
      utcToSDTMessage: this.sdtDstMessage(apiAirport.utcStandardTimeStart, apiAirport.utcStandardTimeEnd),
      utcToDSTMessage: this.sdtDstMessage(apiAirport.utcDayLightSavingsStart, apiAirport.utcDayLightSavingsEnd),
      inactive: apiAirport.inactive,
    };
    return new ATSAirportModel(data);
  }

  static deserializeList(apiPersonList: IAPIATSAirport[]): ATSAirportModel[] {
    return apiPersonList
      ? apiPersonList.map((apiPerson: IAPIATSAirport) => ATSAirportModel.deserialize(apiPerson))
      : [];
  }

  public get label(): string {
    return this.icao;
  }

  public get value(): string | number {
    return this.id || this.icao;
  }

  private static sdtDstMessage(startDateTime: string, endDateTime: string): string {
    if (!startDateTime || !endDateTime) {
      return '';
    }
    const _startDateTime = moment(startDateTime, DATE_FORMAT.API_FORMAT);
    const _endDateTime = moment(endDateTime, DATE_FORMAT.API_FORMAT);
    if (_startDateTime.isValid() && _endDateTime.isValid()) {
      const startDate: string = _startDateTime.format(DATE_FORMAT.DATE_PICKER_FORMAT).toUpperCase();
      const startTime: string = _startDateTime.format(DATE_FORMAT.SDT_DST_TIME_FORMAT);
      // end date time
      const endDate: string = _endDateTime.format(DATE_FORMAT.DATE_PICKER_FORMAT).toUpperCase();
      const endTime: string = _endDateTime.format(DATE_FORMAT.SDT_DST_TIME_FORMAT);
      return `<strong>${startDate}</strong> ${startTime} <strong>${endDate}</strong> ${endTime}`;
    }
    return '';
  }
}
