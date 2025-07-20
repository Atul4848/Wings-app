import { CoreModel, modelProtection } from '@wings-shared/core';
import { IAPIResponseVendorAddress } from '../Interfaces/Response/API-Response-VendorAddress';
import { IAPIRequestVendorAddress } from '../Interfaces/Request/API-Request-VendorAddress.interface';

@modelProtection
export class VendorAddressModel extends CoreModel {
  vendorAddressId: number = 0;
  addressTypeId: number;
  addressLine1: string;
  addressLine2: string;
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
  id: number;
  constructor(data?: Partial<VendorAddressModel>) { 
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIResponseVendorAddress): VendorAddressModel {
    if (!apiData) {
      return new VendorAddressModel();
    }
    const data: Partial<VendorAddressModel> = {
      ...apiData,
      vendorAddressId: apiData.vendorAddressId,
      id: apiData.vendorAddressId,
      addressTypeId: apiData.addressType.id,
      addressLine1: apiData.addressLine1,
      addressLine2: apiData.addressLine2,
      countryId: apiData.countryReference.countryId,
      countryCode: apiData.countryReference.code,
      countryName: apiData.countryReference.name,
      stateId: apiData.stateReference?.stateId,
      stateCode: apiData.stateReference?.code,
      stateName: apiData.stateReference?.name,
      cityId: apiData.cityReference.cityId,
      cityCode: apiData.cityReference.code,
      cityName: apiData.cityReference.name,
      zipCode: apiData.zipCode,
    };
    return new VendorAddressModel(data);
  }

  public serialize(vendorId:number):IAPIRequestVendorAddress {
    return {
      id: this.id || 0,
      vendorAddressId: this.vendorAddressId || 0,
      addressTypeId: 1,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      countryId: this.countryId,
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateId: this.stateId,
      stateCode: this.stateCode,
      stateName: this.stateName,
      cityId: this.cityId,
      cityCode: this.cityCode,
      cityName: this.cityName,
      zipCode: this.zipCode||null,
    };
  }

  static deserializeList(apiDataList: IAPIResponseVendorAddress[]): VendorAddressModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorAddressModel.deserialize(apiData)) : [];
  }
}
