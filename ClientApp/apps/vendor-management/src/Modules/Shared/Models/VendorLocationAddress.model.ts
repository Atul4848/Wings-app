import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIRequestVendorAddress } from '../Interfaces/Request/API-Request-VendorAddress.interface';
import { SettingBaseModel } from './SettingBase.model';
import { CityModel, CountryModel, StateModel } from '@wings/shared';
import { VendorLocationModel } from './VendorLocation.model';
import { IAPIResponseVendorLocationAddress } from '../Interfaces/Response/API-Response-VendorLocationAddress';

@modelProtection
export class VendorLocationAddressModel extends CoreModel {
  vendorAddressId: number = 0;
  addressTypeId: number;
  addressType: SettingBaseModel;
  addressLine1: string;
  addressLine2: string= '';
  countryReference: CountryModel;
  stateReference: StateModel;
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
  zipCode: string = '';
  vendorLocationId:number;
  vendorLocation: VendorLocationModel;
  id: number = 0;
  vendorId: number
  constructor(data?: Partial<VendorLocationAddressModel>) { 
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIResponseVendorLocationAddress): VendorLocationAddressModel {
    if (!apiData) {
      return new VendorLocationAddressModel();
    }
    const data: Partial<VendorLocationAddressModel> = {
      ...apiData,
      vendorAddressId: apiData.vendorAddressId,
      addressType: SettingBaseModel.deserialize(apiData.addressType),
      addressTypeId: apiData.addressType.id,
      addressLine1: apiData.addressLine1,
      addressLine2: apiData.addressLine2,
      countryReference: CountryModel.deserialize(apiData.countryReference),
      stateReference: StateModel.deserialize(apiData.stateReference),
      cityReference: CityModel.deserialize(apiData.cityReference),
      zipCode: apiData.zipCode,
      vendorLocation: VendorLocationModel.deserialize(apiData.vendorLocation),
      vendorLocationId: apiData.vendorLocationId,
      vendorId: apiData.vendorId
    };
    return new VendorLocationAddressModel(data);
  }

  public serialize(vendorId:number,vendorLocationId:number):IAPIRequestVendorAddress {
    return {
      userId: this.userId,
      id: this.id || 0,
      addressTypeId: this.addressType.id,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2?.replace(/^\s*\s*$/, '') || null,
      countryId: this.countryReference.countryId,
      countryCode: this.countryReference?.isO2Code,
      countryName: this.countryReference?.commonName,
      stateId: this.stateReference?.id,
      stateCode: this.stateReference?.isoCode,
      stateName: this.stateReference?.commonName,
      cityId: this.cityReference?.id,
      cityCode: this.cityReference?.cappsCode,
      cityName: this.cityReference?.commonName,
      zipCode: this.zipCode||null,
      vendorId: vendorId,
      vendorLocationId: vendorLocationId
    };
  }

  static deserializeList(apiDataList: IAPIResponseVendorLocationAddress[]): VendorLocationAddressModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorLocationAddressModel.deserialize(apiData)) : [];
  }
}
