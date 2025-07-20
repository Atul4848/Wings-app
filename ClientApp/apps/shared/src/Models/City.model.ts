import { IAPICity, IAPICityRequest } from '../Interfaces';
import { CountryModel, StateModel, MetroModel, CityAlternateNamesModel } from '../Models';
import { BaseCityModel } from './BaseCity.model';
import { CoreModel, ISelectOption, modelProtection, Utilities } from '@wings-shared/core';

@modelProtection
export class CityModel extends BaseCityModel implements ISelectOption {
  country: CountryModel;
  state: StateModel;
  metro: MetroModel;
  /* it contain value separated by comma\'s */
  cityAlternateNames: string[] = [];

  constructor(data?: Partial<CityModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
    this.state = new StateModel(data?.state);
    this.metro = new MetroModel(data?.metro);
  }

  static deserialize(apiCity: IAPICity): CityModel {
    if (!apiCity) {
      return new CityModel();
    }
    const data: Partial<CityModel> = {
      ...CoreModel.deserializeAuditFields(apiCity),
      id: apiCity.cityId || apiCity.id,
      officialName: apiCity.officialName || apiCity.name,
      commonName: apiCity.commonName || apiCity.name,
      latitude: apiCity.latitude,
      longitude: apiCity.longitude,
      population: apiCity.population,
      ranking: apiCity.ranking,
      cappsCode: apiCity.cappsCode || apiCity?.code,
      cappsName: apiCity.cappsName,
      cappsShortName: apiCity.cappsShortName,
      cappsStateCode: apiCity.cappsStateCode,
      simpleCityID: apiCity.simpleCityID,
      alternateNames: CityAlternateNamesModel.deserializeList(apiCity.alternateNames),
      cityAlternateNames: apiCity.alternateNames?.map(({ alternateName }) => alternateName),
      country: CountryModel.deserialize(apiCity.country),
      state: StateModel.deserialize(apiCity.state),
      metro: MetroModel.deserialize(apiCity.metro),
    };
    return new CityModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPICityRequest {
    return {
      id: this.id,
      officialName: this.officialName,
      commonName: this.commonName,
      cappsCode: this.cappsCode,
      cappsName: this.cappsName,
      cappsShortName: this.cappsShortName,
      cappsStateCode: this.cappsStateCode,
      simpleCityID: this.simpleCityID,
      countryId: this.country?.id || null,
      metroId: this.metro?.id || null,
      stateId: this.state?.id || null,
      latitude: Utilities.getNumberOrNullValue(this.latitude),
      longitude: Utilities.getNumberOrNullValue(this.longitude),
      population: Utilities.getNumberOrNullValue(this.population),
      ranking: Utilities.getNumberOrNullValue(this.ranking),
      alternateNames: this.alternateCityNames(),
      ...this._serialize(),
    };
  }

  static deserializeList(apiDataList: IAPICity[]): CityModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPICity) => CityModel.deserialize(apiData)) : [];
  }

  public alternateCityNames(): CityAlternateNamesModel[] {
    if (!Array.isArray(this.cityAlternateNames)) return [];

    return this.cityAlternateNames.reduce<CityAlternateNamesModel[]>(
      (acc: CityAlternateNamesModel[], currentValue: string) => {
        const isExist = acc.some((c: CityAlternateNamesModel) => Utilities.isEqual(c?.alternateName, currentValue));
        if (!isExist) {
          const cityAlternateData: CityAlternateNamesModel = this.alternateNames.find(city =>
            Utilities.isEqual(city.alternateName, currentValue)
          );

          acc.push(
            new CityAlternateNamesModel({
              alternateName: currentValue,
              cityId: this.id,
              id: Boolean(cityAlternateData) ? cityAlternateData.id : 0,
            })
          );
        }
        return acc;
      },
      []
    );
  }

  // required in auto complete
  public get label(): string {
    if (this.commonName && this.cappsCode) {
      return `${this.commonName} (${this.cappsCode})`;
    }
    return this.commonName || this.officialName || this.cappsCode;
  }

  // required in auto complete
  public get labelWithState(): string {
    if (this.state?.id && this.cappsCode) {
      return `${this.commonName} (${this.cappsCode}, ${this.state.cappsCode})`;
    }
    return this.label;
  }

  public get value(): number {
    return this.id;
  }
}
