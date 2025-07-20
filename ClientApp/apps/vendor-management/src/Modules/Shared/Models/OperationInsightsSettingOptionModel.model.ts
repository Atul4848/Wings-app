import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class OperationInsightsSettingOptionModel extends CoreModel implements ISelectOption {
  id: number;
  userId?: string;
  operationalInsightId: number = 0;
  crewLocationTypeId: number = 0;
  paxLocationTypeId: number = 0;
  amenitiesId: number = 0;
  aircraftParkingOptionsId: number = 0;
  aircraftSpotAccommodationId: number = 0;
  towbarScenariosId: number = 0;
  availableFacilitiesId: number = 0;
  disabilityAccommodationsId: number = 0;
  internationalArrivalProceduresId: number = 0;
  internationalDepartureProceduresId: number = 0;
  driverDropOffLocationTypeCrewId: number = 0;
  driverDropOffLocationTypePaxId: number = 0;
  crewLocationType?: SettingBaseModel = new SettingBaseModel();
  paxLocationType?: SettingBaseModel = new SettingBaseModel();
  amenities?: SettingBaseModel = new SettingBaseModel();
  aircraftParkingOptions?: SettingBaseModel = new SettingBaseModel();
  aircraftSpotAccommodation?: SettingBaseModel = new SettingBaseModel();
  towbarScenarios?: SettingBaseModel = new SettingBaseModel();
  availableFacilities?: SettingBaseModel = new SettingBaseModel();
  disabilityAccommodations?: SettingBaseModel = new SettingBaseModel();
  internationalArrivalProcedures?: SettingBaseModel = new SettingBaseModel();
  internationalDepartureProcedures?: SettingBaseModel = new SettingBaseModel();
  driverDropOffLocationTypeCrew?: SettingBaseModel = new SettingBaseModel();
  driverDropOffLocationTypePax?: SettingBaseModel = new SettingBaseModel();
  

  constructor(data?: Partial<OperationInsightsSettingOptionModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: OperationInsightsSettingOptionModel): OperationInsightsSettingOptionModel {
    if (!apiData) {
      return new OperationInsightsSettingOptionModel();
    }
    const data: Partial<OperationInsightsSettingOptionModel> = {
      ...apiData,
      id: apiData.id,
      operationalInsightId: apiData.operationalInsightId,
      crewLocationType: SettingBaseModel.deserialize(apiData?.crewLocationType),
      paxLocationType: SettingBaseModel.deserialize(apiData?.paxLocationType),
      amenities: SettingBaseModel.deserialize(apiData?.amenities),
      aircraftParkingOptions: SettingBaseModel.deserialize(apiData?.aircraftParkingOptions),
      aircraftSpotAccommodation: SettingBaseModel.deserialize(apiData?.aircraftSpotAccommodation),
      towbarScenarios: SettingBaseModel.deserialize(apiData?.towbarScenarios),
      availableFacilities: SettingBaseModel.deserialize(apiData?.availableFacilities),
      disabilityAccommodations: SettingBaseModel.deserialize(apiData?.disabilityAccommodations),
      internationalArrivalProcedures: SettingBaseModel.deserialize(apiData?.internationalArrivalProcedures),
      internationalDepartureProcedures: SettingBaseModel.deserialize(apiData?.internationalDepartureProcedures),
      driverDropOffLocationTypeCrew: SettingBaseModel.deserialize(apiData?.driverDropOffLocationTypeCrew),
      driverDropOffLocationTypePax: SettingBaseModel.deserialize(apiData?.driverDropOffLocationTypePax),
      
    };
    return new OperationInsightsSettingOptionModel(data);
  }

  static deserializeList(apiDataList: OperationInsightsSettingOptionModel[]): OperationInsightsSettingOptionModel[] {
    return apiDataList
      ? apiDataList?.map((apiData: any) => OperationInsightsSettingOptionModel.deserialize(apiData))
      : [];
  }

  public serialize() {
    return {
      userId: this.userId || '',
      id: 0,
      crewLocationTypeId: this.crewLocationType?.id,
      paxLocationTypeId: this.paxLocationType?.id,
      amenitiesId: this.amenities?.id
    };
  }

  public get label(): string {
    if (this.crewLocationType?.label) {
      return this.crewLocationType.label;
    }else if(this.paxLocationType?.label){
      return this.paxLocationType.label
    }else if(this.amenities?.label){
      return this.amenities.label
    }else if(this.aircraftParkingOptions?.label){
      return this.aircraftParkingOptions.label
    }else if(this.aircraftSpotAccommodation?.label){
      return this.aircraftSpotAccommodation.label
    }else if(this.towbarScenarios?.label){
      return this.towbarScenarios.label
    }else if(this.availableFacilities?.label){
      return this.availableFacilities.label
    }else if(this.disabilityAccommodations?.label){
      return this.disabilityAccommodations.label
    }else if(this.internationalDepartureProcedures?.label){
      return this.internationalDepartureProcedures.label
    }else if(this.internationalArrivalProcedures?.label){
      return this.internationalArrivalProcedures.label
    }else if(this.driverDropOffLocationTypeCrew?.label){
      return this.driverDropOffLocationTypeCrew.label
    }else if(this.driverDropOffLocationTypePax?.label){
      return this.driverDropOffLocationTypePax.label
    }
    
    
    return '';
  }

  public get value(): string {
    if (this.crewLocationType?.value) {
      return this.crewLocationType.value;
    }else if(this.paxLocationType?.value){
      return this.paxLocationType.value
    }else if(this.amenities?.value){
      return this.amenities.value
    }else if(this.aircraftParkingOptions?.value){
      return this.aircraftParkingOptions.value
    }else if(this.aircraftSpotAccommodation?.value){
      return this.aircraftSpotAccommodation.value
    }else if(this.towbarScenarios?.value){
      return this.towbarScenarios.value
    }else if(this.availableFacilities?.value){
      return this.availableFacilities.value
    }else if(this.disabilityAccommodations?.value){
      return this.disabilityAccommodations.value
    }else if(this.internationalDepartureProcedures?.value){
      return this.internationalDepartureProcedures.value
    }else if(this.internationalArrivalProcedures?.value){
      return this.internationalArrivalProcedures.value
    }else if(this.driverDropOffLocationTypeCrew?.value){
      return this.driverDropOffLocationTypeCrew.value
    }else if(this.driverDropOffLocationTypePax?.value){
      return this.driverDropOffLocationTypePax.value
    }

    
    return '';
  }
}
