import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { CityModel, CountryModel, StateModel } from '@wings/shared';

@modelProtection
export class VendorLocationCountryModel extends CoreModel {
  id: number = 0;
  countryReferenceId: number = 0;
  countryReference: CountryModel;
  stateReferenceId: number= 0;
  stateReference: StateModel;
  cityReferenceId: number = 0;
  cityReference: CityModel;
  countryId: number;
  countryCode: string;
  countryName: string = '';
  stateId: number = 0;
  stateCode: string = '';
  stateName: string = '';
  cityId: number = 0;
  cityCode: string = '';
  cityName: string = '';

  constructor(data?: Partial<VendorLocationCountryModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: VendorLocationCountryModel): VendorLocationCountryModel {
    if (!apiData) {
      return new VendorLocationCountryModel();
    }
    const data: Partial<VendorLocationCountryModel> = {
      ...apiData,
      countryId: apiData.countryReference?.countryId,
      countryCode: apiData.countryReference?.code,
      countryName: apiData.countryReference?.name,
      stateId: apiData.stateReference?.stateId,
      stateCode: apiData.stateReference?.code,
      stateName: apiData.stateReference?.name,
      cityId: apiData.cityReference?.cityId,
      cityCode: apiData.cityReference?.code,
      cityName: apiData.cityReference?.name,
    };
    return new VendorLocationCountryModel(data);
  }

  public serialize() {
    return {
      id: this.id || 0,
      countryId: this.countryReference.countryId,
      countryCode: this.countryReference?.isO2Code,
      countryName: this.countryReference?.commonName,
      stateId: this.stateReference?.id,
      stateCode: this.stateReference?.isoCode,
      stateName: this.stateReference?.commonName,
      cityId: this.cityReference?.id,
      cityCode: this.cityReference?.cappsCode,
      cityName: this.cityReference?.commonName,
    };
  }
  // required in auto complete
  public get label(): string {
    return this.countryName;
  }

  public get value(): string | number {
    return this.id;
  }
}
