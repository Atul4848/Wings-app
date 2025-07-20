import { CityModel, CountryModel, IslandModel, StateModel } from '@wings/shared';
import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIAirportLocation, IAPIAirportLocationRequest } from '../Interfaces';
import { UOMValueModel } from '../Models';

@modelProtection
export class AirportLocationModel extends CoreModel {
  id: number = 0;
  airportId: number = 0;
  magneticVariation: string = '';
  city: CityModel;
  closestCity: CityModel;
  state: StateModel;
  country: CountryModel;
  island: IslandModel;
  // Elevation
  elevation: UOMValueModel;
  elevationUOM: SettingsTypeModel;
  // distance
  distanceToDowntown: UOMValueModel;
  airportDirection: SettingsTypeModel;
  distanceUOM: SettingsTypeModel;

  constructor(data?: Partial<AirportLocationModel>) {
    super(data);
    Object.assign(this, data);
    this.city = data?.city ? new CityModel(data?.city) : null;
    this.closestCity = data?.closestCity ? new CityModel(data?.closestCity) : null;
    this.state = data?.state ? new StateModel(data?.state) : null;
    this.country = data?.country ? new CountryModel(data?.country) : null;
    this.island = data?.island ? new IslandModel(data?.island) : null;
    this.elevation = data?.elevation ? new UOMValueModel(data?.elevation) : null;
    this.elevationUOM = data?.elevationUOM ? new SettingsTypeModel(data?.elevationUOM) : null;
    this.distanceToDowntown = data?.distanceToDowntown ? new UOMValueModel(data?.distanceToDowntown) : null;
    this.airportDirection = data?.airportDirection ? new SettingsTypeModel(data?.airportDirection) : null;
    this.distanceUOM = data?.distanceUOM ? new SettingsTypeModel(data?.distanceUOM) : null;
  }

  static deserialize(apiData: IAPIAirportLocation): AirportLocationModel {
    if (!apiData) {
      return new AirportLocationModel();
    }
    const data: Partial<AirportLocationModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportLocationId || apiData.id,
      airportId: apiData.airportId,
      magneticVariation: apiData.magneticVariation,
      city: apiData.city
        ? CityModel.deserialize({
          ...apiData.city,
          commonName: apiData.city?.name,
          state: apiData.state,
        })
        : null,
      closestCity: apiData.closestCity
        ? CityModel.deserialize({
          ...apiData.closestCity,
          commonName: apiData.closestCity?.name,
          state: apiData.state,
        })
        : null,
      state: StateModel.deserialize(apiData.state),
      country: CountryModel.deserialize(apiData.country),
      island: IslandModel.deserialize(apiData.island),
      // Elevation
      elevation: UOMValueModel.deserialize({
        ...apiData.elevation,
        id: apiData.elevation?.elevationId || apiData.elevation?.id,
      }),
      elevationUOM: new SettingsTypeModel({
        ...apiData.elevation?.elevationUOM,
        id: apiData.elevation?.elevationUOM?.distanceUOMId || apiData.elevation?.elevationUOM?.id,
      }),
      // distanceToDowntown
      distanceToDowntown: UOMValueModel.deserialize({
        ...apiData.distanceToDowntown,
        id: apiData.distanceToDowntown?.distanceToDowntownId || apiData.distanceToDowntown?.id,
      }),
      airportDirection: new SettingsTypeModel({
        ...apiData.distanceToDowntown?.airportDirection,
        id:
          apiData.distanceToDowntown?.airportDirection?.airportDirectionId ||
          apiData.distanceToDowntown?.airportDirection?.id,
      }),
      distanceUOM: new SettingsTypeModel({
        ...apiData.distanceToDowntown?.distanceUOM,
        id: apiData.distanceToDowntown?.distanceUOM?.distanceUOMId || apiData.distanceToDowntown?.distanceUOM?.id,
      }),
    };
    return new AirportLocationModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportLocationRequest {
    return {
      id: this.id,
      countryId: this.country?.id || null,
      countryCode: this.country?.isO2Code,
      countryName: this.country?.commonName,
      stateId: this.state?.id || null,
      stateCode: this.state?.cappsCode,
      stateName: this.state?.commonName,
      cityId: this.city?.id || null,
      cityCode: this.city?.cappsCode,
      cityName: this.city?.commonName,
      cityCAPPSName: this.city?.cappsName,
      closestCityId: this.closestCity?.id || null,
      closestCityCode: this.closestCity?.cappsCode,
      closestCityName: this.closestCity?.commonName,
      islandId: this.island?.id || null,
      islandCode: this.island?.code,
      islandName: this.island?.name,
      magneticVariation: this.magneticVariation,
      elevation: this.elevation?.value?.toString()
        ? {
          id: this.elevation.id,
          value: parseFloat(this.elevation?.value),
          airportLocationId: this.id,
          elevationUOMId: this.elevationUOM.id,
        }
        : null,
      distanceToDowntown: this.distanceToDowntown?.value?.toString()
        ? {
          id: this.distanceToDowntown?.id,
          value: parseFloat(this.distanceToDowntown?.value),
          airportLocationId: this.id,
          airportDirectionId: this.airportDirection?.id,
          distanceUOMId: this.distanceUOM?.id,
        }
        : null,
    };
  }

  static deserializeList(apiData: IAPIAirportLocation[]): AirportLocationModel[] {
    return apiData ? apiData.map((data: IAPIAirportLocation) => AirportLocationModel.deserialize(data)) : [];
  }
}
