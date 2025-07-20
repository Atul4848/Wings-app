import { CoreModel, modelProtection } from '@wings-shared/core';
import { CityModel, CountryModel, StateModel } from '@wings/shared';
import { IAPIRequestBankInformation } from '../Interfaces/Request/API-Request-BankInformation.interface';
import { IAPIResponseBankInformation } from '../Interfaces/Response/API-Response-BankInformation';

@modelProtection
export class BankInformation extends CoreModel {
  name: string;
  addressLine1: string;
  addressLine2: string;
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
  zipCode: string;
  id: number = 0;
  vendorId: number;
  vendorLocationId: number;
  constructor(data?: Partial<BankInformation>) { 
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIResponseBankInformation): BankInformation {
    if (!apiData) {
      return new BankInformation();
    }
    const data: Partial<BankInformation> = {
      ...apiData,
      id: apiData.id,
      name: apiData.name,
      addressLine1: apiData.addressLine1,
      addressLine2: apiData.addressLine2,
      countryReference: CountryModel.deserialize({
        ...apiData.countryReference,
        id: apiData.countryReference?.countryId,
        name: apiData.countryReference?.name,
        code: apiData.countryReference?.code,
      }),
      stateReference: StateModel.deserialize(apiData.stateReference),
      cityReference: CityModel.deserialize(apiData.cityReference),
      zipCode: apiData.zipCode,
      vendorId: apiData.vendorId,
      vendorLocationId: apiData.id
    };
    return new BankInformation(data);
  }

  public serialize(vendorId:number, vendorLocationId:number):IAPIRequestBankInformation {
    return {
      userId: this.userId,
      id: this.id || 0,
      name: this.name?.replace(/^\s*\s*$/, ''),
      addressLine1: this.addressLine1?.replace(/^\s*\s*$/, '') || null,
      addressLine2: this.addressLine2?.replace(/^\s*\s*$/, '') || null,
      countryId: this.countryReference?.countryId,
      countryCode: this.countryReference?.isO2Code,
      countryName: this.countryReference?.commonName || null,
      stateId: this.stateReference?.id,
      stateCode: this.stateReference?.isoCode || this.stateReference?.code,
      // stateCode: this.stateReference?.code,
      stateName: this.stateReference?.commonName || null,
      cityId: this.cityReference?.id,
      cityCode: this.cityReference?.cappsCode,
      cityName: this.cityReference?.commonName || null,
      zipCode: this.zipCode?.replace(/^\s*\s*$/, '')||null,
      vendorId: vendorId,
      vendorLocationId: vendorLocationId,
    };
  }

  static deserializeList(apiDataList: IAPIResponseBankInformation[]): BankInformation[] {
    return apiDataList ? apiDataList.map((apiData: any) => BankInformation.deserialize(apiData)) : [];
  }
}
