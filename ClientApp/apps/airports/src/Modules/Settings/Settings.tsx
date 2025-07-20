import React, { Component, ReactNode } from 'react';
import { Typography, withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { CappsCategory, UpsertSettings } from '@wings/shared';
import { action, observable } from 'mobx';
import { AirportSettingsStore } from '../Shared/Stores';
import {
  ConditionalOperator,
  AirportHoursSubType,
  ConditionType,
  AirportHoursBuffer,
  ICAOCode,
  AirportHourRemark,
  MilitaryUseType,
  RunwaySettings,
  AirportCodeSettings,
  AirportCategory,
  AirportOfEntry,
  RunwaySurfaceType,
  RunwayLightType,
  AirportCode,
  DestinationAlternateTypeOfFlight,
  FlightType,
  ConditionTypeConfig,
} from './Components';
import { categoryList, settingList } from './Fields';
import { AIRPORT_CODE_TYPES, SETTING_CATEGORIES, SETTING_ID } from '../Shared';
import { styles } from './Settings.style';
import { ModeStore } from '@wings-shared/mode-store';
import { IClasses, SelectOption, regex } from '@wings-shared/core';
import { SettingCategoryControl } from '@wings-shared/form-controls';
import { SettingsModuleSecurity } from '@wings-shared/security';

interface Props {
  classes?: IClasses;
  airportSettingsStore?: AirportSettingsStore;
}
@inject('airportSettingsStore')
@observer
class Settings extends Component<Props> {
  @observable private activeCategory: number = SETTING_CATEGORIES.GENERAL;
  @observable private activeSubCategory: number = SETTING_ID.SOURCE_TYPE;
  // hidden settings under dev Mode
  private readonly hiddenCategories: number[] = [];

  @action
  private setActiveCategory(categoryID: number): void {
    this.activeCategory = categoryID;
    this.setActiveSubCategory(this.subCategories[0].value as number);
  }

  @action
  private setActiveSubCategory(categoryID: number): void {
    this.activeSubCategory = categoryID;
  }

  // show category in DEV mode only
  private isCategoryVisible(categoryId: SETTING_CATEGORIES): boolean {
    if (ModeStore.isDevModeEnabled) {
      return true;
    }
    return !this.hiddenCategories.includes(categoryId);
  }

  private get subCategories(): SelectOption[] {
    return settingList
      .filter(setting => setting.categoryId === this.activeCategory)
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  }

  private renderSetting(): ReactNode {
    const { airportSettingsStore } = this.props;
    const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
    switch (this.activeSubCategory) {
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            type="Source Type"
            key="sourceType"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertSourceType(data)}
            getSettings={() => _airportSettingsStore.getSourceTypes()}
            settingsData={_airportSettingsStore.sourceTypes}
          />
        );
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            type="Access Level"
            key="accessLevel"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertAccessLevel(data)}
            getSettings={() => _airportSettingsStore.getAccessLevels()}
            settingsData={_airportSettingsStore.accessLevels}
          />
        );
      case SETTING_ID.DISTANCE_UOM:
        return (
          <UpsertSettings
            type="Distance UOM"
            key="distanceUOM"
            upsertSettings={data => _airportSettingsStore.upsertDistanceUOM(data)}
            getSettings={() => _airportSettingsStore.loadDistanceUOMs()}
            settingsData={_airportSettingsStore.distanceUOMs}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_TYPE:
        return (
          <UpsertSettings
            type="Airport Type"
            key="airportType"
            upsertSettings={data => _airportSettingsStore.upsertAirportType(data)}
            getSettings={() => _airportSettingsStore.loadAirportTypes()}
            settingsData={_airportSettingsStore.airportTypes}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_FACILITY_TYPE:
        return (
          <UpsertSettings
            type="Airport Facility Type"
            key="airportFacilityType"
            upsertSettings={data => _airportSettingsStore.upsertAirportFacilityType(data)}
            getSettings={() => _airportSettingsStore.loadAirportFacilityTypes()}
            settingsData={_airportSettingsStore.airportFacilityTypes}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_DIRECTION:
        return (
          <UpsertSettings
            type="Airport Direction"
            key="airportDirection"
            upsertSettings={data => _airportSettingsStore.upsertAirportDirection(data)}
            getSettings={() => _airportSettingsStore.loadAirportDirections()}
            settingsData={_airportSettingsStore.airportDirections}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_USAGE_TYPE:
        return (
          <UpsertSettings
            type="Airport Usage Type"
            key="airportUsageType"
            upsertSettings={data => _airportSettingsStore.upsertAirportUsageType(data)}
            getSettings={() => _airportSettingsStore.loadAirportUsageTypes()}
            settingsData={_airportSettingsStore.airportUsageTypes}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_FACILITY_ACCESS_LEVEL:
        return (
          <UpsertSettings
            type="Airport Facility Access Level"
            key="airportFacilityAccessLevel"
            upsertSettings={data => _airportSettingsStore.upsertAirportFacilityAccessLevel(data)}
            getSettings={() => _airportSettingsStore.loadAirportFacilityAccessLevels()}
            settingsData={_airportSettingsStore.airportFacilityAccessLevels}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.OFFICIAL_ICAO_CODE:
        return <ICAOCode />;
      case SETTING_ID.MILITARY_USE_TYPE:
        return <MilitaryUseType />;
      case SETTING_ID.AIRPORT_DATA_SOURCE:
        return (
          <UpsertSettings
            type="Airport Data Source"
            key="airportDataSource"
            upsertSettings={data => _airportSettingsStore.upsertAirportDataSource(data)}
            getSettings={() => _airportSettingsStore.loadAirportDataSources()}
            settingsData={_airportSettingsStore.airportDataSources}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.AIRPORT_HOUR_TYPE:
        return (
          <UpsertSettings
            type="Airport Hour Type"
            key="airportHourType"
            upsertSettings={data => _airportSettingsStore.upsertAirportHourTypes(data)}
            getSettings={() => _airportSettingsStore.loadAirportHourTypes()}
            settingsData={_airportSettingsStore.airportHourTypes}
            isNameUnique={false}
            isEditable={false}
          />
        );
      case SETTING_ID.AIRPORT_HOUR_SUB_TYPE:
        return <AirportHoursSubType />;
      case SETTING_ID.AIRPORT_HOUR_REMARK:
        return <AirportHourRemark />;
      case SETTING_ID.CONDITION_TYPE:
        return <ConditionType />;
      case SETTING_ID.CONDITIONAL_OPERATOR:
        return <ConditionalOperator isEditable={false} />;
      case SETTING_ID.AIRPORT_HOURS_BUFFER:
        return <AirportHoursBuffer />;
      case SETTING_ID.RUNWAY_SURFACE_TYPE:
        return <RunwaySurfaceType />;
      case SETTING_ID.RUNWAY_CONDITION:
        return (
          <RunwaySettings
            type="Condition"
            key="runwayCondition"
            upsertSettings={data => _airportSettingsStore.upsertRunwayCondition(data)}
            getSettings={() => _airportSettingsStore.loadRunwayConditions()}
          />
        );
      case SETTING_ID.RUNWAY_SURFACE_TREATMENT:
        return (
          <RunwaySettings
            type="Surface Treatment"
            key="runwaySurfaceTreatment"
            upsertSettings={data => _airportSettingsStore.upsertRunwaySurfaceTreatment(data)}
            getSettings={() => _airportSettingsStore.loadRunwaySurfaceTreatments()}
          />
        );
      case SETTING_ID.RUNWAY_LIGHT_TYPE:
        return <RunwayLightType />;
      case SETTING_ID.RUNWAY_RVR:
        return (
          <RunwaySettings
            type="RVR"
            key="runwayRVR"
            upsertSettings={data => _airportSettingsStore.upsertRunwayRVR(data)}
            getSettings={() => _airportSettingsStore.loadRunwayRVR()}
          />
        );
      case SETTING_ID.RUNWAY_APPROACH_LIGHT:
        return (
          <RunwaySettings
            type="Approach Light"
            key="runwayApproachLight"
            upsertSettings={data => _airportSettingsStore.upsertRunwayApproachLight(data)}
            getSettings={() => _airportSettingsStore.loadRunwayApproachLight()}
          />
        );
      case SETTING_ID.RUNWAY_VGSI:
        return (
          <RunwaySettings
            type="VGSI"
            key="runwayVGSI"
            upsertSettings={data => _airportSettingsStore.upsertRunwayVGSI(data)}
            getSettings={() => _airportSettingsStore.loadRunwayVGSI()}
          />
        );
      case SETTING_ID.WEATHER_REPORTING_SYSTEM:
        return (
          <AirportCodeSettings
            type="Weather Reporting System"
            key="airportWeatherReportingSystem"
            codeLength={10}
            upsertSettings={data => _airportSettingsStore.upsertWeatherReportingSystem(data)}
            getSettings={() => _airportSettingsStore.loadWeatherReportingSystem()}
          />
        );
      case SETTING_ID.AIRPORT_CLASS_CODE:
        return (
          <AirportCodeSettings
            type="Class Code"
            key="airportClassCode"
            codeLength={4}
            upsertSettings={data => _airportSettingsStore.upsertClassCode(data)}
            getSettings={() => _airportSettingsStore.loadClassCode()}
          />
        );
      case SETTING_ID.AIRPORT_CERTIFICATE_CODE:
        return (
          <AirportCodeSettings
            type="Certificate Code"
            key="airportCertificateCode"
            upsertSettings={data => _airportSettingsStore.upsertCertificateCode(data)}
            getSettings={() => _airportSettingsStore.loadCertificateCode()}
          />
        );
      case SETTING_ID.AIRPORT_SERVICE_CODE:
        return (
          <AirportCodeSettings
            type="Service Code"
            key="airportServiceCode"
            upsertSettings={data => _airportSettingsStore.upsertServiceCode(data)}
            getSettings={() => _airportSettingsStore.loadServiceCode()}
          />
        );
      case SETTING_ID.AIRPORT_OF_ENTRY:
        return <AirportOfEntry />;
      case SETTING_ID.AIRPORT_CATEGORY:
        return <AirportCategory />;
      case SETTING_ID.RUNWAY_NAVAIDS:
        return (
          <RunwaySettings
            type="Navaids"
            key="RUNWAY_NAVAIDS"
            upsertSettings={data => _airportSettingsStore.upsertRunwayNavaids(data)}
            getSettings={() => _airportSettingsStore.loadRunwayNavaids()}
            codeLength={13} // updated as per 93984
          />
        );
      case SETTING_ID.RUNWAY_APPROACH_TYPE:
        return (
          <RunwaySettings
            type="ILS Approach Type"
            key="RUNWAY_APPROACH_TYPE"
            upsertSettings={data => _airportSettingsStore.upsertRunwayApproachType(data)}
            getSettings={() => _airportSettingsStore.loadRunwayApproachType()}
          />
        );
      case SETTING_ID.RUNWAY_USAGE_TYPE:
        return (
          <UpsertSettings
            type="Usage Type"
            key="runwayUsageType"
            upsertSettings={data => _airportSettingsStore.upsertRunwayUsageType(data)}
            getSettings={() => _airportSettingsStore.loadRunwayUsageTypes()}
            settingsData={_airportSettingsStore.runwayUsageTypes}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.FREQUENCY_TYPE:
        return (
          <UpsertSettings
            type="Frequency Type"
            key="frequencyType"
            upsertSettings={data => _airportSettingsStore.upsertFrequencyType(data)}
            getSettings={() => _airportSettingsStore.loadFrequencyTypes()}
            settingsData={_airportSettingsStore.frequencyTypes}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.SECTOR:
        return (
          <UpsertSettings
            type="Sector"
            key="sector"
            upsertSettings={data => _airportSettingsStore.upsertSector(data)}
            getSettings={() => _airportSettingsStore.loadSectors()}
            settingsData={_airportSettingsStore.sectors}
            isEditable={false}
            ignoreNumber={true}
            maxLength={20}
          />
        );
      case SETTING_ID.BULLETIN_LEVEL:
        return (
          <UpsertSettings
            isEditable={false}
            type="Bulletin Level"
            key="bulletinLevel"
            upsertSettings={data => _airportSettingsStore.upsertBulletinLevels(data)}
            getSettings={() => _airportSettingsStore.getBulletinLevels()}
            settingsData={_airportSettingsStore.bulletinLevels}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.BULLETIN_TYPE:
        return (
          <UpsertSettings
            isEditable={true}
            type="Bulletin Type"
            key="bulletinType"
            upsertSettings={data => _airportSettingsStore.upsertBulletinTypes(data)}
            getSettings={() => _airportSettingsStore.getBulletinTypes()}
            settingsData={_airportSettingsStore.bulletinTypes}
          />
        );
      case SETTING_ID.BULLETIN_SOURCE:
        return (
          <UpsertSettings
            isEditable={false}
            type="Bulletin Source"
            key="source"
            upsertSettings={data => _airportSettingsStore.upsertSources(data)}
            getSettings={() => _airportSettingsStore.getSources()}
            settingsData={_airportSettingsStore.sources}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.BULLETIN_PRIORITY:
        return (
          <UpsertSettings
            isEditable={false}
            type="Bulletin Priority"
            key="bulletinPriority"
            upsertSettings={data => _airportSettingsStore.upsertBulletinPriorities(data)}
            getSettings={() => _airportSettingsStore.getBulletinPriorities()}
            settingsData={_airportSettingsStore.bulletinPriorities}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.CAPPS_CATEGORY_CODE:
        return <CappsCategory isSettingsEditable={SettingsModuleSecurity.isEditable} />;
      case SETTING_ID.FUEL_TYPE:
        return (
          <UpsertSettings
            type="Fuel Type"
            key="fuelType"
            upsertSettings={data => _airportSettingsStore.upsertFuelTypes(data)}
            getSettings={() => _airportSettingsStore.loadFuelTypes()}
            settingsData={_airportSettingsStore.fuelTypes}
            regExp={regex.all}
          />
        );
      case SETTING_ID.OIL_TYPE:
        return (
          <UpsertSettings
            type="Oil Type"
            key="oilType"
            upsertSettings={data => _airportSettingsStore.upsertOilTypes(data)}
            getSettings={() => _airportSettingsStore.loadOilTypes()}
            settingsData={_airportSettingsStore.oilTypes}
            regExp={regex.all}
          />
        );
      case SETTING_ID.AREA_PORT_ASSIGNMENT:
        return (
          <UpsertSettings
            type="Area Port Assignment"
            key="areaPortAssignment"
            upsertSettings={data => _airportSettingsStore.upsertAreaPortAssignment(data)}
            getSettings={() => _airportSettingsStore.loadAreaPortAssignments()}
            settingsData={_airportSettingsStore.areaPortAssignments}
            regExp={regex.all}
          />
        );
      case SETTING_ID.REQUIRED_INFORMATION_TYPE:
        return (
          <UpsertSettings
            type="Required Information Type"
            key="requiredInformationType"
            upsertSettings={data => _airportSettingsStore.upsertRequiredInformationType(data)}
            getSettings={() => _airportSettingsStore.loadRequiredInformationTypes()}
            settingsData={_airportSettingsStore.requiredInformationTypes}
          />
        );
      case SETTING_ID.FIELD_OFFICE_OVERSIGHT:
        return (
          <UpsertSettings
            type="Field Office Oversight"
            key="fieldOfficeOversight"
            upsertSettings={data => _airportSettingsStore.upsertFieldOfficeOversight(data)}
            getSettings={() => _airportSettingsStore.loadFieldOfficeOversights()}
            settingsData={_airportSettingsStore.fieldOfficeOversights}
            regExp={regex.all}
          />
        );
      case SETTING_ID.CUSTOMS_LOCATION_INFORMATION:
        return (
          <UpsertSettings
            type="Customs Location Information"
            key="customsLocationInformation"
            upsertSettings={data => _airportSettingsStore.upsertCustomsLocationInformation(data)}
            getSettings={() => _airportSettingsStore.loadCustomsLocationInformation()}
            settingsData={_airportSettingsStore.customsLocationInformation}
          />
        );
      case SETTING_ID.MAX_POB_OPTION:
        return (
          <UpsertSettings
            type="Max POB Option"
            key="maxPOBOption"
            upsertSettings={data => _airportSettingsStore.upsertMaxPOBOption(data)}
            getSettings={() => _airportSettingsStore.loadMaxPOBOptions()}
            settingsData={_airportSettingsStore.maxPOBOptions}
          />
        );
      case SETTING_ID.CBP_PORT_TYPE:
        return (
          <UpsertSettings
            type="CBP Port Type"
            key="cbpPortType"
            upsertSettings={data => _airportSettingsStore.upsertCbpPortType(data)}
            getSettings={() => _airportSettingsStore.loadCbpPortTypes()}
            settingsData={_airportSettingsStore.cbpPortTypes}
          />
        );
      case SETTING_ID.VISA_TIMING:
        return (
          <UpsertSettings
            type="Visa Timing"
            key="visaTiming"
            upsertSettings={data => _airportSettingsStore.upsertVisaTiming(data)}
            getSettings={() => _airportSettingsStore.loadVisaTimings()}
            settingsData={_airportSettingsStore.visaTimings}
          />
        );
      case SETTING_ID.UWA_CODE:
        return (
          <AirportCode
            key="uwaCode"
            codeType={AIRPORT_CODE_TYPES.UWA_CODE}
            headerName="UWA Code"
            upsertSettings={data => _airportSettingsStore.upsertUwaCode(data)}
          />
        );
      case SETTING_ID.REGIONAL_CODE:
        return (
          <AirportCode
            key="regionalCode"
            codeType={AIRPORT_CODE_TYPES.REGIONAL_CODE}
            headerName="Regional Code"
            upsertSettings={data => _airportSettingsStore.upsertRegionalCode(data)}
          />
        );
      case SETTING_ID.RAMP_SIDE_ACCESS:
        return (
          <UpsertSettings
            type="Ramp Side Access"
            key="rampSideAccess"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertRampSideAccess(data)}
            getSettings={() => _airportSettingsStore.loadRampSideAccess()}
            settingsData={_airportSettingsStore.rampSideAccess}
          />
        );
      case SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY_VENDORS:
        return (
          <UpsertSettings
            type="Ramp Side Access 3rd party Vendors"
            key="rampSideThirdPartyVendors"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertRampSideAccessThirdPartyVendors(data)}
            getSettings={() => _airportSettingsStore.loadRampSideAccessThirdPartyVendors()}
            settingsData={_airportSettingsStore.rampSideAccess3rdPartyVendors}
          />
        );
      case SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY:
        return (
          <UpsertSettings
            type="Ramp Side Access 3rd party"
            key="rampSideThirdParty"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertRampSideAccessThirdParty(data)}
            getSettings={() => _airportSettingsStore.loadRampSideAccessThirdParty(true)}
            settingsData={_airportSettingsStore.rampSideAccess3rdParty}
          />
        );
      case SETTING_ID.SECURITY_MEASURES:
        return (
          <UpsertSettings
            type="Security Measures"
            key="securityMeasures"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertSecurityMeasures(data)}
            getSettings={() => _airportSettingsStore.loadSecurityMeasures()}
            settingsData={_airportSettingsStore.securityMeasures}
          />
        );
      case SETTING_ID.RECOMMENDED_SERVICES:
        return (
          <UpsertSettings
            type="Recommended Services"
            key="recommendedServices"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertRecommendedServices(data)}
            getSettings={() => _airportSettingsStore.loadRecommendedServices()}
            settingsData={_airportSettingsStore.recommendedServices}
          />
        );
      case SETTING_ID.OVERTIME:
        return (
          <UpsertSettings
            type="Overtime"
            key="overtime"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertOvertime(data)}
            getSettings={() => _airportSettingsStore.loadOvertime()}
            settingsData={_airportSettingsStore.overtime}
          />
        );
      case SETTING_ID.FLIGHT_TYPE:
        return <FlightType />;
      case SETTING_ID.DESTINATION_ALTERNATE_TYPE_OF_FLIGHT:
        return <DestinationAlternateTypeOfFlight />;
      case SETTING_ID.CONDITION_TYPE_CONFIG:
        return <ConditionTypeConfig />;
      case SETTING_ID.NOISE_CLASSIFICATION:
        return (
          <UpsertSettings
            type="Noise Classification"
            key="noiseClassification"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertNoiseClassification(data)}
            getSettings={() => _airportSettingsStore.loadNoiseClassifications()}
            settingsData={_airportSettingsStore.noiseClassifications}
            regExp={regex.all}
          />
        );
      case SETTING_ID.LEAD_TIME_TYPE:
        return (
          <UpsertSettings
            type="Lead Time Type"
            key="leadTimeType"
            isEditable={false}
            getSettings={() => _airportSettingsStore.loadLeadTimeType()}
            upsertSettings={data => _airportSettingsStore.upsertLeadTimeType(data)}
            settingsData={_airportSettingsStore.leadTimeType}
            regExp={regex.all}
          />
        );
      case SETTING_ID.LARGE_AIRCRAFT_RESTRICTION:
        return (
          <UpsertSettings
            type="Large Aircraft Restriction"
            key="largeAircraftRestriction"
            isEditable={false}
            getSettings={() => _airportSettingsStore.loadLargeAircraftRestriction()}
            upsertSettings={data => _airportSettingsStore.upsertLargeAircraftRestriction(data)}
            settingsData={_airportSettingsStore.largeAircraftRestriction}
          />
        );
      case SETTING_ID.CONTACT_TYPE:
        return (
          <UpsertSettings
            type="Contact Type"
            key="contactType"
            isEditable={false}
            getSettings={() => _airportSettingsStore.loadCustomsContactTypes()}
            upsertSettings={data => _airportSettingsStore.upsertCustomsContactType(data)}
            settingsData={_airportSettingsStore.customsContactTypes}
          />
        );
      case SETTING_ID.CONTACT_ADDRESS_TYPE:
        return (
          <UpsertSettings
            type="Contact Address Type"
            key="contactAddressType"
            isEditable={false}
            getSettings={() => _airportSettingsStore.loadCustomsContactAddressTypes()}
            upsertSettings={data => _airportSettingsStore.upsertCustomsContactAddressType(data)}
            settingsData={_airportSettingsStore.customsContactAddressTypes}
          />
        );
      default:
      case SETTING_ID.SCHEDULE_TYPE:
        return (
          <UpsertSettings
            type="Schedule Type"
            key="scheduleType"
            isEditable={false}
            hideAddNewButton={true}
            upsertSettings={data => _airportSettingsStore.upsertScheduleType(data)}
            getSettings={() => _airportSettingsStore.loadScheduleTypes()}
            settingsData={_airportSettingsStore.scheduleTypes}
          />
        );
    }
  }

  public render() {
    const { classes } = this.props as Required<Props>;
    return (
      <>
        <div className={classes.heading}>
          <Typography variant="h6" className={classes.title}>Airport Settings</Typography>
        </div>
        <div className={classes.root}>
          <div className={classes.selectSettingContainer}>
            <SettingCategoryControl
              title="Category"
              value={this.activeCategory}
              selectOptions={categoryList.filter(c => this.isCategoryVisible(c.value as SETTING_CATEGORIES))}
              onOptionChange={category => this.setActiveCategory(category)}
            />
            <SettingCategoryControl
              title="Sub category"
              value={this.activeSubCategory}
              selectOptions={this.subCategories}
              onOptionChange={settingLabel => this.setActiveSubCategory(settingLabel)}
            />
          </div>
          <div className={classes.settingWrapper}>{this.renderSetting()}</div>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(Settings);
export { Settings as PureSettings };
