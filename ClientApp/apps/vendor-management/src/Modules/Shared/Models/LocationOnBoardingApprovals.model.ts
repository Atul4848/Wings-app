import { CoreModel, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { Airports } from './Airports.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';

@modelProtection
export class LocationOnBoardingApprovalsModel extends CoreModel {
  id: number = 0;
  vendor: VendorManagmentModel = new VendorManagmentModel();
  airportReference: Airports = new Airports();
  vendorLocationCityReference: VendorLocationCountryModel;
  locationName: string = '';
  companyLegalName: string = '';
  companyWebsite: string = '';
  accountReceivableContactName: string = '';
  accountReceivableContactPhone: string = '';
  operationType: SettingBaseModel = new SettingBaseModel();
  tempLocationId: string = '';
  locationUniqueCode: string = '';
  slide4Answer: string = '';
  slide5Answer: string = '';
  slide6Answer: string = '';
  combinedApprovalStatus: string = '';

  constructor(data?: Partial<LocationOnBoardingApprovalsModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: LocationOnBoardingApprovalsModel): LocationOnBoardingApprovalsModel {
    if (!apiData) {
      return new LocationOnBoardingApprovalsModel();
    }
    const data: Partial<LocationOnBoardingApprovalsModel> = {
      ...apiData,
      id: apiData.id,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      airportReference: Airports.deserializeAirportReference(apiData.airportReference),
      vendorLocationCityReference:VendorLocationCountryModel.deserialize(apiData.vendorLocationCityReference),
      locationName: apiData.locationName,
      companyLegalName: apiData.companyLegalName,
      companyWebsite: apiData.companyWebsite,
      accountReceivableContactName: apiData.accountReceivableContactName,
      accountReceivableContactPhone: apiData.accountReceivableContactPhone,
      operationType: SettingBaseModel.deserialize(apiData.operationType),
      tempLocationId: apiData.tempLocationId,
      locationUniqueCode: apiData.locationUniqueCode,
      slide4Answer: apiData.slide4Answer,
      slide5Answer: apiData.slide5Answer,
      slide6Answer: apiData.slide6Answer,
    };
    return new LocationOnBoardingApprovalsModel(data);
  }

  static deserializeList(apiData: LocationOnBoardingApprovalsModel[]): LocationOnBoardingApprovalsModel[] {
    return apiData ? 
      apiData.map((data: LocationOnBoardingApprovalsModel) => LocationOnBoardingApprovalsModel.deserialize(data)) 
      : [];
  }

}
