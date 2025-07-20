import React, { ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { UpsertSettings } from '@wings/shared';
import {
  AircraftOperatorSettings,
  HealthAuthStore,
  HealthVendorStore,
  SETTING_ID,
  SettingsStore,
  sidebarOptions,
  useRestrictionModuleSecurity,
} from '../Shared';
import {
  AircraftOperatorRestrictionType,
  FlightAllowed,
  LeadTimeIndicator,
  QuarantineLocation,
  RestrictionSeverity,
  RestrictionSource,
  TraveledHistorySubCategory,
  UWAAllowableAction,
} from './Components';
import { SelectOption, regex } from '@wings-shared/core';
import { categoryList, settingList } from './Fields';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  settingsStore?: SettingsStore;
  healthAuthStore?: HealthAuthStore;
  healthVendorStore?: HealthVendorStore;
  aircraftOperatorSettingsStore?: AircraftOperatorSettings;
  sidebarStore?: typeof SidebarStore;
}

const Settings: React.FC<Props> = ({
  settingsStore,
  healthAuthStore,
  healthVendorStore,
  aircraftOperatorSettingsStore,
  sidebarStore,
}) => {
  const [ activeCategory, setActiveCategory ] = useState<number>(1);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(1);
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _settingsStore = settingsStore as SettingsStore;
  const _healthAuthStore = healthAuthStore as HealthAuthStore;
  const _healthVendorStore = healthVendorStore as HealthVendorStore;
  const _aircraftOperatorSettingsStore = aircraftOperatorSettingsStore as AircraftOperatorSettings;

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(sidebarOptions(false), 'restrictions');
  }, []);

  const subCategories = (category?: number): SelectOption[] => {
    return settingList
      .filter(setting => setting.categoryId === (category || activeCategory))
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  };

  const onCategoryChange = (categoryID: number): void => {
    setActiveCategory(categoryID);
    setActiveSubCategory(subCategories(categoryID)[0]?.value as number);
  };

  const onSubCategoryChange = (categoryID: number): void => {
    setActiveSubCategory(categoryID);
  };

  /* istanbul ignore next */
  const renderSetting = (): ReactNode => {
    switch (activeSubCategory) {
      case SETTING_ID.UWA_ALLOWABLE_ACTION:
        return <UWAAllowableAction />;
      case SETTING_ID.LANDING_OR_OVERFLIGHT:
        return (
          <UpsertSettings
            type="Landing Or Overflight"
            key="landingOrOverflight"
            upsertSettings={data => _settingsStore.upsertLandingOrOverflight(data)}
            getSettings={() => _settingsStore.getLandingOrOverflights()}
            settingsData={_settingsStore.landingOrOverflights}
            isNameUnique={false}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.RESTRICTION_TYPE:
        return (
          <UpsertSettings
            type="Restriction Type"
            key="restrictionType"
            upsertSettings={data => _settingsStore.upsertRestrictionType(data)}
            getSettings={() => _settingsStore.getRestrictionTypes()}
            settingsData={_settingsStore.restrictionTypes}
            isNameUnique={false}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.APPROVAL_TYPE:
        return (
          <UpsertSettings
            type="Approval Type"
            key="approvalType"
            upsertSettings={data => _settingsStore.upsertApprovalType(data)}
            getSettings={() => _settingsStore.getApprovalTypes()}
            settingsData={_settingsStore.approvalTypes}
            isNameUnique={false}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.RESTRICTION_APPLIES:
        return (
          <UpsertSettings
            type="Restriction Apply"
            key="restrictionApply"
            upsertSettings={data => _settingsStore.upsertRestrictionApply(data)}
            getSettings={() => _settingsStore.getRestrictionApplies()}
            settingsData={_settingsStore.restrictionApplies}
            isNameUnique={false}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.RESTRICTION_SOURCE:
        return <RestrictionSource />;
      case SETTING_ID.RESTRICTION_LEVEL:
        return (
          <UpsertSettings
            type="Restriction Level"
            key="restrictionLevel"
            upsertSettings={data => _settingsStore.upsertRestrictionLevel(data)}
            getSettings={() => _settingsStore.getRestrictionLevels()}
            settingsData={_settingsStore.restrictionLevels}
            isNameUnique={false}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            type="Source Type"
            key="sourceType"
            isEditable={false}
            upsertSettings={data => _settingsStore.upsertSourceType(data)}
            getSettings={() => _settingsStore.getSourceTypes()}
            settingsData={_settingsStore.sourceTypes}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            type="Access Level"
            key="accessLevel"
            isEditable={false}
            upsertSettings={data => _settingsStore.upsertAccessLevel(data)}
            getSettings={() => _settingsStore.getAccessLevels()}
            settingsData={_settingsStore.accessLevels}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.AUTHORIZATION_LEVEL:
        return (
          <UpsertSettings
            type="Authorization Level"
            key="authorizationLevel"
            upsertSettings={data => _healthAuthStore.upsertAuthorizationLevel(data)}
            getSettings={() => _healthAuthStore.getAuthorizationLevels()}
            settingsData={_healthAuthStore.authorizationLevels}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.INFECTION_TYPE:
        return (
          <UpsertSettings
            type="Infection Type"
            key="infectionType"
            upsertSettings={data => _healthAuthStore.upsertInfectionType(data)}
            getSettings={() => _healthAuthStore.getInfectionTypes()}
            settingsData={_healthAuthStore.infectionTypes}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.AFFECTED_TYPE:
        return (
          <UpsertSettings
            type="Affected Type"
            key="affectedType"
            upsertSettings={data => _healthAuthStore.upsertAffectedType(data)}
            getSettings={() => _healthAuthStore.getAffectedTypes()}
            settingsData={_healthAuthStore.affectedTypes}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.HEALTH_FORM:
        return (
          <UpsertSettings
            type="Health Form"
            key="healthForm"
            upsertSettings={data => _settingsStore.upsertHealthForm(data)}
            getSettings={() => _settingsStore.getHealthForms()}
            settingsData={_settingsStore.healthForms}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.TEST_TYPE:
        return (
          <UpsertSettings
            type="Test Type"
            key="testType"
            upsertSettings={data => _settingsStore.upsertTestType(data)}
            getSettings={() => _settingsStore.getTestTypes()}
            settingsData={_settingsStore.testTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.CONTACT_LEVEL:
        return (
          <UpsertSettings
            type="Contact Level"
            key="contactLevel"
            upsertSettings={data => _healthVendorStore.upsertContactLevels(data)}
            getSettings={() => _healthVendorStore.getContactLevels()}
            settingsData={_healthVendorStore.contactLevels}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.STATUS:
        return (
          <UpsertSettings
            type="Status"
            key="status"
            upsertSettings={() => null}
            getSettings={() => _settingsStore.getStatus()}
            settingsData={_settingsStore.status}
            isEditable={false}
            hideAddNewButton={true}
            isExactMatch={true}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.WHO_CAN_LEAVE_AIRCRAFT:
        return (
          <UpsertSettings
            type="Who Can Leave Aircraft"
            key="whoCanLeaveAircraft"
            upsertSettings={data => _settingsStore.upsertWhoCanLeaveAircraft(data)}
            getSettings={() => _settingsStore.getWhoCanLeaveAircraft()}
            settingsData={_settingsStore.whoCanLeaveAircraft}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.VACCINATION_PRIVILEGE:
        return (
          <UpsertSettings
            type="Vaccination Privilege"
            key="VaccinationPrivilege"
            upsertSettings={data => _settingsStore.upsertVaccinationPrivilege(data)}
            getSettings={() => _settingsStore.getVaccinationPrivileges()}
            settingsData={_settingsStore.vaccinationPrivileges}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.VACCINE_MANUFACTURER:
        return (
          <UpsertSettings
            type="Vaccine Manufacturer"
            key="VaccinationManufacturer"
            upsertSettings={data => _settingsStore.upsertVaccineManufacturer(data)}
            getSettings={() => _settingsStore.getVaccineManufacturers()}
            settingsData={_settingsStore.vaccineManufacturers}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.QUARANTINE_LOCATION:
        return <QuarantineLocation />;
      case SETTING_ID.LEAD_TIME_INDICATOR:
        return <LeadTimeIndicator />;
      case SETTING_ID.FLIGHTS_ALLOWED:
        return <FlightAllowed />;
      case SETTING_ID.OVERFLIGHT_LEVEL:
        return (
          <UpsertSettings
            type="Overflight Level"
            key="overflightLevels"
            upsertSettings={data => _settingsStore.upsertOverflightLevel(data)}
            getSettings={() => _settingsStore.getOverflightLevels()}
            settingsData={_settingsStore.overflightLevels}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.ARRIVAL_LEVEL:
        return (
          <UpsertSettings
            type="Arrival Level"
            key="arrivalLevels"
            upsertSettings={data => _settingsStore.upsertArrivalLevel(data)}
            getSettings={() => _settingsStore.getArrivalLevels()}
            settingsData={_settingsStore.arrivalLevels}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.BOARDING_TYPE:
        return (
          <UpsertSettings
            type="Boarding Type"
            key="boardingTypes"
            upsertSettings={data => _settingsStore.upsertBoardingType(data)}
            getSettings={() => _settingsStore.getBoardingTypes()}
            settingsData={_settingsStore.boardingTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.DEPARTURE_LEVEL:
        return (
          <UpsertSettings
            type="Departure Level"
            key="scheduleDepartureLevels"
            upsertSettings={data => _settingsStore.upsertScheduleDepartureLevel(data)}
            getSettings={() => _settingsStore.getScheduleDepartureLevels()}
            settingsData={_settingsStore.scheduleDepartureLevels}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.STAY_LENGTH_CATEGORY:
        return (
          <UpsertSettings
            type="Stay Length Category"
            key="stayLengthCategory"
            upsertSettings={data => _settingsStore.upsertStayLengthCategory(data)}
            getSettings={() => _settingsStore.getStayLengthCategories()}
            settingsData={_settingsStore.stayLengthCategories}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.CURFEW_HOUR_TYPE:
        return (
          <UpsertSettings
            type="Curfew Hour Type"
            key="curfewHourTypes"
            upsertSettings={data => _settingsStore.upsertCurfewHourType(data)}
            getSettings={() => _settingsStore.getCurfewHourTypes()}
            settingsData={_settingsStore.curfewHourTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.PPE_TYPE:
        return (
          <UpsertSettings
            type="PPE Type"
            key="ppeType"
            upsertSettings={data => _settingsStore.upsertPPEType(data)}
            getSettings={() => _settingsStore.getPPETypes()}
            settingsData={_settingsStore.ppeTypes}
            maxLength={50}
            regExp={regex.all}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.ID_TYPE:
        return (
          <UpsertSettings
            type="Id Type"
            key="idTypes"
            upsertSettings={data => _settingsStore.upsertIdType(data)}
            getSettings={() => _settingsStore.getIdTypes()}
            settingsData={_settingsStore.idTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.AIRCRAFT_OPERATOR_RESTRICTION_TYPE:
        return <AircraftOperatorRestrictionType />;
      case SETTING_ID.EFFECTED_ENTITY_TYPE:
        return (
          <UpsertSettings
            type="Effected Entity Type"
            key="effectedEntityTypes"
            upsertSettings={data => _aircraftOperatorSettingsStore.upsertEffectedEntityType(data)}
            getSettings={() => _aircraftOperatorSettingsStore.getEffectedEntityTypes()}
            settingsData={_aircraftOperatorSettingsStore.effectedEntityTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.ENFORCEMENT_AGENCY:
        return (
          <UpsertSettings
            type="Enforcement Agency"
            key="enforcementAgencies"
            upsertSettings={data => _aircraftOperatorSettingsStore.upsertEnforcementAgency(data)}
            getSettings={() => _aircraftOperatorSettingsStore.getEnforcementAgencies()}
            settingsData={_aircraftOperatorSettingsStore.enforcementAgencies}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.RESTRICTION_SEVERITY:
        return <RestrictionSeverity />;
      case SETTING_ID.APPROVAL_TYPE_REQUIRED:
        return (
          <UpsertSettings
            type="Approval Type Required"
            key="approvalTypesRequired"
            upsertSettings={data => _aircraftOperatorSettingsStore.upsertApprovalTypeRequired(data)}
            getSettings={() => _aircraftOperatorSettingsStore.getApprovalTypesRequired()}
            settingsData={_aircraftOperatorSettingsStore.approvalTypesRequired}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.RESTRICTION_FORM:
        return (
          <UpsertSettings
            type="Required Documents/Forms"
            key="requiredForms"
            upsertSettings={data => _aircraftOperatorSettingsStore.upsertRestrictionForm(data)}
            getSettings={() => _aircraftOperatorSettingsStore.getRestrictionForms()}
            settingsData={_aircraftOperatorSettingsStore.restrictionForms}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            isEditable={false}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.TRAVELED_HISTORY_CATEGORY:
        return (
          <UpsertSettings
            type="Travel History Category"
            key="travelHistoryCategory"
            upsertSettings={data => _settingsStore.upsertTravelHistoryCategory(data)}
            getSettings={() => _settingsStore.getTraveledHistoryCategories()}
            settingsData={_settingsStore.traveledHistoryCategories}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.TRAVELED_HISTORY_SUB_CATEGORY:
        return <TraveledHistorySubCategory />;
      case SETTING_ID.UWA_ALLOWABLE_SERVICE:
        return (
          <UpsertSettings
            type="UWA Allowable Service"
            key="uwaAllowableService"
            upsertSettings={data => _settingsStore.upsertUWAAllowableService(data)}
            getSettings={() => _settingsStore.getUWAAllowableServices()}
            settingsData={_settingsStore.uwaAllowableServices}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      default:
      case SETTING_ID.TRAVELLER_TYPE:
        return (
          <UpsertSettings
            type="Traveller Type"
            key="travellerType"
            upsertSettings={data => _settingsStore.upsertTravellerType(data)}
            getSettings={() => _settingsStore.getTravellerTypes()}
            settingsData={_settingsStore.travellerTypes}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.VACCINATION_STATUS:
        return (
          <UpsertSettings
            type="Vaccination Status"
            key="vaccinationStatus"
            upsertSettings={data => _settingsStore.upsertVaccinationStatus(data)}
            getSettings={() => _settingsStore.getVaccinationStatus()}
            settingsData={_settingsStore.vaccinationStatus}
            isNameUnique={true}
            regExp={regex.all}
            maxLength={50}
            hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
          />
        );
    }
  };

  return (
    <SettingsLayout
      title="Restriction"
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
  'healthAuthStore',
  'healthVendorStore',
  'aircraftOperatorSettingsStore',
  'sidebarStore'
)(observer(Settings));
