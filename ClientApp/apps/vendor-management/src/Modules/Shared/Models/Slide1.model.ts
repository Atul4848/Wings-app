import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { Airports } from './Airports.model';

@modelProtection
export class Slide1Model extends CoreModel implements ISelectOption {
  id: number = 0;
  userId: string = '';
  vendorId: number = 0;
  airportReference: Airports = new Airports();
  vendorLocationCityReferenceModel: VendorLocationCountryModel = new VendorLocationCountryModel();
  locationName: string = '';
  companyLegalName: string = '';
  companyWebsite: string = '';
  accountReceivableContactName: string = '';
  accountReceivableContactPhone: string = '';
  appliedOperationType: SettingBaseModel = new SettingBaseModel();
  appliedOperationTypeId: number = 0;
  tempLocationId: string = '';
  locationUniqueCode: string = '';
  slide4Answer: string = ';'
  slide5Answer: string = ';'
  slide6Answer: string = ';'

  constructor(data?: Partial<Slide1Model>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: Slide1Model): Slide1Model {
    if (!apiData) {
      return new Slide1Model();
    }
    const data: Partial<Slide1Model> = {
      ...apiData,
      airportReference: apiData.airportReference
        ? Airports.deserializeAirportReference(apiData.airportReference)
        : null,
      vendorLocationCityReferenceModel: VendorLocationCountryModel.deserialize(
        apiData?.vendorLocationCityReference || apiData?.vendorLocationCityReferenceModel
      ),
      appliedOperationType: SettingBaseModel.deserialize(apiData?.operationType),
    };
    return new Slide1Model(data);
  }

  static deserializeList(apiDataList: Slide1Model[]): Slide1Model[] {
    return apiDataList ? apiDataList.map(apiData => Slide1Model.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.locationName;
  }

  public get value(): string | number {
    return this.id;
  }
}
