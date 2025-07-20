import { IAPICity } from '../Interfaces';
import { CityAlternateNamesModel } from '../Models';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class BaseCityModel extends CoreModel implements ISelectOption {
  id: number = 0;
  officialName: string = '';
  commonName: string = '';
  latitude?: number = null;
  longitude?: number = null;
  population: number = null;
  ranking: number = null;
  cappsCode: string = '';
  cappsName: string = '';
  cappsShortName: string = '';
  cappsStateCode: string = '';
  simpleCityID?: number = null;
  alternateNames: CityAlternateNamesModel[] = [];

  constructor(data?: Partial<BaseCityModel>) {
    super(data);
    Object.assign(this, data);
    this.alternateNames = data?.alternateNames?.map(x => new CityAlternateNamesModel(x)) || [];
  }

  static deserialize(apiCity: IAPICity): BaseCityModel {
    if (!apiCity) {
      return new BaseCityModel();
    }
    const data: Partial<BaseCityModel> = {
      id: apiCity.cityId || apiCity.id,
      officialName: apiCity.officialName || apiCity.name,
      commonName: apiCity.commonName,
      latitude: apiCity.latitude,
      longitude: apiCity.longitude,
      population: apiCity.population,
      ranking: apiCity.ranking,
      cappsCode: apiCity.cappsCode || apiCity?.code || '',
      cappsName: apiCity.cappsName,
      cappsShortName: apiCity.cappsShortName,
      cappsStateCode: apiCity.cappsStateCode,
      simpleCityID: apiCity.simpleCityID,
      alternateNames: CityAlternateNamesModel.deserializeList(apiCity.alternateNames),
    };
    return new BaseCityModel(data);
  }

  // required in auto complete
  public get label(): string {
    return this.cappsCode ? `${this.officialName} (${this.cappsCode})` : this.officialName;
  }

  public get value(): number {
    return this.id;
  }
}
