import React, { FC, ReactNode, useEffect, useState } from 'react';
import { UpsertSettings } from '@wings/shared';
import { IClasses, regex, SelectOption } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import {
  AvionicsSettingsStore,
  EtpSettingsStore,
  SpeedScheduleSettingsStore,
  SettingsStore,
  SETTING_ID,
  RegistrySequenceBaseModel,
  updateAircraftSidebarOptions,
  SETTING_CATEGORIES,
  useAircraftModuleSecurity,
} from '../Shared';
import {
  FmsSoftwareVersion,
  AesModelComponent,
  AcarsMessageSet,
  FmsModelComponent,
  NoiseChapterConfiguration,
  Transponder,
  AcarsSoftwareVersion,
  AcarsModelComponent,
  FuelReservePolicy,
  SubCategory,
  EngineType,
  Series,
  AerodromeRefCode,
  AircraftModels,
  RegistryIdentifierCountry,
  UpsertSettingsProfile,
  CruiseSchedule,
  TypeDesignator,
} from './Components';
import { categoryList, settingList } from './Fields';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';
 
interface Props {
  classes?: IClasses;
  settingsStore?: SettingsStore;
  avionicsSettingsStore?: AvionicsSettingsStore;
  etpSettingsStore?: EtpSettingsStore;
  speedScheduleSettingsStore?: SpeedScheduleSettingsStore;
  sidebarStore?: typeof SidebarStore;
}
 
const Settings: FC<Props> = ({
  settingsStore,
  avionicsSettingsStore,
  etpSettingsStore,
  speedScheduleSettingsStore,
  sidebarStore,
}) => {
  // hidden settings under dev Mode
  const _settingsStore = settingsStore as SettingsStore;
  const _avionicsSettingsStore = avionicsSettingsStore as AvionicsSettingsStore;
  const _etpSettingsStore = etpSettingsStore as EtpSettingsStore;
  const _speedScheduleSettingsStore = speedScheduleSettingsStore as SpeedScheduleSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();
  const [ activeCategory, setActiveCategory ] = useState<number>(SETTING_CATEGORIES.BASE);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(SETTING_ID.AIRCRAFT_COLOR);
 
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Settings'), 'aircraft');
  }, []);
 
  const onCategoryChange = (categoryID: number): void => {
    setActiveCategory(categoryID);
    setActiveSubCategory(subCategories(categoryID)[0].value as number);
  };
 
  const onSubCategoryChange = (categoryID: number): void => {
    setActiveSubCategory(categoryID);
  };
 
  const subCategories = (category?: number): SelectOption[] => {
    return settingList
      .filter(setting => setting.categoryId === (category || activeCategory))
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  };
 
  const renderSetting = (): ReactNode => {
    switch (activeSubCategory) {
      case SETTING_ID.REGISTRY_IDENTIFIER_COUNTRY:
        return <RegistryIdentifierCountry />;
      case SETTING_ID.MODEL:
        return <AircraftModels />;
      case SETTING_ID.ICAO_TYPE_DESIGNATOR:
        return <TypeDesignator />;
      case SETTING_ID.WAKE_TURBULENCE_CATEGORY:
        return (
          <UpsertSettings
            key="WakeTurbulenceCategory"
            type="Wake Turbulence Category"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertWakeTurbulenceCategory(data)}
            getSettings={() => _settingsStore.getWakeTurbulenceCategories()}
            settingsData={_settingsStore.wakeTurbulenceCategories}
            maxLength={1}
            sortColumn="name"
          />
        );
      case SETTING_ID.NOISE_CHAPTER:
        return (
          <UpsertSettings
            key="NoiseChapter"
            type="Noise Chapter"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertNoiseChapter(data)}
            getSettings={() => _settingsStore.getNoiseChapters()}
            settingsData={_settingsStore.noiseChapters}
            maxLength={15}
            regExp={regex.all}
            headerName="Chapter"
            sortColumn="name"
          />
        );
      case SETTING_ID.FUEL_TYPE:
        return (
          <UpsertSettings
            key="FuelType"
            type="Fuel Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertFuelTypeProfile(data)}
            getSettings={() => _settingsStore.getFuelTypeProfile()}
            settingsData={_settingsStore.fuelTypeProfile}
            maxLength={10}
            sortColumn="name"
          />
        );
      case SETTING_ID.FIRE_CATEGORY:
        return (
          <UpsertSettings
            key="FireCategory"
            type="Fire Category"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertFireCategory(data)}
            getSettings={() => _settingsStore.getFireCategory()}
            settingsData={_settingsStore.fireCategories}
            maxLength={6}
            regExp={regex.all}
            ignoreNumber={true}
            sortColumn="name"
          />
        );
      case SETTING_ID.RANGE_UOM:
        return (
          <UpsertSettings
            key="RangeUOM"
            type="Range UOM"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertRangeUOM(data)}
            getSettings={() => _settingsStore.getRangeUOMs()}
            settingsData={_settingsStore.rangeUOMs}
            maxLength={50}
          />
        );
      case SETTING_ID.WEIGHT_UOM:
        return (
          <UpsertSettings
            key="WeightUOM"
            type="Weight UOM"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertWeightUOM(data)}
            getSettings={() => _settingsStore.getWeightUOMs()}
            settingsData={_settingsStore.weightUOMs}
            maxLength={50}
          />
        );
      case SETTING_ID.ICAO_AERODROME_REFERENCE_CODE:
        return <AerodromeRefCode />;
      case SETTING_ID.CATEGORIES:
        return (
          <UpsertSettings
            key="Categories"
            type="Categories"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertCategory(data)}
            getSettings={() => _settingsStore.getCategories()}
            settingsData={_settingsStore.categories}
            maxLength={30}
            regExp={regex.all}
            sortColumn="name"
          />
        );
      case SETTING_ID.DISTANCE_UOM:
        return (
          <UpsertSettings
            key="DistanceUOM"
            type="Distance UOM"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertDistanceUOM(data)}
            getSettings={() => _settingsStore.getDistanceUOMs()}
            settingsData={_settingsStore.distanceUOMs}
            maxLength={50}
          />
        );
      case SETTING_ID.SERIES:
        return <Series />;
      case SETTING_ID.ENGINE_TYPE:
        return <EngineType />;
      case SETTING_ID.ETP_SCENARIO_TYPE:
        return (
          <UpsertSettings
            key="ETPScenarioType"
            type="ETP Scenario Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPScenarioType(data)}
            getSettings={() => _etpSettingsStore.getETPScenarioTypes()}
            settingsData={_etpSettingsStore.etpScenarioTypes}
            maxLength={50}
            regExp={regex.all}
          />
        );
      case SETTING_ID.ETP_TIME_LIMIT:
        return (
          <UpsertSettings
            key="ETPTimeLimitType"
            type="ETP Time Limit Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPTimeLimitType(data)}
            getSettings={() => _etpSettingsStore.getETPTimeLimitTypes()}
            settingsData={_etpSettingsStore.etpTimeLimitTypes}
            maxLength={50}
            regExp={regex.all}
          />
        );
      case SETTING_ID.AIRCRAFT_MODIFICATION:
        return (
          <UpsertSettings
            key="aircraftModification"
            type="Aircraft Modification"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAircraftModification(data)}
            getSettings={() => _settingsStore.getAircraftModifications()}
            settingsData={_settingsStore.aircraftModifications}
            maxLength={50}
            headerName="Modification"
            regExp={regex.all}
            sortColumn="name"
          />
        );
      case SETTING_ID.ETP_ALT_DESCENT_PROFILE:
        return (
          <UpsertSettings
            key="ETPAltDescentProfile"
            type="ETP Alt Descent Profile"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPAltDescent(data)}
            getSettings={() => _etpSettingsStore.getETPAltDescents()}
            settingsData={_etpSettingsStore.etpAltDescentProfiles}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_SCENARIO_ENGINE:
        return (
          <UpsertSettings
            key="ETPScenarioEngine"
            type="ETP Scenario Engine"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPScenarioEngine(data)}
            getSettings={() => _etpSettingsStore.getETPScenarioEngines()}
            settingsData={_etpSettingsStore.ETPScenarioEngines}
            maxLength={50}
            regExp={regex.all}
          />
        );
      case SETTING_ID.ETP_LEVELS:
        return (
          <UpsertSettings
            key="ETPLevels"
            type="ETP Levels"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPLevel(data)}
            getSettings={() => _etpSettingsStore.getETPLevels()}
            settingsData={_etpSettingsStore.ETPLevels}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_MAIN_DESCENT:
        return (
          <UpsertSettings
            key="ETPMainDescent"
            type="ETP Main Descent"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPMainDescent(data)}
            getSettings={() => _etpSettingsStore.getETPMainDescents()}
            settingsData={_etpSettingsStore.ETPMainDescents}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_FINAL_DESCENT:
        return (
          <UpsertSettings
            key="ETPFinalDescent"
            type="ETP Final Descent"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPFinalDescent(data)}
            getSettings={() => _etpSettingsStore.getETPFinalDescents()}
            settingsData={_etpSettingsStore.ETPFinalDescents}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_CRUISE_PROFILE:
        return (
          <UpsertSettings
            key="ETPCruiseProfile"
            type="ETP Cruise Profile"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPCruiseProfile(data)}
            getSettings={() => _etpSettingsStore.getETPCruiseProfiles()}
            settingsData={_etpSettingsStore.ETPCruiseProfiles}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_HOLD_METHOD:
        return (
          <UpsertSettings
            key="ETPHoldMethod"
            type="ETP Hold Method"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPHoldMethod(data)}
            getSettings={() => _etpSettingsStore.getETPHoldMethods()}
            settingsData={_etpSettingsStore.ETPHoldMethods}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_PENALTY_BIAS_TYPE:
        return (
          <UpsertSettings
            key="ETPPenaltyBiasType"
            type="ETP Penalty Bias Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPPenaltyBias(data)}
            getSettings={() => _etpSettingsStore.getETPPenaltyBias()}
            settingsData={_etpSettingsStore.ETPPenaltyBias}
            maxLength={200}
          />
        );
      case SETTING_ID.FLIGHT_PLAN_FORMAT_STATUS:
        return (
          <UpsertSettings
            key="FlightPlanFormatStatus"
            type="Flight Plan Format Status"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertFlightPlanFormatStatus(data)}
            getSettings={() => _settingsStore.getFlightPlanFormatStatus()}
            settingsData={_settingsStore.flightPlanFormatStatus}
            maxLength={200}
            sortColumn="name"
          />
        );
      case SETTING_ID.SUB_CATEGORY:
        return <SubCategory />;
      case SETTING_ID.ETP_APU_BURN_METHOD:
        return (
          <UpsertSettings
            key="ETPAPUBurnMethod"
            type="ETP APU Burn Method"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPAPUBurnMethod(data)}
            getSettings={() => _etpSettingsStore.getETPAPUBurnMethods()}
            settingsData={_etpSettingsStore.ETPAPUBurnMethods}
            maxLength={50}
          />
        );
      case SETTING_ID.ETP_PENALTY_APPLY:
        return (
          <UpsertSettings
            key="ETPPenaltyApply"
            type="ETP Penalty Apply"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPPenaltyApply(data)}
            getSettings={() => _etpSettingsStore.getETPPenaltyApply()}
            settingsData={_etpSettingsStore.ETPPenaltyApply}
            maxLength={50}
          />
        );
      case SETTING_ID.AIRCRAFT_COLOR:
        return (
          <UpsertSettings
            key="AircraftColor"
            type="Aircraft Color"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAircraftColor(data)}
            getSettings={() => _settingsStore.getAircraftColors()}
            settingsData={_settingsStore.aircraftColors}
            maxLength={15}
            sortColumn="name"
          />
        );
      case SETTING_ID.AIRFRAME_STATUS:
        return (
          <UpsertSettings
            key="AirframeStatus"
            type="Airframe Status"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAirframeStatus(data)}
            getSettings={() => _settingsStore.getAirframeStatus()}
            settingsData={_settingsStore.airframeStatus}
            maxLength={30}
            sortColumn="name"
          />
        );
      case SETTING_ID.ETP_PENALTY_CATEGORY:
        return (
          <UpsertSettings
            key="ETPPenaltyCategory"
            type="ETP Penalty Category"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _etpSettingsStore.upsertETPPenaltyCategory(data)}
            getSettings={() => _etpSettingsStore.getETPPenaltyCategories()}
            settingsData={_etpSettingsStore.ETPPenaltyCategories}
            maxLength={50}
            regExp={regex.all}
          />
        );
      case SETTING_ID.CRUISE_SCHEDULE:
        return <CruiseSchedule />;
      case SETTING_ID.AIRCRAFT_MAKE:
        return (
          <UpsertSettings
            key="Make"
            type="Make"
            headerName="Make"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertMake(data)}
            getSettings={() => _settingsStore.getMakes()}
            settingsData={_settingsStore.makes}
            maxLength={50}
            regExp={regex.all}
            sortColumn="name"
          />
        );
      case SETTING_ID.WIND_UOM:
        return (
          <UpsertSettings
            key="WindUOM"
            type="Wind UOM"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertWindUOM(data)}
            getSettings={() => _settingsStore.getWindUOMs()}
            settingsData={_settingsStore.windUOMs}
            maxLength={50}
            regExp={regex.all}
          />
        );
      case SETTING_ID.CLIMB_SCHEDULE:
        return (
          <UpsertSettingsProfile
            key="climbSchedule"
            typeKey="climbSchedule"
            type="Climb Schedule"
            upsertSettings={data => _speedScheduleSettingsStore.upsertClimbSchedule(data)}
            getSettings={() => _speedScheduleSettingsStore.getClimbSchedules()}
          />
        );
      case SETTING_ID.FUEL_RESERVE_POLICY:
        return <FuelReservePolicy />;
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            key="SourceType"
            type="Source Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertSourceType(data)}
            getSettings={() => _settingsStore.getSourceTypes()}
            settingsData={_settingsStore.sourceTypes}
            maxLength={100}
            sortColumn="name"
          />
        );
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            key="AccessLevel"
            type="Access Level"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAccessLevel(data)}
            getSettings={() => _settingsStore.getAccessLevels()}
            settingsData={_settingsStore.accessLevels}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.DESCENT_SCHEDULE:
        return (
          <UpsertSettingsProfile
            key="descentSchedule"
            typeKey="descentSchedule"
            type="Descent Schedule"
            upsertSettings={data => _speedScheduleSettingsStore.upsertDescentSchedule(data)}
            getSettings={() => _speedScheduleSettingsStore.getDescentSchedules()}
          />
        );
      case SETTING_ID.ACARS_MANUFACTURER:
        return (
          <UpsertSettings
            key="ACARSManufacturer"
            type="ACARS Manufacturer"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _avionicsSettingsStore.upsertAcarsManufacturer(data)}
            getSettings={() => _avionicsSettingsStore.getAcarsManufacturers()}
            settingsData={_avionicsSettingsStore.acarsManufacturers}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.HOLD_SCHEDULE:
        return (
          <UpsertSettingsProfile
            key="holdSchedule"
            typeKey="holdSchedule"
            type="Hold Schedule"
            upsertSettings={data => _speedScheduleSettingsStore.upsertHoldSchedule(data)}
            getSettings={() => _speedScheduleSettingsStore.getHoldSchedules()}
          />
        );
      case SETTING_ID.ACARS_MODEL:
        return <AcarsModelComponent />;
      case SETTING_ID.FMS_MANUFACTURER:
        return (
          <UpsertSettings
            key="FMSManufacturer"
            type="FMS Manufacturer"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _avionicsSettingsStore.upsertFmsManufacturer(data)}
            getSettings={() => _avionicsSettingsStore.getFmsManufacturers()}
            settingsData={_avionicsSettingsStore.fmsManufacturers}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.ACARS_SOFTWARE_VERSION:
        return <AcarsSoftwareVersion />;
      case SETTING_ID.AES_MANUFACTURER:
        return (
          <UpsertSettings
            key="AESManufacturer"
            type="AES Manufacturer"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _avionicsSettingsStore.upsertAesManufacturer(data)}
            getSettings={() => _avionicsSettingsStore.getAesManufacturers()}
            settingsData={_avionicsSettingsStore.aesManufacturers}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.FMS_MODEL:
        return <FmsModelComponent />;
      case SETTING_ID.ACARS_MESSAGE_SET:
        return <AcarsMessageSet />;
      case SETTING_ID.AES_MODEL:
        return <AesModelComponent />;
      case SETTING_ID.RAIM_REPORT_TYPE:
        return (
          <UpsertSettings
            key="RAIMReportType"
            type="RAIM Report Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _avionicsSettingsStore.upsertRaimReportType(data)}
            getSettings={() => _avionicsSettingsStore.getRaimReportTypes()}
            settingsData={_avionicsSettingsStore.raimReportTypes}
            isNameUnique={true}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.FMS_SOFTWARE_VERSION:
        return <FmsSoftwareVersion />;
      case SETTING_ID.NFP_FUEL_RESERVE_TYPE:
        return (
          <UpsertSettings
            key="NFPFuelReserveType"
            type="NFP Fuel Reserve Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            isNameUnique={true}
            upsertSettings={data => _avionicsSettingsStore.upsertNfpFuelReserveType(data)}
            getSettings={() => _avionicsSettingsStore.getNfpFuelReserveTypes()}
            settingsData={_avionicsSettingsStore.nfpFuelReserveTypes}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.RAIM_RECEIVER_TYPE:
        return (
          <UpsertSettings
            key="RAIMReceiverType"
            type="RAIM Receiver Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _avionicsSettingsStore.upsertRaimReceiverType(data)}
            getSettings={() => _avionicsSettingsStore.getRaimReceiverTypes()}
            settingsData={_avionicsSettingsStore.raimReceiverTypes}
            isNameUnique={true}
            maxLength={50}
            sortColumn="name"
            regExp={regex.all}
          />
        );
      case SETTING_ID.STC_MANUFACTURE:
        return (
          <UpsertSettings
            key="stcManufactre"
            type="STC Manufacture"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertStcManufacture(data)}
            getSettings={() => _settingsStore.getStcManufactures()}
            settingsData={_settingsStore.stcManufactures}
            regExp={regex.all}
            headerName="STC Manufacture"
            sortColumn="name"
          />
        );
      case SETTING_ID.AIRCRAFT_NOISE_TYPE:
        return (
          <UpsertSettings
            key="AircraftNoiseType"
            type="Aircraft Noise Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAircraftNoiseType(data)}
            getSettings={() => _settingsStore.getAircraftNoiseTypes()}
            settingsData={_settingsStore.aircraftNoiseTypes}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.NOISE_DATA_TYPE_CERTIFICATION:
        return (
          <UpsertSettings
            key="NoiseDateTypeCertification"
            type="Noise Date Type Certification"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertNoiseDateTypeCertification(data)}
            getSettings={() => _settingsStore.getNoiseDateTypeCertifications()}
            settingsData={_settingsStore.noiseDateTypeCertifications}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
            sortColumn="name"
          />
        );
      case SETTING_ID.RADIO:
        return (
          <UpsertSettings<RegistrySequenceBaseModel>
            key="radio"
            type="Radio"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertRadio(data)}
            getSettings={() => _settingsStore.getRadios()}
            settingsData={_settingsStore.radios}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
          />
        );
      case SETTING_ID.ACAS:
        return (
          <UpsertSettings
            key="ACAS"
            type="ACAS"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAcas(data)}
            getSettings={() => _settingsStore.getAcases()}
            settingsData={_settingsStore.acases}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
          />
        );
      case SETTING_ID.NOISE_CHAPTER_CONFIGURATION:
        return <NoiseChapterConfiguration />;
      case SETTING_ID.TRANSPONDER:
        return <Transponder />;
      case SETTING_ID.MILITARY_DESIGNATION:
        return (
          <UpsertSettings
            key="militaryDesignation"
            type="Military Designation"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertMilitaryDesignation(data)}
            getSettings={() => _settingsStore.getMilitaryDesignations()}
            settingsData={_settingsStore.militaryDesignations}
            maxLength={50}
            regExp={regex.all}
            isNameUnique={true}
            sortColumn="name"
          />
        );
      case SETTING_ID.OTHER_NAME:
        return (
          <UpsertSettings
            key="otherName"
            type="Other Name"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertOtherName(data)}
            getSettings={() => _settingsStore.getOtherNames()}
            settingsData={_settingsStore.otherNames}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={100}
            sortColumn="name"
          />
        );
      case SETTING_ID.WAKE_TURBULENCE_GROUP:
        return (
          <UpsertSettings
            key="wakeTurbulenceGroup"
            type="Wake Turbulence Group"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertWakeTurbulenceGroup(data)}
            getSettings={() => _settingsStore.getWakeTurbulenceGroups()}
            settingsData={_settingsStore.wakeTurbulenceGroups}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={1}
            sortColumn="name"
          />
        );
      case SETTING_ID.POPULAR_NAME:
        return (
          <UpsertSettings
            key="popularName"
            type="Popular Name"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertPopularName(data)}
            getSettings={() => _settingsStore.getPopularNames()}
            settingsData={_settingsStore.popularNames}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={100}
            sortColumn="name"
          />
        );
      case SETTING_ID.PROPULSION_TYPE:
        return (
          <UpsertSettings
            key="propulsionType"
            type="Propulsion Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertPropulsionType(data)}
            getSettings={() => _settingsStore.getPropulsionType()}
            settingsData={_settingsStore.propulsionType}
            regExp={regex.alphabetWithSlash}
            isNameUnique={true}
            ignoreNumber={true}
            sortColumn="name"
          />
        );
      case SETTING_ID.FLIGHT_PLANNING_SERVICE_TYPE:
        return (
          <UpsertSettings
            key="flightPlanningServiceType"
            type="Type"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertFlightPlanningServiceType(data)}
            getSettings={() => _settingsStore.getFlightPlanningServiceTypes()}
            settingsData={_settingsStore.flightPlanningServiceTypes}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={50}
            headerName="Type"
          />
        );
      case SETTING_ID.DELIVERY_PACKAGE:
        return (
          <UpsertSettings
            key="deliveryPackage"
            type="Delivery Package"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertDeliveryPackageType(data)}
            getSettings={() => _settingsStore.getDeliveryPackageType()}
            settingsData={_settingsStore.flightPlanningServiceTypes}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={50}
            headerName="Delivery Package Type"
          />
        );
      case SETTING_ID.RUNWAY_ANALYSIS:
        return (
          <UpsertSettings
            key="runwayAnalysis"
            type="Runway Analysis"
            hasSuperPermission={aircraftModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertRunwayAnalysisType(data)}
            getSettings={() => _settingsStore?.getRunwayAnalysisType()}
            settingsData={_settingsStore?.runwayAnalysisType}
            regExp={regex.all}
            isNameUnique={true}
            ignoreNumber={true}
            maxLength={50}
            headerName="Runway Analysis Type"
          />
        );
      case SETTING_ID.UPLINK_VENDOR:
        return (
          <UpsertSettings
            key="uplinkVendor"
            type="Uplink Vendor"
            hasSuperPermission={aircraftModuleSecurity.isAirframeSettingsEditable}
            upsertSettings={data => _settingsStore.upsertUplinkVendor(data)}
            getSettings={() => _settingsStore.getUplinkVendor()}
            settingsData={_settingsStore?.uplinkVendor}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={100}
            headerName="Uplink Vendor"
          />
        );
      case SETTING_ID.CATERING_HEATING_ELEMENT:
        return (
          <UpsertSettings
            key="cateringHeatingElement"
            type="Catering Heating Element"
            hasSuperPermission={aircraftModuleSecurity.isAirframeSettingsEditable}
            upsertSettings={data => _settingsStore.upsertCateringHeatingElement(data)}
            getSettings={() => _settingsStore.getCateringHeatingElement()}
            settingsData={_settingsStore.cateringHeatingElement}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
            headerName="Catering Heating Element"
          />
        );
      case SETTING_ID.OUTER_MAIN_GEAR_WHEEL_SPAN:
        return (
          <UpsertSettings
            key="outerMainGearWheelSpan"
            type="Outer Main Gear Wheel Span"
            hasSuperPermission={aircraftModuleSecurity.isAirframeSettingsEditable}
            upsertSettings={data => _settingsStore.upsertOuterMainGearWheelSpan(data)}
            getSettings={() => _settingsStore.getOuterMainGearWheelSpan()}
            settingsData={_settingsStore.outerMainGearWheelSpan}
            regExp={regex.all}
            isNameUnique={true}
            maxLength={50}
            headerName="Outer Main Gear Wheel Span"
          />
        );
      default:
        return null;
    }
  };
 
  return (
    <SettingsLayout
      title="Aircraft"
      categoryValue={activeCategory}
      subCategoryValue={activeSubCategory}
      children={renderSetting()}
      categoryList={categoryList}
      subCategoryList={subCategories()}
      onCategoryChange={id => onCategoryChange(id)}
      onSubCategoryChange={id => onSubCategoryChange(id)}
    />
  );
};
 
export default inject(
  'settingsStore',
  'avionicsSettingsStore',
  'etpSettingsStore',
  'speedScheduleSettingsStore',
  'sidebarStore'
)(observer(Settings));