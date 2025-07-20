import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { VendorLocationModel } from './VendorLocation.model';
import { SettingBaseModel } from './SettingBase.model';
import { IAPIResponseVendorLocationOperationalInsights } 
  from '../Interfaces/Response/API-Response-VendorLocationOperationalInsights';
import { OperationInsightsSettingOptionModel } from './OperationInsightsSettingOptionModel.model';

@modelProtection
export class LocationOperationalInsightsModel extends CoreModel implements ISelectOption {
  id: number = 0;
  agentFeesApply: boolean = false;
  vendorLocationId: number = 0;
  vendorLocation: VendorLocationModel = new VendorLocationModel();
  aircraftHandlingLocationLatitude: number = 0;
  aircraftHandlingLocationLongitude: number = 0;
  aircraftParkingDistanceFBO: SettingBaseModel = new SettingBaseModel();
  aircraftParkingField: string = '';
  aircraftParkingOptionLatitude: number = 0;
  aircraftParkingOptionLongitude: number = 0;
  appliedAircraftParkingOptions: OperationInsightsSettingOptionModel[] = [];
  appliedAircraftSpotAccommodation: OperationInsightsSettingOptionModel[] = [];
  appliedAmenities: OperationInsightsSettingOptionModel[] = [];
  appliedAvailableFacilities: OperationInsightsSettingOptionModel[] = [];
  appliedCrewLocationType: OperationInsightsSettingOptionModel[] = [];
  appliedDisabilityAccommodation: OperationInsightsSettingOptionModel[] = [];
  appliedInternationalArrivalProcedures: OperationInsightsSettingOptionModel[] = [];
  appliedInternationalDepartureProcedures: OperationInsightsSettingOptionModel[] = [];
  appliedPaxLocationType: OperationInsightsSettingOptionModel[] = [];
  appliedTowbarScenarios: OperationInsightsSettingOptionModel[] = [];
  disabilityAccommodations: OperationInsightsSettingOptionModel[] = [];
  arrivalCrewPaxPassportHandling: SettingBaseModel = new SettingBaseModel();
  arrivalMeetingPoint: string = '';
  crewLatitude: number = 0;
  crewLongitude: number = 0;
  customsClearanceFBO: boolean = false;
  customsClearanceTiming: number | null = null;
  domesticArrivalProcedures: string = '';
  domesticDepartureProcedures: string = '';
  earlyCrewArrival: number | null = null;
  earlyPaxArrival: number | null = null;
  hangarAvailable: boolean = false;
  hangarAvailableSpace: number | null = null;
  hangerAvailableUom: SettingBaseModel = new SettingBaseModel();
  internationalArrivalProcedures: OperationInsightsSettingOptionModel[] = [];
  internationalDepartureProcedures: OperationInsightsSettingOptionModel[] = [];
  luggageHandling: SettingBaseModel = new SettingBaseModel();
  paxLatitude: number = 0;
  paxLongitude: number = 0;
  towbarRequired: SettingBaseModel = new SettingBaseModel();
  towbarRequirement: string = '';
  crewLatitudeLongitude: string = '';
  paxLatitudeLongitude: string = '';
  aircraftParkingOptionLatitudeLongitude: string = '';
  aircraftHandlingLocationLatitudeLongitude: string = '';

  driverDropOffLocationLatCrew: number = 0;
  driverDropOffLocationLonCrew: number = 0;
  driverDropOffLocationLatitudeLongitudeCrew: string = '';
  driverDropOffLocationLatPax: number = 0;
  driverDropOffLocationLonPax: number = 0;
  driverDropOffLocationLatitudeLongitudePax: string = '';
  transportationAdditionalInfo: string = '';
  appliedDriverDropOffLocationTypeCrew: OperationInsightsSettingOptionModel[] = [];
  appliedDriverDropOffLocationTypePax: OperationInsightsSettingOptionModel[] = [];
  otherValue: string = '';
  isOvertimeAvailable: boolean = false;
  leadTimeForOvertime: number | null = null;
  departureProceduresOtherValue: string = '';

  constructor(data?: Partial<LocationOperationalInsightsModel>) {
    super(data);
    Object.assign(this, data);
  }

  public static getYesNoSometimes() {
    return SettingBaseModel.deserializeList([
      {
        id: 1,
        name: 'Yes',
      },
      {
        id: 2,
        name: 'No',
      },
      {
        id: 3,
        name: 'Sometimes',
      },
    ]);
  }

  public static getYesNo() {
    return SettingBaseModel.deserializeList([
      {
        id: 1,
        name: 'Yes',
      },
      {
        id: 2,
        name: 'No',
      }
    ]);
  }

  static deserialize(apiData: LocationOperationalInsightsModel): LocationOperationalInsightsModel {
    if (!apiData) {
      return new LocationOperationalInsightsModel();
    }
    const yesNoSometimesList = this.getYesNoSometimes();
    const towbarSetting = yesNoSometimesList.find(
      setting => setting.name.toLocaleLowerCase() === apiData.towbarRequired?.toString().toLocaleLowerCase()
    );
    const data: Partial<LocationOperationalInsightsModel> = {
      ...apiData,
      aircraftParkingDistanceFBO: SettingBaseModel.deserialize(apiData.aircraftParkingDistanceFBO),
      appliedAircraftParkingOptions: OperationInsightsSettingOptionModel.deserializeList(
        apiData.appliedAircraftParkingOptions
      ),
      appliedAircraftSpotAccommodation: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedAircraftSpotAccommodation
      ),
      appliedAmenities: OperationInsightsSettingOptionModel.deserializeList(apiData?.appliedAmenities),
      appliedAvailableFacilities: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedAvailableFacilities
      ),
      appliedCrewLocationType: OperationInsightsSettingOptionModel.deserializeList(apiData?.appliedCrewLocationType),

      appliedInternationalDepartureProcedures: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedInternationalDepartureProcedures
      ),
      appliedInternationalArrivalProcedures: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedInternationalArrivalProcedures
      ),
      appliedDisabilityAccommodation: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedDisabilityAccommodation
      ),
      appliedPaxLocationType: OperationInsightsSettingOptionModel.deserializeList(apiData?.appliedPaxLocationType),
      appliedTowbarScenarios: OperationInsightsSettingOptionModel.deserializeList(apiData.appliedTowbarScenarios),

      disabilityAccommodations: OperationInsightsSettingOptionModel.deserializeList(apiData.disabilityAccommodations),

      arrivalCrewPaxPassportHandling: SettingBaseModel.deserialize(apiData.arrivalCrewPaxPassportHandling),
      hangerAvailableUom: SettingBaseModel.deserialize(apiData.hangerAvailableUom),
      luggageHandling: SettingBaseModel.deserialize(apiData.luggageHandling),
      crewLatitudeLongitude: `${apiData.crewLatitude}, ${apiData.crewLongitude}`,
      paxLatitudeLongitude: `${apiData.paxLatitude}, ${apiData.paxLongitude}`,
      aircraftParkingOptionLatitudeLongitude: `${apiData.aircraftParkingOptionLatitude}, ${apiData.aircraftParkingOptionLongitude}`,
      aircraftHandlingLocationLatitudeLongitude: `${apiData.aircraftHandlingLocationLatitude}, ${apiData.aircraftHandlingLocationLongitude}`,
      towbarRequired: SettingBaseModel.deserialize(towbarSetting),
      driverDropOffLocationLatitudeLongitudeCrew: `${apiData.driverDropOffLocationLatCrew}, ${apiData.driverDropOffLocationLonCrew}`,
      driverDropOffLocationLatitudeLongitudePax: `${apiData.driverDropOffLocationLatPax}, ${apiData.driverDropOffLocationLonPax}`,
      appliedDriverDropOffLocationTypeCrew: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedDriverDropOffLocationTypeCrew
      ),
      appliedDriverDropOffLocationTypePax: OperationInsightsSettingOptionModel.deserializeList(
        apiData?.appliedDriverDropOffLocationTypePax
      ),
    };
    return new LocationOperationalInsightsModel(data);
  }

  static deserializeList(
    apiDataList: IAPIResponseVendorLocationOperationalInsights[]
  ): LocationOperationalInsightsModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => LocationOperationalInsightsModel.deserialize(apiData)) : [];
  }

  public serialize(locationId: number) {
    return {
      id: this.id || 0,
      userId: this.userId,
      vendorLocationId: locationId,
      agentFeesApply: this.agentFeesApply,
      aircraftHandlingLocationLatitude: this.aircraftHandlingLocationLatitude,
      aircraftHandlingLocationLongitude: this.aircraftHandlingLocationLongitude,
      aircraftParkingField: this.aircraftParkingField,
      aircraftParkingOptionLatitude: this.aircraftParkingOptionLatitude,
      aircraftParkingOptionLongitude: this.aircraftParkingOptionLongitude,
      arrivalMeetingPoint: this.arrivalMeetingPoint,
      crewLatitude: this.crewLatitude,
      crewLongitude: this.crewLongitude,
      customsClearanceFBO: this.customsClearanceFBO,
      isOvertimeAvailable: this.isOvertimeAvailable,
      leadTimeForOvertime: this.leadTimeForOvertime || null,
      customsClearanceTiming: this.customsClearanceTiming?.toString()?.replace(/^\s*\s*$/, '') || null,
      domesticArrivalProcedures: this.domesticArrivalProcedures?.toString()?.replace(/\s+/gi, ' ') || null,
      domesticDepartureProcedures: this.domesticDepartureProcedures?.toString()?.replace(/\s+/gi, ' ') || null,
      earlyCrewArrival: this.earlyCrewArrival?.toString()?.replace(/^\s*\s*$/, '') || null,
      earlyPaxArrival: this.earlyPaxArrival?.toString()?.replace(/^\s*\s*$/, '') || null,
      hangarAvailable: this.hangarAvailable,
      hangarAvailableSpace: this.hangarAvailableSpace?.toString()?.replace(/^\s*\s*$/, '') || null,
      hangerAvailableUom: this.hangerAvailableUom,
      paxLatitude: this.paxLatitude,
      paxLongitude: this.paxLongitude,
      towbarRequired: this.towbarRequired.name || null,
      towbarRequirement: this.towbarRequirement?.toString()?.replace(/\s+/gi, ' ') || null,
      aircraftParkingDistanceFBOId: this.aircraftParkingDistanceFBO?.id || null,
      hangerAvailableUomId: this.hangerAvailableUom?.id || null,
      arrivalCrewPaxPassportHandlingId: this.arrivalCrewPaxPassportHandling?.id || null,
      luggageHandlingId: this.luggageHandling?.id || null,

      driverDropOffLocationLatCrew: this.driverDropOffLocationLatCrew,
      driverDropOffLocationLonCrew: this.driverDropOffLocationLonCrew,
      driverDropOffLocationLatPax: this.driverDropOffLocationLatPax,
      driverDropOffLocationLonPax: this.driverDropOffLocationLonPax,
      transportationAdditionalInfo: this.transportationAdditionalInfo?.toString()?.replace(/^\s*\s*$/, '') || null,

      appliedCrewLocationType: this.appliedCrewLocationType.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        pickUpLocationId: data?.crewLocationType?.id || 0,
      })),

      appliedPaxLocationType: this.appliedPaxLocationType.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        pickUpLocationId: data?.paxLocationType?.id || 0,
      })),

      appliedAmenities: this.appliedAmenities.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        amenitiesId: data?.amenities?.id || 0,
      })),

      appliedAircraftParkingOptions: this.appliedAircraftParkingOptions.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        aircraftParkingOptionsId: data.aircraftParkingOptions?.id || 0,
      })),

      appliedAircraftSpotAccommodation: this.appliedAircraftSpotAccommodation.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        aircraftSpotAccommodationId: data?.aircraftSpotAccommodation?.id || 0,
      })),

      appliedTowbarScenarios: this.appliedTowbarScenarios.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        towbarScenariosId: data?.towbarScenarios?.id || 0,
      })),

      appliedAvailableFacilities: this.appliedAvailableFacilities.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        availableFacilitiesId: data?.availableFacilities?.id || 0,
      })),

      appliedDisabilityAccommodation: this.appliedDisabilityAccommodation.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        disabilityAccommodationsId: data?.disabilityAccommodations?.id || 0,
      })),

      appliedInternationalArrivalProcedures: this.appliedInternationalArrivalProcedures.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        arrivalProceduresId: data?.internationalArrivalProcedures?.id || 0,
      })),

      appliedInternationalDepartureProcedures: this.appliedInternationalDepartureProcedures.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        internationalDepartureProceduresId: data?.internationalDepartureProcedures?.id || 0,
        otherValue:
          data?.internationalDepartureProcedures?.id === 1 || data?.internationalDepartureProcedures?.id === 2
            ? this.departureProceduresOtherValue?.toString()?.replace(/\s+/gi, ' ') || ''
            : data?.internationalDepartureProcedures?.id === 5
              ? this.otherValue?.toString()?.replace(/\s+/gi, ' ') || ''
              : null,
      })),

      appliedDriverDropOffLocationTypeCrew: this.appliedDriverDropOffLocationTypeCrew.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        pickUpLocationId: data?.driverDropOffLocationTypeCrew?.id || 0,
      })),

      appliedDriverDropOffLocationTypePax: this.appliedDriverDropOffLocationTypePax.map(data => ({
        userId: data.userId || '',
        id: data?.id || 0,
        pickUpLocationId: data?.driverDropOffLocationTypePax?.id || 0,
      })),
    };
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}
