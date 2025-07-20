import { LatLongCoordinateModel } from '@wings/shared';
import {
  CoreModel,
  IAPIErrors,
  modelProtection,
  SourceTypeModel,
  Utilities,
  IdNameCodeModel,
  EntityMapModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPIAirport, IAPIAirportRequest } from '../Interfaces';
import {
  AirportFlightPlanInfoModel,
  AirportLocationModel,
  AirportManagementModel,
  AirportOperationalInfoModel,
  ICAOCodeModel,
  MilitaryUseTypeModel,
  AirportRunwayModel,
  AirportFrequencyModel,
  AirportTimezoneModel,
  AirportCustomModel,
  AirportCodeSettingsModel,
  AirportSecurityModel,
  AirportCustomGeneralModel,
  IntlCustomsDetailsModel,
  CustomsDetailInfoModel,
  UsCustomsDetailsModel,
  CustomsContactModel,
  VendorLocationModel,
} from '../Models';

@modelProtection
export class AirportModel extends CoreModel {
  id: number = 0;
  icaoCode: ICAOCodeModel;
  uwaCode: string = '';
  iataCode: string = '';
  faaCode: string = '';
  regionalCode: string = '';
  name: string = '';
  displayCode: string = '';
  cappsAirportName: string = '';
  sourceLocationId: string = '';
  inactiveReason: string = '';
  isTopUsageAirport: boolean = false;
  militaryUseTypeId: number;
  latitudeCoordinate: LatLongCoordinateModel;
  longitudeCoordinate: LatLongCoordinateModel;
  primaryRunway: AirportRunwayModel;
  airportOfEntry: IdNameCodeModel;
  militaryUseType: MilitaryUseTypeModel;
  airportDataSource: SettingsTypeModel;
  airportFacilityType: SettingsTypeModel;
  airportFacilityAccessLevel: SettingsTypeModel;
  appliedAirportType: EntityMapModel;
  appliedAirportUsageType: EntityMapModel[];
  airportLocation: AirportLocationModel;
  airportManagement: AirportManagementModel;
  airportFlightPlanInfo: AirportFlightPlanInfoModel;
  airportOperationalInfo: AirportOperationalInfoModel;
  airportSecurity: AirportSecurityModel;
  runways: AirportRunwayModel[];
  airportFrequencies: AirportFrequencyModel[];
  timezoneInformation: AirportTimezoneModel;
  customs: AirportCustomModel;

  // implemented as per 157223 to bind customs data from SQL
  customsGeneralInfo: AirportCustomGeneralModel;
  customsNonUsInfo: IntlCustomsDetailsModel;
  customsDetail: CustomsDetailInfoModel;
  customsUsInfo: UsCustomsDetailsModel;
  customsContacts: CustomsContactModel[];

  hasErrors: boolean;
  vendorLocations: VendorLocationModel[];
  // Validation Fields
  errors: IAPIErrors[] = [];

  //implemented as per 132543
  uwaAirportCode: AirportCodeSettingsModel;
  regionalAirportCode: AirportCodeSettingsModel;

  constructor(data?: Partial<AirportModel>) {
    super(data);
    Object.assign(this, data);
    this.latitudeCoordinate = data?.latitudeCoordinate ? new LatLongCoordinateModel(data?.latitudeCoordinate) : null;
    this.longitudeCoordinate = data?.longitudeCoordinate ? new LatLongCoordinateModel(data?.longitudeCoordinate) : null;
    this.primaryRunway = data?.primaryRunway ? new AirportRunwayModel(data?.primaryRunway) : null;
    this.airportOfEntry = data?.airportOfEntry ? new IdNameCodeModel(data?.airportOfEntry) : null;
    this.airportDataSource = data?.airportDataSource ? new SettingsTypeModel(data?.airportDataSource) : null;
    this.airportFacilityType = data?.airportFacilityType ? new SettingsTypeModel(data?.airportFacilityType) : null;
    this.airportFacilityAccessLevel = data?.airportFacilityAccessLevel
      ? new SettingsTypeModel(data?.airportFacilityAccessLevel)
      : null;
    this.appliedAirportType = data?.appliedAirportType ? new EntityMapModel(data?.appliedAirportType) : null;
    this.appliedAirportUsageType = data?.appliedAirportUsageType?.map(usageType => new EntityMapModel(usageType));
    this.airportLocation = new AirportLocationModel(data?.airportLocation);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
    this.icaoCode = data?.icaoCode ? new ICAOCodeModel(data?.icaoCode) : null;
    this.militaryUseType = data?.militaryUseType ? new MilitaryUseTypeModel(data?.militaryUseType) : null;
    this.airportManagement = data?.airportManagement ? new AirportManagementModel(data?.airportManagement) : null;
    this.airportFlightPlanInfo = data?.airportFlightPlanInfo
      ? new AirportFlightPlanInfoModel(data?.airportFlightPlanInfo)
      : null;
    this.airportOperationalInfo = data?.airportOperationalInfo
      ? new AirportOperationalInfoModel(data?.airportOperationalInfo)
      : null;
    this.airportSecurity = data?.airportSecurity ? new AirportSecurityModel(data?.airportSecurity) : null;
    this.runways = data?.runways?.map(a => new AirportRunwayModel(a)) || [];
    this.airportFrequencies = data?.airportFrequencies?.map(a => new AirportFrequencyModel(a)) || [];
    this.timezoneInformation = data?.timezoneInformation ? new AirportTimezoneModel(data?.timezoneInformation) : null;
    this.customs = data?.customs ? new AirportCustomModel(data?.customs) : null;
    this.uwaAirportCode = data?.uwaAirportCode ? new AirportCodeSettingsModel(data?.uwaAirportCode) : null;
    this.regionalAirportCode = data?.regionalAirportCode
      ? new AirportCodeSettingsModel(data?.regionalAirportCode)
      : null;
    this.vendorLocations = data?.vendorLocations ? data?.vendorLocations?.map(a => new VendorLocationModel(a)) : [];
  }

  /**
   * if there is an error for any code ICAO|UWA|regional Code
   */
  public get hasError(): boolean {
    return Boolean(this.errors?.length);
  }

  static deserialize(apiData: IAPIAirport): AirportModel {
    if (!apiData) {
      return new AirportModel();
    }
    const runways = AirportRunwayModel.deserializeList(apiData.runways);
    const data: Partial<AirportModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportId || apiData.id,
      icaoCode: apiData.icaoCode ? ICAOCodeModel.deserialize(apiData.icaoCode) : null,
      uwaAirportCode: apiData.uwaAirportCode
        ? new AirportCodeSettingsModel({
          ...apiData.uwaAirportCode,
          id: apiData.uwaAirportCode.uwaAirportCodeId || apiData.uwaAirportCode.id,
        })
        : null,
      regionalAirportCode: apiData.regionalAirportCode
        ? new AirportCodeSettingsModel({
          ...apiData.regionalAirportCode,
          id: apiData.regionalAirportCode.regionalAirportCodeId || apiData.regionalAirportCode.id,
        })
        : null,
      uwaCode: apiData.uwaCode,
      iataCode: apiData.iataCode,
      name: apiData.name,
      displayCode: apiData.displayCode,
      cappsAirportName: apiData.cappsAirportName,
      sourceLocationId: apiData.sourceLocationId,
      faaCode: apiData.faaCode,
      regionalCode: apiData.regionalCode,
      latitudeCoordinate: LatLongCoordinateModel.deserialize({
        ...apiData.latitudeCoordinate,
        latitude: apiData.latitudeCoordinate?.latitude,
      }),
      longitudeCoordinate: LatLongCoordinateModel.deserialize({
        ...apiData.longitudeCoordinate,
        longitude: apiData.longitudeCoordinate?.longitude,
      }),
      isTopUsageAirport: apiData.isTopUsageAirport,
      inactiveReason: apiData.inactiveReason,
      primaryRunway: AirportRunwayModel.deserialize({
        ...apiData.primaryRunway,
        id: apiData.primaryRunway?.primaryRunwayId || 0,
      }),
      airportOfEntry: apiData.airportOfEntry
        ? new IdNameCodeModel({
          ...apiData.airportOfEntry,
          id: apiData.airportOfEntry?.airportOfEntryId || apiData.airportOfEntry?.id,
        })
        : null,
      airportDataSource: apiData.airportDataSource
        ? new SettingsTypeModel({
          ...apiData.airportDataSource,
          id: apiData.airportDataSource?.airportDataSourceId || apiData.airportDataSource?.id,
        })
        : null,
      airportFacilityType: apiData.airportFacilityType
        ? new SettingsTypeModel({
          ...apiData.airportFacilityType,
          id: apiData.airportFacilityType?.airportFacilityTypeId || apiData.airportFacilityType?.id,
        })
        : null,
      airportFacilityAccessLevel: apiData.airportFacilityAccessLevel
        ? new SettingsTypeModel({
          ...apiData.airportFacilityAccessLevel,
          id:
              apiData.airportFacilityAccessLevel?.airportFacilityAccessLevelId ||
              apiData.airportFacilityAccessLevel?.id,
        })
        : null,
      appliedAirportType: apiData.appliedAirportType?.length
        ? new EntityMapModel({
          ...apiData.appliedAirportType[0],
          id: apiData.appliedAirportType[0]?.appliedAirportTypeId || apiData.appliedAirportType[0]?.id,
          entityId: apiData.appliedAirportType[0]?.airportType?.airportTypeId,
          name: apiData.appliedAirportType[0]?.airportType?.name,
        })
        : null,
      militaryUseType: apiData.militaryUseType
        ? new MilitaryUseTypeModel({
          ...apiData.militaryUseType,
          id: apiData.militaryUseType.militaryUseTypeId || apiData.militaryUseType.id,
        })
        : null,
      appliedAirportUsageType: apiData.appliedAirportUsageType?.map(
        entity =>
          new EntityMapModel({
            id: entity.id,
            entityId: entity.airportUsageType?.airportUsageTypeId || entity.airportUsageType?.id,
            name: entity.airportUsageType?.name,
          })
      ),
      runways,
      airportLocation: AirportLocationModel.deserialize(apiData.airportLocation),
      airportManagement: AirportManagementModel.deserialize(apiData.airportManagement),
      airportFlightPlanInfo: AirportFlightPlanInfoModel.deserialize(apiData.airportFlightPlanInfo),
      airportOperationalInfo: AirportOperationalInfoModel.deserialize(apiData.airportOperationalInfo),
      airportSecurity: AirportSecurityModel.deserialize(apiData.airportSecurity),
      airportFrequencies: AirportFrequencyModel.deserializeList(apiData.airportFrequencies, runways),
      timezoneInformation: AirportTimezoneModel.deserialize(apiData.currentTimezone),
      sourceType: apiData.sourceType ? SourceTypeModel.deserialize(apiData.sourceType) : null,
      customs: apiData.customs ? AirportCustomModel.deserialize(apiData?.customs) : null,
      vendorLocations: apiData.vendorLocations ? VendorLocationModel.deserializeList(apiData?.vendorLocations) : [],
      errors: apiData.errors,
    };
    return new AirportModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportRequest {
    return {
      id: this.id,
      icaoCodeId: this.icaoCode?.id,
      uwaAirportCodeId: this.uwaAirportCode?.id,
      regionalAirportCodeId: this.regionalAirportCode?.id,
      uwaCode: this.uwaCode,
      iataCode: this.iataCode,
      name: this.name,
      cappsAirportName: this.cappsAirportName,
      sourceLocationId: this.sourceLocationId,
      faaCode: this.faaCode,
      regionalCode: this.regionalCode,
      inactiveReason: this.inactiveReason,
      isTopUsageAirport: this.isTopUsageAirport || false,
      latitude: Utilities.getNumberOrNullValue(this.latitudeCoordinate.latitude),
      longitude: Utilities.getNumberOrNullValue(this.longitudeCoordinate.longitude),
      airportDataSourceId: this.airportDataSource?.id || null,
      primaryRunwayId: this.primaryRunway?.id || null,
      airportOfEntryId: this.airportOfEntry?.id || null,
      airportFacilityTypeId: this.airportFacilityType?.id || null,
      airportFacilityAccessLevelId: this.airportFacilityAccessLevel?.id || null,
      appliedAirportType: this.appliedAirportType
        ? [
          {
            id: this.appliedAirportType.id,
            airportTypeId: this.appliedAirportType.entityId,
            name: this.appliedAirportType.name,
            airportId: this.id, // Current Airport Id
          },
        ]
        : [],
      appliedAirportUsageType: this.appliedAirportUsageType?.map(entity => {
        return {
          id: entity.id,
          airportUsageTypeId: entity.entityId,
          airportId: this.id, // Current Airport Id
        };
      }),
      airportLocation: this.airportLocation?.serialize(),
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || null,
      militaryUseTypeId: this.militaryUseType?.id,
    };
  }

  static deserializeList(apiData: IAPIAirport[]): AirportModel[] {
    return apiData ? apiData.map((data: IAPIAirport) => AirportModel.deserialize(data)) : [];
  }

  // title for edit screen
  public get title(): string {
    const code = this.icaoCode?.label || this.uwaCode || this.iataCode || this.faaCode || this.regionalCode;
    return [ code, this.name ]
      .filter(x => x)
      .join(' - ')
      .toString();
  }
}
