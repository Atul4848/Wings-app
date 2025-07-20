import React, { FC, ReactNode, useEffect, useState } from 'react';
import { UpsertSettings } from '@wings/shared';
import { SelectOption, regex } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { customerSidebarOptions, SETTING_ID, SettingsStore, useCustomerModuleSecurity } from '../Shared';
import { categoryList, settingList } from './Fields';
import { PassportNationality, ServiceType, CommunicationCategories } from './Components';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Settings: FC<Props> = ({ settingsStore, sidebarStore }: Props) => {
  const [ activeCategory, setActiveCategory ] = useState<number>(1);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(1);
  const _settingsStore = settingsStore as SettingsStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  useEffect(() => {
    sidebarStore?.setNavLinks(customerSidebarOptions(true), 'customer');
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
    switch (activeSubCategory) {
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            key="SourceType"
            type="Source Type"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertSourceType(data)}
            getSettings={() => _settingsStore.getSourceTypes()}
            settingsData={_settingsStore.sourceTypes}
            maxLength={100}
          />
        );
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            key="AccessLevel"
            type="Access Level"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertAccessLevel(data)}
            getSettings={() => _settingsStore.getAccessLevels()}
            settingsData={_settingsStore.accessLevels}
            maxLength={50}
          />
        );
      case SETTING_ID.SERVICE_TYPE:
        return <ServiceType />;
      case SETTING_ID.SPECIAL_CARE_TYPE:
        return (
          <UpsertSettings
            key="SpecialCareType"
            type="Special Care Type"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertSpecialCareType(data)}
            getSettings={() => _settingsStore.getSpecialCareType()}
            settingsData={_settingsStore.specialCareType}
            maxLength={50}
          />
        );
      case SETTING_ID.SPECIAL_CARE_TYPE_LEVEL:
        return (
          <UpsertSettings
            key="SpecialCareTypeLevel"
            type="Special Care Type Level"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertSpecialCareTypeLevel(data)}
            getSettings={() => _settingsStore.getSpecialCareTypeLevel()}
            settingsData={_settingsStore.specialCareTypeLevel}
            maxLength={50}
          />
        );
      case SETTING_ID.CONTACT_METHOD:
        return (
          <UpsertSettings
            key="ContactMethod"
            type="Contact Method"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertContactMethod(data)}
            getSettings={() => _settingsStore.getContactMethod()}
            settingsData={_settingsStore.contactMethod}
          />
        );
      case SETTING_ID.CONTACT_TYPE:
        return (
          <UpsertSettings
            key="ContactType"
            type="Contact Type"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertContactType(data)}
            getSettings={() => _settingsStore.getContactType()}
            settingsData={_settingsStore.contactType}
          />
        );
      case SETTING_ID.COMMUNICATION_CATEGORIES:
        return <CommunicationCategories />;
      case SETTING_ID.CONTACT_ROLE:
        return (
          <UpsertSettings
            key="ContactRole"
            type="Contact Role"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertContactRole(data)}
            getSettings={() => _settingsStore.getContactRole()}
            settingsData={_settingsStore.contactRole}
            maxLength={50}
            regExp={regex.alphabetWithSlash}
          />
        );
      case SETTING_ID.COMMUNICATION_LEVEL:
        return (
          <UpsertSettings
            key="CommunicationLevel"
            type="Communication Level"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertCommunicationLevel(data)}
            getSettings={() => _settingsStore.getCommunicationLevel()}
            settingsData={_settingsStore.communicationLevel}
          />
        );
      case SETTING_ID.PRIORITY:
        return (
          <UpsertSettings
            key="Priority"
            type="Priority"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertPriority(data)}
            getSettings={() => _settingsStore.getPriority()}
            settingsData={_settingsStore.priority}
            regExp={regex.all}
            maxLength={50}
          />
        );
      case SETTING_ID.NOTE_TYPE:
        return (
          <UpsertSettings
            key="noteType"
            type="NoteType"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertNoteType(data)}
            getSettings={() => _settingsStore.getNoteTypes()}
            settingsData={_settingsStore.noteTypes}
          />
        );
      case SETTING_ID.PASSPORT_NATIONALITY:
        return <PassportNationality />;
      case SETTING_ID.MAPPING_LEVEL:
        return (
          <UpsertSettings
            key="mappingLevel"
            type="External Customer Mapping Level"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertExternalCustomermappingLevel(data)}
            getSettings={() => _settingsStore.getExternalCustomermappingLevels()}
            settingsData={_settingsStore.externalCustomermappingLevels}
            regExp={regex.alphabetWithSlash}
            isEditable={false}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.EXTERNAL_ACCOUNT:
        return (
          <UpsertSettings
            key="externalCustomerSource"
            type="External Customer Source"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertExternalCustomerSource(data)}
            getSettings={() => _settingsStore.getExternalCustomerSources()}
            settingsData={_settingsStore.externalCustomerSources}
          />
        );
      case SETTING_ID.TEAM_USE_TYPE:
        return (
          <UpsertSettings
            key="teamUseType"
            type="Team Use Type"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertTeamUseType(data)}
            getSettings={() => _settingsStore.getTeamUseType()}
            settingsData={_settingsStore.teamUseType}
            maxLength={50}
            isEditable={false}
          />
        );
      case SETTING_ID.TEAM_TYPE:
        return (
          <UpsertSettings
            key="teamType"
            type="Team Type"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertTeamType(data)}
            getSettings={() => _settingsStore.getTeamType()}
            settingsData={_settingsStore.teamType}
            maxLength={50}
            isEditable={false}
          />
        );
      case SETTING_ID.PROFILE_TOPIC:
        return (
          <UpsertSettings
            key="profileTopic"
            type="Profile Topic"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertProfileTopic(data)}
            getSettings={() => _settingsStore.getProfileTopic()}
            settingsData={_settingsStore.profileTopic}
          />
        );
      case SETTING_ID.PROFILE_LEVEL:
        return (
          <UpsertSettings
            key="profileLevel"
            type="Profile Level"
            hasSuperPermission={customerModuleSecurity.isSettingsEditable}
            upsertSettings={data => _settingsStore.upsertProfileLevel(data)}
            getSettings={() => _settingsStore.getProfileLevel()}
            settingsData={_settingsStore.profileLevel}
            maxLength={100}
            isNameUnique={true}
            sortColumn="name"
          />
        );
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Customer"
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
export { Settings as PureSettings };
