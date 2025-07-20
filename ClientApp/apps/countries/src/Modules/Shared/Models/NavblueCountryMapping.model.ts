import {
  CoreModel,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { CountryModel } from '@wings/shared';
import { IAPINavblueCountryMapping } from '../Interfaces';

export class NavblueCountryMappingModel extends CoreModel {
  country: CountryModel;
  navBlueCountryCodes: IdNameCodeModel[]=[];

  constructor(data?: Partial<NavblueCountryMappingModel>) {
    super(data);
    Object.assign(this, data);
    this.country = new CountryModel(data?.country);
  }

  static deserialize(apiData: IAPINavblueCountryMapping): NavblueCountryMappingModel {
    if (!apiData) {
      return new NavblueCountryMappingModel();
    }

    return new NavblueCountryMappingModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.country?.countryId,
      country: CountryModel.deserialize(apiData.country),
      navBlueCountryCodes: IdNameCodeModel.deserializeList(apiData.navBlueCountryCodes),
    });
  }

  static deserializeList(apiDataList: IAPINavblueCountryMapping[]): NavblueCountryMappingModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPINavblueCountryMapping) => NavblueCountryMappingModel.deserialize(apiData))
      : [];
  }

  // serialize object for create/update API
  public serialize():IAPINavblueCountryMapping {
    return {
      countryId: this.id,
      navBlueCountryCodes: this.navBlueCountryCodes?.map(x => ({
        id: x.id||0,
        code: x.label,
      })),
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }
  
  public get value(): string | number {
    return this.id;
  }
}
