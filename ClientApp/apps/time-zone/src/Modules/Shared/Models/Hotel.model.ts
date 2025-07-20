import { CoreModel, EntityMapModel, modelProtection } from '@wings-shared/core';
import { IAPIHotel, IAPIHotelRequest } from './../Interfaces';
import { HotelAirportModel } from './HotelAirport.model';

@modelProtection
export class HotelModel extends CoreModel {
  externalId: string = '';
  hotelSource: string = '';
  addressLine1: string = '';
  addressLine2: string = '';
  city: EntityMapModel;
  zipCode: string = '';
  state: EntityMapModel;
  country: EntityMapModel;
  localPhoneNumber: string = '';
  faxNumber: string = '';
  reservationEmail: string = '';
  frontDeskEmail: string = '';
  website: string = '';
  airports: HotelAirportModel[] = [];
  longitude: number;
  latitude: number;

  constructor(data?: Partial<HotelModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIHotel): HotelModel {
    if (!apiData) {
      return new HotelModel();
    }
    const data: Partial<HotelModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.hotelId || apiData.id,
      externalId: apiData.externalId,
      hotelSource: apiData.hotelSource,
      name: apiData.name,
      addressLine1: apiData.addressLine1,
      addressLine2: apiData.addressLine2,
      zipCode: apiData.zipCode,
      localPhoneNumber: apiData.localPhoneNumber,
      faxNumber: apiData.faxNumber,
      reservationEmail: apiData.reservationEmail,
      frontDeskEmail: apiData.frontDeskEmail,
      website: apiData.website,
      longitude: apiData.longitude,
      latitude: apiData.latitude,
      city: apiData.city ? new EntityMapModel({
        entityId: apiData.city.cityId,
        name: apiData.city.name,
        code: apiData.city.code,
      }) : null,
      state:  apiData.state ? new EntityMapModel({
        entityId: apiData.state.stateId,
        name: apiData.state.name,
        code: apiData.state.code,
      }) : null,
      country: apiData.country ? new EntityMapModel({
        entityId: apiData.country.countryId,
        name: apiData.country.name,
        code: apiData.country.code,
      }) : null,
      airports: HotelAirportModel.deserializeList(apiData.airports),
    };
    return new HotelModel(data);
  }

  static deserializeList(apiDataList: IAPIHotel[]): HotelModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIHotel) => HotelModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPIHotelRequest {
    return {
      id: this.id,
      externalId: this.externalId,
      hotelSource: this.hotelSource,
      name: this.name,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      zipCode: this.zipCode || null,
      localPhoneNumber: this.localPhoneNumber,
      faxNumber: this.faxNumber,
      reservationEmail: this.reservationEmail,
      frontDeskEmail: this.frontDeskEmail,
      website: this.website,
      cityId: this.city?.entityId,
      cityName: this.city?.name,
      cityCode: this.city?.code,
      countryId: this.country?.entityId || null,
      countryName: this.country?.name,
      countryCode: this.country?.code,
      stateId: this.state?.entityId,
      stateName: this.state?.name,
      stateCode: this.state?.code,
      longitude: Number(this.longitude) || null,
      latitude: Number(this.latitude) || null,
      airports: this.airports?.map(x => ({
        id: x.id || 0,
        airportId: x.airport.entityId,
        hotelId: this.id || 0,
        distance: Number(x.distance) || null,
      })),
      ...this._serialize(),
    };
  }
}
