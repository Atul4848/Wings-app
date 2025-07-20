import { Airports } from '../Models';
import { VendorLocationCountryModel } from '../Models/VendorLocationCountry.model';
import { IAPIResponseOrderSoftware } from './Response/API-Response-OrderSoftware';
import { IAPIResponseVendorLocationHours } from './Response/API-Response-VendorLocation';
import { IAPIResponseVendorLocationOperationalEssential } from 
  './Response/API-Response-VendorLocationOperationalEssential';

export interface IAPIVMSVendorComparison {
  id: number;
  code: string;
  name: string;
  vendorStatus: IAPIVmsVendorStatusTable;
  vendorStatusId: number;
  userId: string;
}

export interface IAPIVMSVendorContactComparison {
  id: number;
  contact: IAPIVMSVendorComparison;
  status: IAPIVmsVendorStatusTable;
  contactUsegeType: IAPIVmsVendorStatusTable;
  accessLevel: IAPIVmsVendorStatusTable;
  vendor: IAPIVMSVendorComparison;
}

export interface IAPIVMSVendorLocationComparison {
  id: number;
  code: string;
  name: string;
  vendor: IAPIVmsBaseTable;
  vendorLocationStatus: IAPIVmsVendorStatusTable;
  airportReference: Airports;
  vendorLocationId: number;
  locationLegalName: string;
  airportRank: number;
  locationStatusDetails: string;
  cappsLocationCode:string;
  countryDataManagement: boolean;
  permitDataManagement: boolean;
  airportDataManagement: boolean;
  vendorLocationHours: IAPIResponseVendorLocationHours;
  operationalEssential: IAPIResponseVendorLocationOperationalEssential;
  vendorLocationCityReference: VendorLocationCountryModel;
  vendorLocationOrderManagement: IAPIResponseOrderSoftware;
  automationNoteForStatusDetails:string ;
}

export interface IAPIVmsBaseTable {
  id: number;
  code: string;
  name: string;
}

export interface IAPIVendorLocationCountry {
  id: number;
  countryId: number;
  countryCode: string;
  countryName: string;
  stateId: number;
  stateCode: string;
  stateName: string;
  cityId: number;
  cityCode: string;
  cityName: string;
}

export interface IAPIVmsCountryTable extends IAPIVmsBaseTable {
  countryId: number;
}

export interface IAPIVmsStateTable extends IAPIVmsBaseTable {
  stateId: number;
}

export interface IAPIVmsCityTable extends IAPIVmsBaseTable {
  cityId: number;
}

export interface IAPIVmsVendorAddressTable {
  id: number;
  addressTypeId: number;
  street: string;
  zipCode: string;
  countryReference: IAPIVmsCountryTable;
  stateReference: IAPIVmsStateTable;
  cityReference: IAPIVmsCityTable;
}

export interface IAPIVmsVendorStatusTable {
  id: number;
  name: string;
}
