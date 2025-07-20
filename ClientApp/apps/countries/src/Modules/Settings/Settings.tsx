import React, { ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { CappsCategory, UpsertSettings } from '@wings/shared';
import { countrySidebarOptions, SETTING_ID, SettingsStore, useCountryModuleSecurity } from '../Shared';
import { CAPPSTerritoryType, NavBlueCountryMapping, SecurityThreatLevel } from './Components';
import { SelectOption, regex } from '@wings-shared/core';
import { categoryList, settingList } from './Fields';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Settings: React.FC<Props> = ({ settingsStore, sidebarStore }) => {
  const [ activeCategory, setActiveCategory ] = useState<number>(1);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(1);
  const _settingsStore = settingsStore as SettingsStore;
  const countryModuleSecurity = useCountryModuleSecurity();

  useEffect(() => {
    sidebarStore?.setNavLinks(countrySidebarOptions(true), 'countries');
  }, []);

  const subCategories = (category?: number): SelectOption[] => {
    return settingList
      .filter(setting => setting.categoryId === (category || activeCategory))
      .map(setting => new SelectOption({ name: setting.settingLabel, value: setting.settingId }));
  };

  const onCategoryChange = (categoryID: number): void => {
    setActiveCategory(categoryID);
    setActiveSubCategory(subCategories(categoryID)[0].value as number);
  };

  const onSubCategoryChange = (categoryID: number): void => {
    setActiveSubCategory(categoryID);
  };

  const renderSetting = (): ReactNode => {
    if (!_settingsStore) {
      return <React.Fragment />;
    }
    switch (activeSubCategory) {
      case SETTING_ID.CAPPS_TERRITORY_TYPE:
        return <CAPPSTerritoryType />;
      case SETTING_ID.REGION_TYPE:
        return (
          <UpsertSettings
            type="Region Type"
            key="regionType"
            upsertSettings={data => _settingsStore.upsertRegionType(data)}
            getSettings={() => _settingsStore.getRegionTypes()}
            settingsData={_settingsStore.regionTypes}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.FEE_REQUIREMENT:
        return (
          <UpsertSettings
            type="Fee Requirement"
            key="feeRequirement"
            upsertSettings={data => _settingsStore.upsertFeeRequirement(data)}
            getSettings={() => _settingsStore.getFeeRequirement()}
            settingsData={_settingsStore.feeRequirement}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.STATE_TYPE:
        return (
          <UpsertSettings
            type="State Type"
            key="stateType"
            upsertSettings={data => _settingsStore.upsertStateType(data)}
            getSettings={() => _settingsStore.getStateTypes()}
            settingsData={_settingsStore.stateTypes}
            isNameUnique={false}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.SECURITY_THREAT_LEVEL:
        return <SecurityThreatLevel />;
      case SETTING_ID.AIP_SOURCE_TYPE:
        return (
          <UpsertSettings
            isEditable={false}
            type="AIP Source Type"
            key="aipSourceType"
            upsertSettings={data => _settingsStore.upsertAIPSourceTypes(data)}
            getSettings={() => _settingsStore.getAIPSourceTypes()}
            settingsData={_settingsStore.aipSourceTypes}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
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
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.NAVIGATOR_FLIGHT_TYPE:
        return (
          <UpsertSettings
            type="Navigator Flight Type"
            key="navigatorFlightType"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertNavigators(data)}
            getSettings={() => _settingsStore.getNavigators()}
            settingsData={_settingsStore.navigators}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.BULLETIN_LEVEL:
        return (
          <UpsertSettings
            isEditable={false}
            type="Bulletin Level"
            key="bulletinLevel"
            upsertSettings={data => _settingsStore.upsertBulletinLevels(data)}
            getSettings={() => _settingsStore.getBulletinLevels()}
            settingsData={_settingsStore.bulletinLevels}
            hideAddNewButton={true}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.BULLETIN_TYPE:
        return (
          <UpsertSettings
            isEditable={true}
            type="Bulletin Type"
            key="bulletinType"
            upsertSettings={data => _settingsStore.upsertBulletinTypes(data)}
            getSettings={() => _settingsStore.getBulletinTypes()}
            settingsData={_settingsStore.bulletinTypes}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.BULLETIN_SOURCE:
        return (
          <UpsertSettings
            isEditable={false}
            type="Source"
            key="source"
            upsertSettings={data => _settingsStore.upsertSources(data)}
            getSettings={() => _settingsStore.getSources()}
            settingsData={_settingsStore.sources}
            hideAddNewButton={true}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.BULLETIN_PRIORITY:
        return (
          <UpsertSettings
            isEditable={false}
            type="Bulletin Priority"
            key="bulletinPriority"
            upsertSettings={data => _settingsStore.upsertBulletinPriorities(data)}
            getSettings={() => _settingsStore.getBulletinPriorities()}
            settingsData={_settingsStore.bulletinPriorities}
            hideAddNewButton={true}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );

      case SETTING_ID.CAPPS_CATEGORY_CODE:
        return <CappsCategory isSettingsEditable={countryModuleSecurity.isSettingsEditable} />;
      case SETTING_ID.CABOTAGE_EXEMPTION_LEVEL:
        return (
          <UpsertSettings
            isEditable={true}
            type="Cabotage Exemption Level"
            key="cabotageExemptionLevel"
            upsertSettings={data => _settingsStore.upsertCabotageExemptionLevels(data)}
            getSettings={() => _settingsStore.getCabotageExemptionLevels()}
            settingsData={_settingsStore.cabotageExemptionLevels}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.ITEMS_18_CONTENTS:
        return (
          <UpsertSettings
            isEditable={true}
            type="Item 18 Content"
            key="items18Contents"
            upsertSettings={data => _settingsStore.upsertItem18Content(data)}
            getSettings={() => _settingsStore.getItem18Content()}
            settingsData={_settingsStore.item18Content}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.AIRCRAFT_EQUIPMENT:
        return (
          <UpsertSettings
            isEditable={true}
            type="Aircraft Equipment"
            key="aircraftEquipment"
            upsertSettings={data => _settingsStore.upsertAircraftEquipment(data)}
            getSettings={() => _settingsStore.getAircraftEquipment()}
            settingsData={_settingsStore.aircraftEquipment}
            regExp={regex.alphaNumeric}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.REQUIREMENT_TYPE:
        return (
          <UpsertSettings
            isEditable={true}
            type="Requirement Type"
            key="requirementType"
            upsertSettings={data => _settingsStore.upsertRequirementType(data)}
            getSettings={() => _settingsStore.getRequirementType()}
            settingsData={_settingsStore.requirementType}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.DISINSECTION_TYPE:
        return (
          <UpsertSettings
            type="Disinsection Types"
            key="disinsectionType"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertDisinsectionType(data)}
            getSettings={() => _settingsStore.getDisinsectionType()}
            settingsData={_settingsStore.disinsectionType}
            regExp={regex.all}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.DISINSECTION_CHEMICAL:
        return (
          <UpsertSettings
            type="Disinsection Chemicals"
            key="disinsectionChemical"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertDisinsectionChemical(data)}
            getSettings={() => _settingsStore.getDisinsectionChemical()}
            settingsData={_settingsStore.disinsectionChemical}
            regExp={regex.all}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.APIS_REQUIREMENT:
        return (
          <UpsertSettings
            type="APIS Requirement"
            key="apisRequirement"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertAPISRequirement(data)}
            getSettings={() => _settingsStore.getAPISRequirement()}
            settingsData={_settingsStore.apisRequirement}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.NAVBLUE_COUNTRY_MAPPING:
        return <NavBlueCountryMapping />;
      case SETTING_ID.DECLARATION_FOR_CASH_CURRENCY:
        return (
          <UpsertSettings
            type="Declaration for Cash Currency"
            key="declarationForCashCurrency"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertDeclarationForCashCurrency(data)}
            getSettings={() => _settingsStore.getDeclarationForCashCurrency()}
            settingsData={_settingsStore.declarationForCashCurrency}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.APIS_SUBMISSION:
        return (
          <UpsertSettings
            type="APIS Submission"
            key="apisSubmission"
            isEditable={true}
            upsertSettings={data => _settingsStore.upsertAPISSubmission(data)}
            getSettings={() => _settingsStore.getAPISSubmission()}
            settingsData={_settingsStore.apisSubmission}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.WEAPON_INFORMATION:
        return (
          <UpsertSettings
            isEditable={true}
            type="Cabotage Exemption Level"
            key="cabotageExemptionLevel"
            upsertSettings={data => _settingsStore.upsertWeaponInformation(data)}
            getSettings={() => _settingsStore.getWeaponInformation()}
            settingsData={_settingsStore.weaponInformation}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.FAOC_APPLICABLE:
        return (
          <UpsertSettings
            type="FAOC Applicable"
            key="faocApplicable"
            upsertSettings={data => _settingsStore.upsertFAOCApplicable(data)}
            getSettings={() => _settingsStore.getFAOCApplicable()}
            settingsData={_settingsStore.faocApplicable}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.EXPIRATION:
        return (
          <UpsertSettings
            type="Expiration"
            key="expiration"
            upsertSettings={data => _settingsStore.upsertExpiration(data)}
            getSettings={() => _settingsStore.getExpiration()}
            settingsData={_settingsStore.expiration}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
      default:
      case SETTING_ID.TERRITORY_TYPE:
        return (
          <UpsertSettings
            type="Territory Type"
            key="territoryType"
            upsertSettings={data => _settingsStore.upsertTerritoryType(data)}
            getSettings={() => _settingsStore.getTerritoryTypes()}
            settingsData={_settingsStore.territoryTypes}
            hasSuperPermission={countryModuleSecurity.isSettingsEditable}
          />
        );
    }
  };

  return (
    <SettingsLayout
      title="Country"
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

export default inject('settingsStore', 'sidebarStore')(observer(Settings));
