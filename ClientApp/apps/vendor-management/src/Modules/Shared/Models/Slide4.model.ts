import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { Airports } from './Airports.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { CityModel, CountryModel, StateModel } from '@wings/shared';

@modelProtection
export class Slide4Model extends CoreModel implements ISelectOption {
  id: number = 0;
  vendor: VendorManagmentModel = new VendorManagmentModel();
  vendorId: number = 0;
  tempLocationId: string = '';
  addressType: SettingBaseModel = new SettingBaseModel();
  userId: string = '';
  addressLine1: string = '';
  addressLine2: string = '';
  countryReference: CountryModel;
  stateReference: StateModel;
  cityReference: CityModel;
  advanceOverTimeRequested: string = '';
  overTimeRequested: string = '';
  airfieldLocation: string = '';
  arinc: string = '';
  zipCode: string = '';

  constructor(data?: Partial<Slide4Model>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: Slide4Model): Slide4Model {
    if (!apiData) {
      return new Slide4Model();
    }
    console.log('apiData', apiData);
    const data: Partial<Slide4Model> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      addressType: SettingBaseModel.deserialize(apiData?.addressType),
      countryReference: apiData?.countryReference?.countryId
        ? CountryModel.deserialize(apiData?.countryReference)
        : null,
      stateReference: StateModel.deserialize(apiData?.stateReference),
      cityReference: CityModel.deserialize(apiData?.cityReference),
    };
    return new Slide4Model(data);
  }

  static deserializeList(apiDataList: Slide4Model[]): Slide4Model[] {
    return apiDataList ? apiDataList.map(apiData => Slide4Model.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
