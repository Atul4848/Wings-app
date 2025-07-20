import { ISelectOption, modelProtection } from '@wings-shared/core';
import { ServiceItemPricingModel } from './ServiceItemPricing.model';
import { BaseModel } from './Base.model';
import { Airports } from './Airports.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';

@modelProtection
export class ServiceItemPricingLocationModel extends BaseModel implements ISelectOption{
    public serviceItemPricingId:number;
    public serviceItemPricing:ServiceItemPricingModel;
    public vendorLocationId:number
    public vendorLocationName:string;
    public airportReference?:Airports;
    public vendorLocationCityReference?: VendorLocationCountryModel;

    constructor(data?: Partial<ServiceItemPricingLocationModel>) {
      super(data);
      Object.assign(this, data);
      this.id=this.vendorLocationId;
      this.name=this.vendorLocationName;
    }
        
    static deserialize(apiData: ServiceItemPricingLocationModel): ServiceItemPricingLocationModel {
      if (!apiData) {
        return new ServiceItemPricingLocationModel();
      }
      const data: Partial<ServiceItemPricingLocationModel> = {
        ...apiData,
        airportReference: Airports.deserializeAirportReference(apiData.airportReference),
        vendorLocationCityReference: VendorLocationCountryModel.deserialize(apiData.vendorLocationCityReference)
      };
      return new ServiceItemPricingLocationModel(data);
    }
        
    static deserializeList(apiDataList: ServiceItemPricingLocationModel[]): ServiceItemPricingLocationModel[] {
      return apiDataList ? apiDataList.map((apiData: any) => ServiceItemPricingLocationModel.deserialize(apiData)) : [];
    }

    public get label(): string {
      if(this.airportReference?.getDisplayCode()){
        return `${this?.vendorLocationName} (${this.airportReference?.getDisplayCode()})`;
      }
      if(this.vendorLocationCityReference !== null){
        return `${this.vendorLocationName} (${this.vendorLocationCityReference.cityReference?.code || this.vendorLocationCityReference.cityReference?.name})`
      }
      return this.vendorLocationName;
    }

    public get value(): string | number {
      return this.vendorLocationId;
    }
}