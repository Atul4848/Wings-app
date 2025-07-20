import { BaseCityModel, CountryModel, StateModel } from '@wings/shared';
import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIAirportAddress } from '../Interfaces';

@modelProtection
export class AirportAddressModel extends CoreModel {
  addressLine1: string = '';
  addressLine2: string = '';
  city: BaseCityModel;
  state: StateModel;
  country: CountryModel;
  zipCode: string = '';
  email: string = '';
  phone: string = '';

  constructor(data?: Partial<AirportAddressModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportAddress): AirportAddressModel {
    if (!apiData) {
      return new AirportAddressModel();
    }
    const data: Partial<AirportAddressModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.addressId || apiData.id,
      city: BaseCityModel.deserialize({
        ...apiData.city,
        commonName: apiData.city?.name,
        cappsCode: apiData.city?.code || apiData.city?.cappsCode,
      }),
      state: StateModel.deserialize({ ...apiData.state, isoCode: apiData.state?.code }),
      country: CountryModel.deserialize(apiData.country),
    };
    return new AirportAddressModel(data);
  }

  public serialize(): IAPIAirportAddress {
    return {
      id: this.id || 0,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      countryId: this.country?.id || null,
      countryCode: this.country?.isO2Code || null,
      countryName: this.country?.commonName || null,
      stateId: this.state?.id || null,
      stateCode: this.state?.isoCode || null,
      stateName: this.state?.commonName || null,
      cityId: this.city?.id || null,
      cityCode: this.city?.cappsCode || null,
      cityName: this.city?.commonName || null,
      cityCAPPSName: this.city?.cappsName || null,
      zipCode: this.zipCode || null,
      email: this.email || null,
      phone: this.phone || null,
    };
  }

  static deserializeList(apiData: IAPIAirportAddress[]): AirportAddressModel[] {
    return apiData ? apiData.map((data: IAPIAirportAddress) => AirportAddressModel.deserialize(data)) : [];
  }
}
