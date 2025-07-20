import {
  CoreModel,
  modelProtection,
  Utilities,
  IdNameCodeModel,
  SettingsTypeModel,
  EntityMapModel,
} from '@wings-shared/core';
import { IAPIAirportOperationalInfo, IAPIAirportOperationalInfoRequest } from '../Interfaces';
import {
  AirportNoiseModel,
  AirportARFFCertificationModel,
  AirportCategoryModel,
  AirportCodeSettingsModel,
  CustomerModel,
  AirportParkingModel,
  AirportFuelModel,
} from './index';

@modelProtection
export class AirportOperationalInfoModel extends CoreModel {
  id: number = 0;
  airportId: number = 0;
  weightLimit: number;
  wingspanLimit: number;
  worldAwareLocationId: number;
  tdWeekdayMorningRushHour: number;
  tdWeekdayAfternoonRushHour: number;
  tdWeekend: number;
  allOtherTimes: number;
  isGAFriendly: boolean = null;
  isMandatoryHandling: boolean = null;
  isForeignBasedEntity: boolean = false;
  isRuralAirport: boolean = false;
  isDesignatedPointOfEntry: boolean = false;
  unattended: boolean = null;
  airportDiagramBlobUrl: string = '';
  commercialTerminalAddress: string = '';
  airportCategory: AirportCategoryModel;
  weatherReportingSystem: AirportCodeSettingsModel;
  airportARFFCertification: AirportARFFCertificationModel;
  metro: SettingsTypeModel;
  weightUOM: SettingsTypeModel;
  jurisdiction: IdNameCodeModel;
  customers: CustomerModel[];
  airportA2GAgentProfileBlobUrl: string = '';
  airportDiagramBlobAccessTokenUrl: string = '';
  airportA2GAgentProfileBlobAccessTokenUrl: string = '';
  noise: AirportNoiseModel;
  fuel: AirportFuelModel;
  isOwnTowbarRequired: boolean = null;
  appliedLargeAircraftRestrictions: EntityMapModel[];
  airportParking: AirportParkingModel;

  constructor(data?: Partial<AirportOperationalInfoModel>) {
    super(data);
    Object.assign(this, data);
    this.airportCategory = data?.airportCategory ? new AirportCategoryModel(data?.airportCategory) : null;
    this.weatherReportingSystem = data?.weatherReportingSystem
      ? new AirportCodeSettingsModel(data?.weatherReportingSystem)
      : null;
    this.airportARFFCertification = data?.airportARFFCertification
      ? new AirportARFFCertificationModel(data?.airportARFFCertification)
      : null;
    this.metro = data?.metro ? new SettingsTypeModel(data?.metro) : null;
    this.weightUOM = data?.weightUOM ? new SettingsTypeModel(data?.weightUOM) : null;
    this.jurisdiction = data?.jurisdiction ? new IdNameCodeModel(data?.jurisdiction) : null;
    this.customers = data?.customers?.map(x => new CustomerModel(x)) || [];
    this.noise = new AirportNoiseModel(data?.noise);
    this.fuel = data?.fuel ? new AirportFuelModel(data?.fuel) : null;
    this.airportParking = data?.airportParking ? new AirportParkingModel(data?.airportParking) : null;
  }

  static deserialize(apiData: IAPIAirportOperationalInfo): AirportOperationalInfoModel {
    if (!apiData) {
      return new AirportOperationalInfoModel();
    }
    const data: Partial<AirportOperationalInfoModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportOperationalInfoId || apiData.id,
      airportId: apiData.airportId,
      worldAwareLocationId: apiData.worldAwareLocation?.worldAwareLocationId,
      weightLimit: apiData.weightLimit,
      wingspanLimit: apiData.wingspanLimit,
      tdWeekdayMorningRushHour: apiData.tdWeekdayMorningRushHour,
      tdWeekdayAfternoonRushHour: apiData.tdWeekdayAfternoonRushHour,
      tdWeekend: apiData.tdWeekend,
      allOtherTimes: apiData.allOtherTimes,
      isGAFriendly: apiData.isGAFriendly,
      isRuralAirport: apiData.isRuralAirport,
      unattended: apiData.unattended,
      isForeignBasedEntity: apiData.isForeignBasedEntity,
      isMandatoryHandling: apiData.isMandatoryHandling,
      airportA2GAgentProfileBlobAccessTokenUrl: apiData.airportA2GAgentProfileBlobAccessTokenUrl,
      commercialTerminalAddress: apiData.commercialTerminalAddress,
      airportCategory: apiData.airportCategory
        ? new AirportCategoryModel({
          ...apiData.airportCategory,
          id: apiData.airportCategory?.airportCategoryId || apiData.airportCategory?.id,
        })
        : null,
      airportARFFCertification: AirportARFFCertificationModel.deserialize(apiData.airportARFFCertification),
      weatherReportingSystem: apiData.weatherReportingSystem
        ? new AirportCodeSettingsModel({
          ...apiData.weatherReportingSystem,
          id: apiData.weatherReportingSystem?.weatherReportingSystemId || apiData.weatherReportingSystem?.id,
        })
        : null,
      customers: CustomerModel.deserializeList(apiData.customers),
      jurisdiction: IdNameCodeModel.deserialize({
        ...apiData?.jurisdiction,
        id: apiData.jurisdiction?.jurisdictionId || apiData.jurisdiction?.id,
      }),
      metro: SettingsTypeModel.deserialize({ ...apiData?.metro, id: apiData.metro?.metroId || apiData.metro?.id }),
      weightUOM: SettingsTypeModel.deserialize({
        ...apiData?.weightUOM,
        id: apiData.weightUOM?.weightUOMId || apiData.weightUOM?.id,
      }),
      airportA2GAgentProfileBlobUrl: apiData.airportA2GAgentProfileBlobUrl,
      noise: AirportNoiseModel.deserialize(apiData.noise),
      fuel: apiData.fuel ? AirportFuelModel.deserialize(apiData.fuel) : null,
      appliedLargeAircraftRestrictions: apiData.appliedLargeAircraftRestrictions?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.largeAircraftRestriction.largeAircraftRestrictionId,
            name: entity.largeAircraftRestriction.name,
          })
      ),
      airportParking: AirportParkingModel.deserialize(apiData.airportParking),
    };
    return new AirportOperationalInfoModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportOperationalInfoRequest {
    return {
      id: this.id,
      airportId: this.airportId,
      airportCategoryId: this.airportCategory?.id || null,
      weatherReportingSystemId: this.weatherReportingSystem?.id || null,
      worldAwareLocationId: Utilities.getNumberOrNullValue(this.worldAwareLocationId),
      weightLimit: Utilities.getNumberOrNullValue(this.weightLimit),
      wingspanLimit: Utilities.getNumberOrNullValue(this.wingspanLimit),
      tdWeekdayMorningRushHour: Utilities.getNumberOrNullValue(this.tdWeekdayMorningRushHour),
      tdWeekdayAfternoonRushHour: Utilities.getNumberOrNullValue(this.tdWeekdayAfternoonRushHour),
      tdWeekend: Utilities.getNumberOrNullValue(this.tdWeekend),
      allOtherTimes: Utilities.getNumberOrNullValue(this.allOtherTimes),
      isGAFriendly: this.isGAFriendly,
      isRuralAirport: this.isRuralAirport || false,
      isDesignatedPointOfEntry: this.isDesignatedPointOfEntry || false,
      unattended: this.unattended,
      isMandatoryHandling: this.isMandatoryHandling,
      isForeignBasedEntity: this.isForeignBasedEntity || false,
      commercialTerminalAddress: this.commercialTerminalAddress,
      airportARFFCertification: this.airportARFFCertification ? this.airportARFFCertification.serialize() : null,
      metroId: this.metro?.id || null,
      weightUOMId: this.weightUOM?.id || null,
      metroName: this.metro?.name,
      jurisdictionId: this.jurisdiction?.id || null,
      jurisdictionCode: this.jurisdiction?.code,
      jurisdictionName: this.jurisdiction?.name,
      customers: this.customers?.map(c => c.serialize()),
      airportA2GAgentProfileBlobUrl: this.airportA2GAgentProfileBlobUrl,
      noise: this.noise.serialize(),
      fuel: this.fuel ? this.fuel.serialize() : null,
      isOwnTowbarRequired: this.isOwnTowbarRequired,
      appliedLargeAircraftRestrictions: this.appliedLargeAircraftRestrictions?.map(entity => ({
        id: entity.id || 0,
        largeAircraftRestrictionId: entity.entityId,
      })),
      airportParking: this.airportParking ? this.airportParking.serialize() : null,
    };
  }

  static deserializeList(apiData: IAPIAirportOperationalInfo[]): AirportOperationalInfoModel[] {
    return apiData
      ? apiData.map((data: IAPIAirportOperationalInfo) => AirportOperationalInfoModel.deserialize(data))
      : [];
  }
}
