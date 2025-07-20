import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { StatusBaseModel } from './StatusBase.model';
import { Airports } from './Airports.model';
import { IAPIVMSVendorLocationComparison } from '../Interfaces';
import { VendorManagmentModel } from './VendorManagment.model';
import { LocationA2GModel } from './LocationA2G.model';
import { LocationOperationalEssentialModel } from './LocationOperationalEssential.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { LocationOperationalInsightsModel } from './LocationOperationalInsights.model';
import { OrderSoftwareModel } from './OrderSoftware.model';

@modelProtection
export class VendorLocationModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code?: string = '';
  name: string = '';
  vendorId: number = 0;
  vendor: {
    code: string;
    id: number;
    name: string;
  };
  vendorLocationId: number = 0;
  uwaCode: string = '';
  vendorLocationStatus: StatusBaseModel = new StatusBaseModel();
  vendorLocationStatusId: number = 0;
  airportReferenceId?: number = 0;
  airportReference?: Airports = new Airports();
  locationLegalName: string = '';
  rankAtAirport: number;
  locationStatusDetails: string = '';
  cappsLocationCode:string = '';
  countryDataManagement: boolean = false;
  permitDataManagement: boolean = false;
  airportDataManagement: boolean = false;
  vendorLocationA2G: LocationA2GModel;
  operationalEssential: LocationOperationalEssentialModel;
  vendorLocationCityReferenceModel?: VendorLocationCountryModel = null;
  vendorLocationCityReference?: VendorLocationCountryModel = null;
  operationalInsight: LocationOperationalInsightsModel;
  vendorLocationOrderManagement: OrderSoftwareModel[] = [];
  automationNoteForStatusDetails:string = '';

  constructor(data?: Partial<VendorLocationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIVMSVendorLocationComparison): VendorLocationModel {
    if (!apiData) {
      return new VendorLocationModel();
    }
    const data: Partial<VendorLocationModel> = {
      ...apiData,
      vendorLocationId: apiData.vendorLocationId || apiData.id,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      vendorLocationStatus: StatusBaseModel.deserialize(apiData.vendorLocationStatus),
      airportReference: apiData.airportReference
        ? Airports.deserializeAirportReference(apiData.airportReference)
        : null,
      locationLegalName: apiData.locationLegalName,
      cappsLocationCode: apiData.cappsLocationCode,
      rankAtAirport: apiData.airportRank,
      locationStatusDetails: apiData.locationStatusDetails,
      countryDataManagement: apiData.countryDataManagement,
      permitDataManagement: apiData.permitDataManagement,
      airportDataManagement: apiData.airportDataManagement,
      operationalEssential: LocationOperationalEssentialModel.deserialize(apiData?.operationalEssential),
      vendorLocationCityReference: VendorLocationCountryModel.deserialize(apiData?.vendorLocationCityReference),
      vendorLocationCityReferenceModel: VendorLocationCountryModel.deserialize(apiData?.vendorLocationCityReference),
      operationalInsight: LocationOperationalInsightsModel.deserialize(apiData?.operationalInsight),
      vendorLocationOrderManagement: OrderSoftwareModel.deserializeList(apiData?.vendorLocationOrderManagement),
      automationNoteForStatusDetails: apiData.automationNoteForStatusDetails,
    };
    return new VendorLocationModel(data);
  }

  static deserializeList(apiDataList: IAPIVMSVendorLocationComparison[]): VendorLocationModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => VendorLocationModel.deserialize(apiData)) : [];
  }

  public serialize(isAirport?: boolean) {
    return {
      id: this.id || 0,
      code: this.code?.replace(/\s/g, '') || undefined,
      name: this.name,
      vendorId: this.vendor.id,
      vendor: {
        code: this.vendor?.code,
        id: this.vendor?.id,
        name: this.vendor?.name,
      },
      vendorLocationStatus: this.vendorLocationStatus,
      cappsLocationCode: this.cappsLocationCode || null,
      vendorLocationStatusId: this.vendorLocationStatus.id,
      airportReferenceId: isAirport ? this.airportReference?.id : null,
      airportReference: isAirport ? this.airportReference : null,
      userId: this.userId,
      locationLegalName: this.locationLegalName?.replace(/^\s*\s*$/, '') || null,
      airportRank: isAirport ? parseInt(`${this.rankAtAirport}`) : null,
      locationStatusDetails: this.locationStatusDetails?.replace(/^\s*\s*$/, '') || null,
      countryDataManagement: Boolean(this.countryDataManagement),
      permitDataManagement: Boolean(this.permitDataManagement),
      airportDataManagement: Boolean(this.airportDataManagement),
      vendorLocationCityReferenceModel: isAirport ? null : this.buildVendorCountry(),
      automationNoteForStatusDetails:this.automationNoteForStatusDetails
    };
  }

  public buildVendorCountry = (): VendorLocationCountryModel => {
    return new VendorLocationCountryModel({
      id: this.id || 0,
      cityId: this.hqAddressCity.id,
      cityName: this.hqAddressCity.commonName,
      cityCode: this.hqAddressCity.cappsCode,
      stateId: this.hqAddressState?.id,
      stateName: this.hqAddressState?.commonName,
      stateCode: this.hqAddressState?.isoCode,
      countryId: this.hqAddressCountry.id,
      countryCode: this.hqAddressCountry.isO2Code,
      countryName: this.hqAddressCountry.commonName,
    });
  };
  // required in auto complete
  public get label(): string {
    if (this.airportReference?.getDisplayCode()) {
      return `${this.name} (${this.airportReference?.getDisplayCode()})`;
    }
    if (this.vendorLocationCityReferenceModel !== null) {
      if (
        this.vendorLocationCityReferenceModel?.cityReference?.code ||
        this.vendorLocationCityReferenceModel?.cityReference?.name
      ) {
        return `${this.name} (${this.vendorLocationCityReferenceModel?.cityReference?.code ||
          this.vendorLocationCityReferenceModel?.cityReference?.name})`;
      }
      return `${this.name}`;
    }
    return `${this.name}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
