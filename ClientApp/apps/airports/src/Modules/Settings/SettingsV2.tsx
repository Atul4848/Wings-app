import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { CappsCategory, UpsertSettings } from '@wings/shared';
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
  AirportOfEntry,
  RunwaySurfaceType,
  RunwayLightType,
  AirportCode,
  AirportCategory,
  DestinationAlternateTypeOfFlight,
  FlightType,
  ConditionTypeConfig,
  NoteType,
  ExceptionEntityParameterConfig,
  Document,
} from './Components';
import { categoryList, settingList } from './Fields';
import {
  AIRPORT_CODE_TYPES,
  airportSidebarOptions,
  SETTING_CATEGORIES,
  SETTING_ID,
  useAirportModuleSecurity,
} from '../Shared';
import { ModeStore } from '@wings-shared/mode-store';
import { SelectOption, regex } from '@wings-shared/core';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Settings: FC<Props> = ({ airportSettingsStore, sidebarStore }) => {
  // hidden settings under dev Mode
  const hiddenCategories: number[] = [];
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();
  const [ activeCategory, setActiveCategory ] = useState<number>(SETTING_CATEGORIES.GENERAL);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(SETTING_ID.SOURCE_TYPE);
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
  }, []);

  const onCategoryChange = (categoryID: number): void => {
    setActiveCategory(categoryID);
    setActiveSubCategory(subCategories(categoryID)[0].value as number);
  };

  const onSubCategoryChange = (categoryID: number): void => {
    setActiveSubCategory(categoryID);
  };

  // show category in DEV mode only
  const isCategoryVisible = (categoryId: SETTING_CATEGORIES): boolean => {
    if (ModeStore.isDevModeEnabled) {
      return true;
    }
    return !hiddenCategories.includes(categoryId);
  };

  const subCategories = (category?: number): SelectOption[] => {
    return settingList
      .filter(setting => setting.categoryId === (category || activeCategory))
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  };

  const renderSetting = (): ReactNode => {
    switch (activeSubCategory) {
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            type="Source Type"
            key="sourceType"
            isEditable={false}
            upsertSettings={data => _airportSettingsStore.upsertSourceType(data)}
            getSettings={() => _airportSettingsStore.getSourceTypes()}
            settingsData={_airportSettingsStore.sourceTypes}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            isEditable={false}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.REJECTION_REASON:
        return (
          <UpsertSettings
            type="Rejection Reason"
            key="rejectionReason"
            upsertSettings={data => _airportSettingsStore.upsertRejectionReason(data)}
            getSettings={() => _airportSettingsStore.loadRejectionReason()}
            settingsData={_airportSettingsStore.rejectionReason}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.WEIGHTUOM:
        return (
          <UpsertSettings
            isEditable={true}
            type="WeightUOM"
            key="weightUOM"
            upsertSettings={data => _airportSettingsStore.upsertWeightUOM(data)}
            getSettings={() => _airportSettingsStore.getWeightUOM()}
            settingsData={_airportSettingsStore.weightUOM}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.CAPPS_CATEGORY_CODE:
        return <CappsCategory isSettingsEditable={airportModuleSecurity.isSettingsEditable} />;
      case SETTING_ID.FUEL_TYPE:
        return (
          <UpsertSettings
            type="Fuel Type"
            key="fuelType"
            upsertSettings={data => _airportSettingsStore.upsertFuelTypes(data)}
            getSettings={() => _airportSettingsStore.loadFuelTypes()}
            settingsData={_airportSettingsStore.fuelTypes}
            regExp={regex.all}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.SEGMENT_TYPE:
        return (
          <UpsertSettings
            type="Segment Type"
            key="segmentType"
            regExp={regex.alphaNumeric}
            upsertSettings={data => _airportSettingsStore.upsertSegmentType(data)}
            getSettings={() => _airportSettingsStore.loadSegmentType()}
            settingsData={_airportSettingsStore.segmentType}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.FLIGHT_TYPE:
        return <FlightType />;
      case SETTING_ID.CONDITION_TYPE_CONFIG:
        return <ConditionTypeConfig />;
      case SETTING_ID.DESTINATION_ALTERNATE_TYPE_OF_FLIGHT:
        return <DestinationAlternateTypeOfFlight />;
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.LEAD_TIME_TYPE:
        return (
          <UpsertSettings
            type="Lead Time Type"
            key="leadTimeType"
            isEditable={false}
            getSettings={() => _airportSettingsStore.loadLeadTimeType()}
            settingsData={_airportSettingsStore.leadTimeType}
            upsertSettings={data => _airportSettingsStore.upsertLeadTimeType(data)}
            regExp={regex.all}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.OVERNIGHT_PARKING:
        return (
          <UpsertSettings
            type="Overnight Parking"
            key="overnightParking"
            isEditable={false}
            regExp={regex.all}
            getSettings={() => _airportSettingsStore.loadOvernightParkings()}
            upsertSettings={data => _airportSettingsStore.upsertOvernightParking(data)}
            settingsData={_airportSettingsStore.overnightParkings}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.NOTE_TYPE:
        return <NoteType />;
      case SETTING_ID.PERMISSION_TYPE:
        return (
          <UpsertSettings
            type="Permission Type"
            key="permissionType"
            getSettings={() => _airportSettingsStore.loadPermissionTypes()}
            upsertSettings={data => _airportSettingsStore.upsertPermissionType(data)}
            settingsData={_airportSettingsStore.permissionTypes}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.REQUIRED_FOR:
        return (
          <UpsertSettings
            type="Required For"
            key="requiredFor"
            getSettings={() => _airportSettingsStore.loadRequiredFor()}
            upsertSettings={data => _airportSettingsStore.upsertRequiredFor(data)}
            settingsData={_airportSettingsStore.requiredFor}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.EXCEPTION_REQUIREMENT:
        return (
          <UpsertSettings
            type="Exception Requirement"
            key="exceptionRequirement"
            getSettings={() => _airportSettingsStore.loadExceptionRequirements()}
            upsertSettings={data => _airportSettingsStore.upsertExceptionRequirement(data)}
            settingsData={_airportSettingsStore.exceptionRequirements}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.NOTIFICATION_TYPE:
        return (
          <UpsertSettings
            type="Notification Type"
            key="notificationType"
            getSettings={() => _airportSettingsStore.loadNotificationTypes()}
            upsertSettings={data => _airportSettingsStore.upsertNotificationType(data)}
            settingsData={_airportSettingsStore.notificationTypes}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.CONFIRMATION_REQUIRED_FOR:
        return (
          <UpsertSettings
            type="Confirmation Required For"
            key="confirmationRequiredFor"
            getSettings={() => _airportSettingsStore.loadConfirmationRequiredFor()}
            upsertSettings={data => _airportSettingsStore.upsertConfirmationRequiredFor(data)}
            settingsData={_airportSettingsStore.confirmationRequiredFor}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.REQUEST_FORMAT:
        return (
          <UpsertSettings
            type="Request Format"
            key="requestFormat"
            getSettings={() => _airportSettingsStore.loadRequestFormats()}
            upsertSettings={data => _airportSettingsStore.upsertRequestFormat(data)}
            settingsData={_airportSettingsStore.requestFormats}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.REQUEST_ADDRESS_TYPE:
        return (
          <UpsertSettings
            type="Request Address Type"
            key="requestAddressType"
            getSettings={() => _airportSettingsStore.loadRequestAddressTypes()}
            upsertSettings={data => _airportSettingsStore.upsertRequestAddressType(data)}
            settingsData={_airportSettingsStore.requestAddressTypes}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.PPR_PURPOSE:
        return (
          <UpsertSettings
            type="PPR Purpose"
            key="pprPurpose"
            getSettings={() => _airportSettingsStore.loadPPRPurpose()}
            upsertSettings={data => _airportSettingsStore.upsertPPRPurpose(data)}
            settingsData={_airportSettingsStore.pprPurpose}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.EXCEPTION_ENTITY_TYPE:
        return (
          <UpsertSettings
            type="Exception Entity Type"
            key="exceptionEntityType"
            getSettings={() => _airportSettingsStore.loadExceptionEntityTypes()}
            upsertSettings={data => _airportSettingsStore.upsertExceptionEntityType(data)}
            settingsData={_airportSettingsStore.exceptionEntityTypes}
            isEditable={false}
          />
        );
      case SETTING_ID.EXCEPTION_CONDITIONAL_OPERATOR:
        return (
          <UpsertSettings
            type="Exception Conditional Operator"
            key="exceptionConditionalOperator"
            getSettings={() => _airportSettingsStore.loadExceptionConditionalOperators()}
            upsertSettings={data => _airportSettingsStore.upsertExceptionConditionalOperator(data)}
            settingsData={_airportSettingsStore.exceptionConditionalOperators}
            isEditable={false}
          />
        );
      case SETTING_ID.EXCEPTION_ENTITY_PARAMETER_CONFIG:
        return <ExceptionEntityParameterConfig isEditable={false} />;
      case SETTING_ID.REPORT_TYPE:
        return (
          <UpsertSettings
            type="Report Type"
            key="reportType"
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
            getSettings={() => _airportSettingsStore.loadReportTypes()}
            upsertSettings={data => _airportSettingsStore.upsertReportType(data)}
            settingsData={_airportSettingsStore.reportTypes}
            isEditable={false}
          />
        );
      case SETTING_ID.REQUEST_STATUS:
        return (
          <UpsertSettings
            type="Request Status"
            key="requestStatus"
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
            getSettings={() => _airportSettingsStore.loadRequestStatus()}
            upsertSettings={data => _airportSettingsStore.upsertRequestStatus(data)}
            settingsData={_airportSettingsStore.requestStatus}
            isEditable={false}
          />
        );
      case SETTING_ID.LEAD_TIME_UOM:
        return (
          <UpsertSettings
            type="Lead Time UOM"
            key="leadTimeUOM"
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
            getSettings={() => _airportSettingsStore.loadLeadTimeUoms()}
            upsertSettings={data => _airportSettingsStore.upsertLeadTimeUom(data)}
            settingsData={_airportSettingsStore.leadTimeUOMs}
            isEditable={false}
          />
        );
      case SETTING_ID.DOCUMENT:
        return <Document />;
      case SETTING_ID.PERMISSION_LEAD_TIME_TYPE:
        return (
          <UpsertSettings
            type="Lead Time Type"
            key="leadTimeType"
            isEditable={false}
            regExp={regex.all}
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
            settingsData={_airportSettingsStore.permissionLeadTimeTypes}
            getSettings={() => _airportSettingsStore.loadPermissionLeadTimeTypes()}
            upsertSettings={data => _airportSettingsStore.upsertPermissionLeadTimeType(data)}
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
            hasSuperPermission={airportModuleSecurity.isSettingsEditable}
          />
        );
    }
  };

  return (
    <SettingsLayout
      title="Airport"
      categoryValue={activeCategory}
      subCategoryValue={activeSubCategory}
      children={renderSetting()}
      categoryList={categoryList.filter(c => isCategoryVisible(c.value as SETTING_CATEGORIES))}
      subCategoryList={subCategories()}
      onCategoryChange={id => onCategoryChange(id)}
      onSubCategoryChange={id => onSubCategoryChange(id)}
    />
  );
};

export default inject('airportSettingsStore', 'sidebarStore')(observer(Settings));
