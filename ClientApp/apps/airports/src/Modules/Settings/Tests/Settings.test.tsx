import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import PureSettings from '../Settings';
import { UpsertSettings } from '@wings/shared';
import { SettingsTypeModel } from '@wings-shared/core';
import {
  AirportCodeSettingsModel,
  AirportSettingsStoreMock,
  RunwaySettingsTypeModel,
  SETTING_CATEGORIES,
  SETTING_ID,
} from '../../Shared';
import sinon from 'sinon';
import {
  AirportCategory,
  AirportCodeSettings,
  AirportHourRemark,
  AirportHoursBuffer,
  AirportHoursSubType,
  ConditionalOperator,
  ConditionType,
  ICAOCode,
  MilitaryUseType,
  RunwayLightType,
  RunwaySettings,
} from '../Components';
import { SettingCategoryControl } from '@wings-shared/form-controls';

describe('Airport Setting Module', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  const props = {
    classes: {},
    airportSettingsStore: new AirportSettingsStoreMock(),
  };

  const getSettings = () => wrapper.find(UpsertSettings).prop('getSettings')();

  const upsertSettings = () => wrapper.find(UpsertSettings).prop('upsertSettings')(new SettingsTypeModel());

  const getRunwaySettings = () => wrapper.find(RunwaySettings).prop('getSettings')();

  const upsertRunwaySettings = () => wrapper.find(RunwaySettings).prop('upsertSettings')(new RunwaySettingsTypeModel());

  const getAirportCodeSettings = () => wrapper.find(AirportCodeSettings).prop('getSettings')();

  const upsertAirportCodeSettings = () =>
    wrapper.find(AirportCodeSettings).prop('upsertSettings')(new AirportCodeSettingsModel());

  const optionChange = value =>
    wrapper
      .find(SettingCategoryControl)
      .at(1)
      .simulate('optionChange', value);

  beforeEach(() => {
    wrapper = shallow(<PureSettings {...props} />)
      .dive()
      .dive();
    wrapperInstance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, should render SettingsLayout and UpsertSettings', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingCategoryControl)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.GENERAL);
    expect(wrapperInstance.activeCategory).to.eq(SETTING_CATEGORIES.GENERAL);
    expect(wrapperInstance.activeSubCategory).to.eq(SETTING_ID.SOURCE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.AIRPORT_TYPE);
    expect(wrapperInstance.activeSubCategory).to.eq(SETTING_ID.AIRPORT_TYPE);
  });

  it('should test Airport Hour type', () => {
    optionChange(SETTING_ID.AIRPORT_HOUR_TYPE);
    // get request
    const loadAirportHourTypes = sinon.spy(props.airportSettingsStore, 'loadAirportHourTypes');
    getSettings();
    expect(loadAirportHourTypes.called).to.be.true;
    // upsert request
    const upsertAirportHourType = sinon.spy(props.airportSettingsStore, 'upsertAirportHourTypes');
    upsertSettings();
    expect(upsertAirportHourType.called).to.be.true;
  });

  it('should test Schedule Type', () => {
    optionChange(SETTING_ID.SCHEDULE_TYPE);
    // get request
    const loadScheduleTypes = sinon.spy(props.airportSettingsStore, 'loadScheduleTypes');
    getSettings();
    expect(loadScheduleTypes.called).to.be.true;
    // upsert request
    const upsertScheduleType = sinon.spy(props.airportSettingsStore, 'upsertScheduleType');
    upsertSettings();
    expect(upsertScheduleType.called).to.be.true;
  });

  it('should test source types', () => {
    optionChange(SETTING_ID.SOURCE_TYPE);
    // get request
    const getSourceTypes = sinon.spy(props.airportSettingsStore, 'getSourceTypes');
    getSettings();
    expect(getSourceTypes.called).to.be.true;
    // upsert request
    const upsertSourceType = sinon.spy(props.airportSettingsStore, 'upsertSourceType');
    upsertSettings();
    expect(upsertSourceType.called).to.be.true;
  });

  it('should test access level', () => {
    optionChange(SETTING_ID.ACCESS_LEVEL);
    // get request
    const getAccessLevels = sinon.spy(props.airportSettingsStore, 'getAccessLevels');
    getSettings();
    expect(getAccessLevels.called).to.be.true;
    // upsert request
    const upsertAccessLevel = sinon.spy(props.airportSettingsStore, 'upsertAccessLevel');
    upsertSettings();
    expect(upsertAccessLevel.called).to.be.true;
  });

  it('should test airport type', () => {
    optionChange(SETTING_ID.AIRPORT_TYPE);
    // get request
    const loadAirportTypes = sinon.spy(props.airportSettingsStore, 'loadAirportTypes');
    getSettings();
    expect(loadAirportTypes.called).to.be.true;
    // upsert request
    const upsertAirportType = sinon.spy(props.airportSettingsStore, 'upsertAirportType');
    upsertSettings();
    expect(upsertAirportType.called).to.be.true;
  });

  it('should test airport facility type', () => {
    optionChange(SETTING_ID.AIRPORT_FACILITY_TYPE);
    // get request
    const loadAirportFacilityTypes = sinon.spy(props.airportSettingsStore, 'loadAirportFacilityTypes');
    getSettings();
    expect(loadAirportFacilityTypes.called).to.be.true;
    // upsert request
    const upsertAirportFacilityType = sinon.spy(props.airportSettingsStore, 'upsertAirportFacilityType');
    upsertSettings();
    expect(upsertAirportFacilityType.called).to.be.true;
  });

  it('should test distance UOM', () => {
    optionChange(SETTING_ID.DISTANCE_UOM);
    // get request
    const loadDistanceUOMs = sinon.spy(props.airportSettingsStore, 'loadDistanceUOMs');
    getSettings();
    expect(loadDistanceUOMs.called).to.be.true;
    // upsert request
    const upsertDistanceUOM = sinon.spy(props.airportSettingsStore, 'upsertDistanceUOM');
    upsertSettings();
    expect(upsertDistanceUOM.called).to.be.true;
  });

  it('should test airport Directions', () => {
    optionChange(SETTING_ID.AIRPORT_DIRECTION);
    // get request
    const loadAirportDirections = sinon.spy(props.airportSettingsStore, 'loadAirportDirections');
    getSettings();
    expect(loadAirportDirections.called).to.be.true;
    // upsert request
    const upsertAirportDirection = sinon.spy(props.airportSettingsStore, 'upsertAirportDirection');
    upsertSettings();
    expect(upsertAirportDirection.called).to.be.true;
  });

  it('should test airport Usage Type', () => {
    optionChange(SETTING_ID.AIRPORT_USAGE_TYPE);
    // get request
    const loadAirportUsageTypes = sinon.spy(props.airportSettingsStore, 'loadAirportUsageTypes');
    getSettings();
    expect(loadAirportUsageTypes.called).to.be.true;
    // upsert request
    const upsertAirportUsageType = sinon.spy(props.airportSettingsStore, 'upsertAirportUsageType');
    upsertSettings();
    expect(upsertAirportUsageType.called).to.be.true;
  });

  it('should test airport Facility Access Level', () => {
    optionChange(SETTING_ID.AIRPORT_FACILITY_ACCESS_LEVEL);
    // get request
    const loadAirportFacilityAccessLevels = sinon.spy(props.airportSettingsStore, 'loadAirportFacilityAccessLevels');
    getSettings();
    expect(loadAirportFacilityAccessLevels.called).to.be.true;
    // upsert request
    const upsertAirportFacilityAccessLevel = sinon.spy(props.airportSettingsStore, 'upsertAirportFacilityAccessLevel');
    upsertSettings();
    expect(upsertAirportFacilityAccessLevel.called).to.be.true;
  });

  it('should test Data Source', () => {
    optionChange(SETTING_ID.AIRPORT_DATA_SOURCE);
    // get request
    const loadAirportDataSources = sinon.spy(props.airportSettingsStore, 'loadAirportDataSources');
    getSettings();
    expect(loadAirportDataSources.called).to.be.true;
    // upsert request
    const upsertAirportDataSource = sinon.spy(props.airportSettingsStore, 'upsertAirportDataSource');
    upsertSettings();
    expect(upsertAirportDataSource.called).to.be.true;
  });

  it('should set settings category', () => {
    wrapper
      .find(SettingCategoryControl)
      .at(0)
      .simulate('optionChange', SETTING_CATEGORIES.RUNWAY);
    expect(wrapperInstance.activeCategory).to.eq(SETTING_CATEGORIES.RUNWAY);
    expect(wrapperInstance.activeSubCategory).to.eq(SETTING_ID.RUNWAY_SURFACE_TYPE);
  });

  it('should set settings sub category', () => {
    optionChange(SETTING_ID.RUNWAY_SURFACE_TYPE);
    expect(wrapperInstance.activeSubCategory).to.eq(SETTING_ID.RUNWAY_SURFACE_TYPE);
  });

  it('should test Runway Condition', () => {
    optionChange(SETTING_ID.RUNWAY_CONDITION);
    // get request
    const loadRunwayConditions = sinon.spy(props.airportSettingsStore, 'loadRunwayConditions');
    getRunwaySettings();
    expect(loadRunwayConditions.called).to.be.true;
    // upsert request
    const upsertRunwayCondition = sinon.spy(props.airportSettingsStore, 'upsertRunwayCondition');
    upsertRunwaySettings();
    expect(upsertRunwayCondition.called).to.be.true;
  });

  it('should test Runway Surface Treatment', () => {
    optionChange(SETTING_ID.RUNWAY_SURFACE_TREATMENT);
    // get request
    const loadRunwaySurfaceTreatments = sinon.spy(props.airportSettingsStore, 'loadRunwaySurfaceTreatments');
    getRunwaySettings();
    expect(loadRunwaySurfaceTreatments.called).to.be.true;
    // upsert request
    const upsertRunwaySurfaceTreatment = sinon.spy(props.airportSettingsStore, 'upsertRunwaySurfaceTreatment');
    upsertRunwaySettings();
    expect(upsertRunwaySurfaceTreatment.called).to.be.true;
  });

  it('should render Runway Light Type', () => {
    optionChange(SETTING_ID.RUNWAY_LIGHT_TYPE);
    expect(wrapper.find(RunwayLightType)).to.have.length(1);
  });

  it('should test Runway Approach Light', () => {
    optionChange(SETTING_ID.RUNWAY_APPROACH_LIGHT);
    // get request
    const loadRunwayApproachLight = sinon.spy(props.airportSettingsStore, 'loadRunwayApproachLight');
    getRunwaySettings();
    expect(loadRunwayApproachLight.called).to.be.true;
    // upsert request
    const upsertRunwayApproachLight = sinon.spy(props.airportSettingsStore, 'upsertRunwayApproachLight');
    upsertRunwaySettings();
    expect(upsertRunwayApproachLight.called).to.be.true;
  });

  it('should test Runway RVR', () => {
    optionChange(SETTING_ID.RUNWAY_RVR);
    // get request
    const loadRunwayRVR = sinon.spy(props.airportSettingsStore, 'loadRunwayRVR');
    getRunwaySettings();
    expect(loadRunwayRVR.called).to.be.true;
    // upsert request
    const upsertRunwayRVR = sinon.spy(props.airportSettingsStore, 'upsertRunwayRVR');
    upsertRunwaySettings();
    expect(upsertRunwayRVR.called).to.be.true;
  });

  it('should test Runway VGSI', () => {
    optionChange(SETTING_ID.RUNWAY_VGSI);
    // get request
    const loadRunwayVGSI = sinon.spy(props.airportSettingsStore, 'loadRunwayVGSI');
    getRunwaySettings();
    expect(loadRunwayVGSI.called).to.be.true;
    // upsert request
    const upsertRunwayVGSI = sinon.spy(props.airportSettingsStore, 'upsertRunwayVGSI');
    upsertRunwaySettings();
    expect(upsertRunwayVGSI.called).to.be.true;
  });

  it('should render ICAOCode component', () => {
    optionChange(SETTING_ID.OFFICIAL_ICAO_CODE);
    expect(wrapper.find(ICAOCode)).to.have.length(1);
  });

  it('should render MilitaryUseType  component', () => {
    optionChange(SETTING_ID.MILITARY_USE_TYPE);
    expect(wrapper.find(MilitaryUseType)).to.have.length(1);
  });

  it('should render AirportHoursSubType  component', () => {
    optionChange(SETTING_ID.AIRPORT_HOUR_SUB_TYPE);
    expect(wrapper.find(AirportHoursSubType)).to.have.length(1);
  });

  it('should render AirportHourRemark  component', () => {
    optionChange(SETTING_ID.AIRPORT_HOUR_REMARK);
    expect(wrapper.find(AirportHourRemark)).to.have.length(1);
  });

  it('should render ConditionType  component', () => {
    optionChange(SETTING_ID.CONDITION_TYPE);
    expect(wrapper.find(ConditionType)).to.have.length(1);
  });

  it('should render ConditionalOperator  component', () => {
    optionChange(SETTING_ID.CONDITIONAL_OPERATOR);
    expect(wrapper.find(ConditionalOperator)).to.have.length(1);
  });

  it('should render AirportHoursBuffer  component', () => {
    optionChange(SETTING_ID.AIRPORT_HOURS_BUFFER);
    expect(wrapper.find(AirportHoursBuffer)).to.have.length(1);
  });

  it('should render AirportHoursSubType  component', () => {
    optionChange(SETTING_ID.AIRPORT_HOUR_SUB_TYPE);
    expect(wrapper.find(AirportHoursSubType)).to.have.length(1);
  });

  it('should test Weather Reporting System', () => {
    optionChange(SETTING_ID.WEATHER_REPORTING_SYSTEM);
    // get request
    const loadWeatherReportingSystem = sinon.spy(props.airportSettingsStore, 'loadWeatherReportingSystem');
    getAirportCodeSettings();
    expect(loadWeatherReportingSystem.called).to.be.true;
    // upsert request
    const upsertWeatherReportingSystem = sinon.spy(props.airportSettingsStore, 'upsertWeatherReportingSystem');
    upsertAirportCodeSettings();
    expect(upsertWeatherReportingSystem.called).to.be.true;
  });

  it('should test Class Code', () => {
    optionChange(SETTING_ID.AIRPORT_CLASS_CODE);
    // get request
    const loadClassCode = sinon.spy(props.airportSettingsStore, 'loadClassCode');
    getAirportCodeSettings();
    expect(loadClassCode.called).to.be.true;
    // upsert request
    const upsertClassCode = sinon.spy(props.airportSettingsStore, 'upsertClassCode');
    upsertAirportCodeSettings();
    expect(upsertClassCode.called).to.be.true;
  });

  it('should test Certificate Code', () => {
    optionChange(SETTING_ID.AIRPORT_CERTIFICATE_CODE);
    // get request
    const loadCertificateCode = sinon.spy(props.airportSettingsStore, 'loadCertificateCode');
    getAirportCodeSettings();
    expect(loadCertificateCode.called).to.be.true;
    // upsert request
    const upsertCertificateCode = sinon.spy(props.airportSettingsStore, 'upsertCertificateCode');
    upsertAirportCodeSettings();
    expect(upsertCertificateCode.called).to.be.true;
  });

  it('should test Service Code', () => {
    optionChange(SETTING_ID.AIRPORT_SERVICE_CODE);
    // get request
    const loadServiceCode = sinon.spy(props.airportSettingsStore, 'loadServiceCode');
    getAirportCodeSettings();
    expect(loadServiceCode.called).to.be.true;
    // upsert request
    const upsertServiceCode = sinon.spy(props.airportSettingsStore, 'upsertServiceCode');
    upsertAirportCodeSettings();
    expect(upsertServiceCode.called).to.be.true;
  });

  it('should test Runway Navaids', () => {
    optionChange(SETTING_ID.RUNWAY_NAVAIDS);
    // get request
    const loadRunwayNavaids = sinon.spy(props.airportSettingsStore, 'loadRunwayNavaids');
    getRunwaySettings();
    expect(loadRunwayNavaids.called).to.be.true;
    // upsert request
    const upsertRunwayNavaids = sinon.spy(props.airportSettingsStore, 'upsertRunwayNavaids');
    upsertRunwaySettings();
    expect(upsertRunwayNavaids.called).to.be.true;
  });

  it('should test Runway Approach Type', () => {
    optionChange(SETTING_ID.RUNWAY_APPROACH_TYPE);
    // get request
    const loadRunwayApproachType = sinon.spy(props.airportSettingsStore, 'loadRunwayApproachType');
    getRunwaySettings();
    expect(loadRunwayApproachType.called).to.be.true;
    // upsert request
    const upsertRunwayApproachType = sinon.spy(props.airportSettingsStore, 'upsertRunwayApproachType');
    upsertRunwaySettings();
    expect(upsertRunwayApproachType.called).to.be.true;
  });

  it('should test Runway Usage Type', () => {
    optionChange(SETTING_ID.RUNWAY_USAGE_TYPE);
    // get request
    const loadRunwayUsageTypes = sinon.spy(props.airportSettingsStore, 'loadRunwayUsageTypes');
    getSettings();
    expect(loadRunwayUsageTypes.called).to.be.true;
    // upsert request
    const upsertRunwayUsageType = sinon.spy(props.airportSettingsStore, 'upsertRunwayUsageType');
    upsertSettings();
    expect(upsertRunwayUsageType.called).to.be.true;
  });

  it('should test Frequency Type', function() {
    optionChange(SETTING_ID.FREQUENCY_TYPE);
    // get request
    const loadFrequencyTypes = sinon.spy(props.airportSettingsStore, 'loadFrequencyTypes');
    getSettings();
    expect(loadFrequencyTypes.called).to.be.true;
    // upsert request
    const upsertFrequencyType = sinon.spy(props.airportSettingsStore, 'upsertFrequencyType');
    upsertSettings();
    expect(upsertFrequencyType.called).to.be.true;
  });

  it('should test Sector', function() {
    optionChange(SETTING_ID.SECTOR);
    // get request
    const loadSectors = sinon.spy(props.airportSettingsStore, 'loadSectors');
    getSettings();
    expect(loadSectors.called).to.be.true;
    // upsert request
    const upsertSector = sinon.spy(props.airportSettingsStore, 'upsertSector');
    upsertSettings();
    expect(upsertSector.called).to.be.true;
  });

  it('should Bulletin Level', function() {
    optionChange(SETTING_ID.BULLETIN_LEVEL);
    // get request
    const getBulletinLevel = sinon.spy(props.airportSettingsStore, 'getBulletinLevels');
    getSettings();
    expect(getBulletinLevel.called).to.be.true;
    // upsert request
    const upsertBulletinLevel = sinon.spy(props.airportSettingsStore, 'upsertBulletinLevels');
    upsertSettings();
    expect(upsertBulletinLevel.called).to.be.true;
  });

  it('should Bulletin Type', function() {
    optionChange(SETTING_ID.BULLETIN_TYPE);
    // get request
    const getBulletinTypes = sinon.spy(props.airportSettingsStore, 'getBulletinTypes');
    getSettings();
    expect(getBulletinTypes.called).to.be.true;
    // upsert request
    const upsertBulletinTypes = sinon.spy(props.airportSettingsStore, 'upsertBulletinTypes');
    upsertSettings();
    expect(upsertBulletinTypes.called).to.be.true;
  });

  it('should Bulletin Source', function() {
    optionChange(SETTING_ID.BULLETIN_SOURCE);
    // get request
    const getBulletinSource = sinon.spy(props.airportSettingsStore, 'getSources');
    getSettings();
    expect(getBulletinSource.called).to.be.true;
    // upsert request
    const upsertBulletinSource = sinon.spy(props.airportSettingsStore, 'upsertSources');
    upsertSettings();
    expect(upsertBulletinSource.called).to.be.true;
  });

  it('should Bulletin priority', function() {
    optionChange(SETTING_ID.BULLETIN_PRIORITY);
    // get request
    const getBulletinPriority = sinon.spy(props.airportSettingsStore, 'getBulletinPriorities');
    getSettings();
    expect(getBulletinPriority.called).to.be.true;
    // upsert request
    const upsertBulletinPriority = sinon.spy(props.airportSettingsStore, 'upsertBulletinPriorities');
    upsertSettings();
    expect(upsertBulletinPriority.called).to.be.true;
  });

  it('should Fuel Types', function() {
    optionChange(SETTING_ID.FUEL_TYPE);
    // get request
    const getFuelTypes = sinon.spy(props.airportSettingsStore, 'loadFuelTypes');
    getSettings();
    expect(getFuelTypes.called).to.be.true;
    // upsert request
    const upsertFuelTypes = sinon.spy(props.airportSettingsStore, 'upsertFuelTypes');
    upsertSettings();
    expect(upsertFuelTypes.called).to.be.true;
  });

  it('should Oil Types', function() {
    optionChange(SETTING_ID.OIL_TYPE);
    // get request
    const getOilTypes = sinon.spy(props.airportSettingsStore, 'loadOilTypes');
    getSettings();
    expect(getOilTypes.called).to.be.true;
    // upsert request
    const upsertOilTypes = sinon.spy(props.airportSettingsStore, 'upsertOilTypes');
    upsertSettings();
    expect(upsertOilTypes.called).to.be.true;
  });

  it('should Area Port Assignments', function() {
    optionChange(SETTING_ID.AREA_PORT_ASSIGNMENT);
    // get request
    const getAreaPortAssignments = sinon.spy(props.airportSettingsStore, 'loadAreaPortAssignments');
    getSettings();
    expect(getAreaPortAssignments.called).to.be.true;
    // upsert request
    const upsertAreaPortAssignments = sinon.spy(props.airportSettingsStore, 'upsertAreaPortAssignment');
    upsertSettings();
    expect(upsertAreaPortAssignments.called).to.be.true;
  });

  it('should Required Information Types', function() {
    optionChange(SETTING_ID.REQUIRED_INFORMATION_TYPE);
    // get request
    const getRequiredInformationTypes = sinon.spy(props.airportSettingsStore, 'loadRequiredInformationTypes');
    getSettings();
    expect(getRequiredInformationTypes.called).to.be.true;
    // upsert request
    const upsertRequiredInformationTypes = sinon.spy(props.airportSettingsStore, 'upsertRequiredInformationType');
    upsertSettings();
    expect(upsertRequiredInformationTypes.called).to.be.true;
  });

  it('should Field Office Oversights', function() {
    optionChange(SETTING_ID.FIELD_OFFICE_OVERSIGHT);
    // get request
    const getFieldOfficeOversights = sinon.spy(props.airportSettingsStore, 'loadFieldOfficeOversights');
    getSettings();
    expect(getFieldOfficeOversights.called).to.be.true;
    // upsert request
    const upsertFieldOfficeOversights = sinon.spy(props.airportSettingsStore, 'upsertFieldOfficeOversight');
    upsertSettings();
    expect(upsertFieldOfficeOversights.called).to.be.true;
  });

  it('should Customs Location Information', function() {
    optionChange(SETTING_ID.CUSTOMS_LOCATION_INFORMATION);
    // get request
    const getCustomsLocationInformation = sinon.spy(props.airportSettingsStore, 'loadCustomsLocationInformation');
    getSettings();
    expect(getCustomsLocationInformation.called).to.be.true;
    // upsert request
    const upsertCustomsLocationInformation = sinon.spy(props.airportSettingsStore, 'upsertCustomsLocationInformation');
    upsertSettings();
    expect(upsertCustomsLocationInformation.called).to.be.true;
  });

  it('should Max POB Options', function() {
    optionChange(SETTING_ID.MAX_POB_OPTION);
    // get request
    const getMaxPOBOptions = sinon.spy(props.airportSettingsStore, 'loadMaxPOBOptions');
    getSettings();
    expect(getMaxPOBOptions.called).to.be.true;
    // upsert request
    const upsertMaxPOBOptions = sinon.spy(props.airportSettingsStore, 'upsertMaxPOBOption');
    upsertSettings();
    expect(upsertMaxPOBOptions.called).to.be.true;
  });

  it('should Cbp Port Types', function() {
    optionChange(SETTING_ID.CBP_PORT_TYPE);
    // get request
    const getCbpPortTypes = sinon.spy(props.airportSettingsStore, 'loadCbpPortTypes');
    getSettings();
    expect(getCbpPortTypes.called).to.be.true;
    // upsert request
    const upsertCbpPortTypes = sinon.spy(props.airportSettingsStore, 'upsertCbpPortType');
    upsertSettings();
    expect(upsertCbpPortTypes.called).to.be.true;
  });

  it('should Visa Timing', function() {
    optionChange(SETTING_ID.VISA_TIMING);
    // get request
    const getVisaTiming = sinon.spy(props.airportSettingsStore, 'loadVisaTimings');
    getSettings();
    expect(getVisaTiming.called).to.be.true;
    // upsert request
    const upsertVisaTiming = sinon.spy(props.airportSettingsStore, 'upsertVisaTiming');
    upsertSettings();
    expect(upsertVisaTiming.called).to.be.true;
  });

  it('should Ramp Side Access', function() {
    optionChange(SETTING_ID.RAMP_SIDE_ACCESS);
    // get request
    const getRampSideAccess = sinon.spy(props.airportSettingsStore, 'loadRampSideAccess');
    getSettings();
    expect(getRampSideAccess.called).to.be.true;
    // upsert request
    const upsertRampSideAccess = sinon.spy(props.airportSettingsStore, 'upsertRampSideAccess');
    upsertSettings();
    expect(upsertRampSideAccess.called).to.be.true;
  });

  it('should Ramp Side Access Third Party Vendors', function() {
    optionChange(SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY_VENDORS);
    // get request
    const getRampSideAccessThirdPartyVendors = sinon.spy(
      props.airportSettingsStore,
      'loadRampSideAccessThirdPartyVendors'
    );
    getSettings();
    expect(getRampSideAccessThirdPartyVendors.called).to.be.true;
    // upsert request
    const upsertRampSideAccessThirdPartyVendors = sinon.spy(
      props.airportSettingsStore,
      'upsertRampSideAccessThirdPartyVendors'
    );
    upsertSettings();
    expect(upsertRampSideAccessThirdPartyVendors.called).to.be.true;
  });

  it('should Ramp Side Access Third Party', function() {
    optionChange(SETTING_ID.RAMP_SIDE_ACCESS_THIRD_PARTY);
    // get request
    const getRampSideAccessThirdParty = sinon.spy(props.airportSettingsStore, 'loadRampSideAccessThirdParty');
    getSettings();
    expect(getRampSideAccessThirdParty.called).to.be.true;
    // upsert request
    const upsertRampSideAccessThirdParty = sinon.spy(props.airportSettingsStore, 'upsertRampSideAccessThirdParty');
    upsertSettings();
    expect(upsertRampSideAccessThirdParty.called).to.be.true;
  });

  it('should Security Measures', function() {
    optionChange(SETTING_ID.SECURITY_MEASURES);
    // get request
    const getSecurityMeasures = sinon.spy(props.airportSettingsStore, 'loadSecurityMeasures');
    getSettings();
    expect(getSecurityMeasures.called).to.be.true;
    // upsert request
    const upsertSecurityMeasures = sinon.spy(props.airportSettingsStore, 'upsertSecurityMeasures');
    upsertSettings();
    expect(upsertSecurityMeasures.called).to.be.true;
  });

  it('should Recommended Services', function() {
    optionChange(SETTING_ID.RECOMMENDED_SERVICES);
    // get request
    const getRecommendedServices = sinon.spy(props.airportSettingsStore, 'loadRecommendedServices');
    getSettings();
    expect(getRecommendedServices.called).to.be.true;
    // upsert request
    const upsertRecommendedServices = sinon.spy(props.airportSettingsStore, 'upsertRecommendedServices');
    upsertSettings();
    expect(upsertRecommendedServices.called).to.be.true;
  });

  it('should test Noise Classifications', function() {
    optionChange(SETTING_ID.NOISE_CLASSIFICATION);
    // get request
    const loadClassifications = sinon.spy(props.airportSettingsStore, 'loadNoiseClassifications');
    getSettings();
    expect(loadClassifications.called).to.be.true;
    // upsert request
    const upsertClassification = sinon.spy(props.airportSettingsStore, 'upsertNoiseClassification');
    upsertSettings();
    expect(upsertClassification.called).to.be.true;
  });

  it('should test Customs Contact Type', () => {
    optionChange(SETTING_ID.CONTACT_TYPE);
    // get request
    const loadContactTypes = sinon.spy(props.airportSettingsStore, 'loadCustomsContactTypes');
    getSettings();
    expect(loadContactTypes.called).to.be.true;
    // upsert request
    const upsertContactType = sinon.spy(props.airportSettingsStore, 'upsertCustomsContactType');
    upsertSettings();
    expect(upsertContactType.called).to.be.true;
  });

  it('should test Customs Contact Address Type', () => {
    optionChange(SETTING_ID.CONTACT_ADDRESS_TYPE);
    // get request
    const loadContactAddressTypes = sinon.spy(props.airportSettingsStore, 'loadCustomsContactAddressTypes');
    getSettings();
    expect(loadContactAddressTypes.called).to.be.true;
    // upsert request
    const upsertContactAddressType = sinon.spy(props.airportSettingsStore, 'upsertCustomsContactAddressType');
    upsertSettings();
    expect(upsertContactAddressType.called).to.be.true;
  });
});
