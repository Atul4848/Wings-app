import React, { ReactNode, useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { UpsertSettings } from '@wings/shared';
import { SETTING_ID, TimeZoneSettingsStore, updateTimezoneSidebarOptions } from '../Shared';
import { UAOffices, WorldAware } from './Components';
import { SelectOption } from '@wings-shared/core';
import { categoryList, settingList } from './Fields';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Settings: React.FC<Props> = ({ timeZoneSettingsStore, sidebarStore }) => {
  const [ activeCategory, setActiveCategory ] = useState<number>(1);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(1);
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Settings'), 'geographic');
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
    if (!_timeZoneSettingsStore) {
      return <React.Fragment />;
    }
    switch (activeSubCategory) {
      case SETTING_ID.WORLD_AWARE:
        return <WorldAware />;
      case SETTING_ID.SOURCE_TYPE:
        return (
          <UpsertSettings
            type="Source Type"
            key="sourceType"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertSourceType(data)}
            getSettings={() => _timeZoneSettingsStore.getSourceTypes()}
            settingsData={_timeZoneSettingsStore.sourceTypes}
          />
        );
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            type="Access Level"
            key="accessLevel"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertAccessLevel(data)}
            getSettings={() => _timeZoneSettingsStore.getAccessLevels()}
            settingsData={_timeZoneSettingsStore.accessLevels}
          />
        );
      case SETTING_ID.UA_OFFICE:
        return <UAOffices />;
      case SETTING_ID.WORLD_EVENT_CATEGORY:
        return (
          <UpsertSettings
            type="World Event Category"
            key="worldEventCategory"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertWorldEventCategory(data)}
            getSettings={() => _timeZoneSettingsStore.getWorldEventCategory()}
            settingsData={_timeZoneSettingsStore.worldEventCategories}
            isEditable={false}
          />
        );
      case SETTING_ID.SPECIAL_CONSIDERATION:
        return (
          <UpsertSettings
            type="Special Consideration"
            key="specialConsideration"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertWorldEventSpecialConsideration(data)}
            getSettings={() => _timeZoneSettingsStore.getWorldEventSpecialConsiderations()}
            settingsData={_timeZoneSettingsStore.worldEventSpecialConsiderations}
            isEditable={false}
          />
        );
      case SETTING_ID.SUPPLIER_TYPE:
        return (
          <UpsertSettings
            type="Supplier Type"
            key="supplierType"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertSupplierType(data)}
            getSettings={() => _timeZoneSettingsStore.getSupplierTypes()}
            settingsData={_timeZoneSettingsStore.supplierTypes}
            isEditable={false}
          />
        );
      case SETTING_ID.SERVICE_LEVEL:
        return (
          <UpsertSettings
            type="Service Level"
            key="serviceLevel"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertServiceLevel(data)}
            getSettings={() => _timeZoneSettingsStore.getServiceLevels()}
            settingsData={_timeZoneSettingsStore.serviceLevels}
            isEditable={false}
          />
        );
      default:
      case SETTING_ID.WORLD_EVENT_TYPE:
        return (
          <UpsertSettings
            type="World Event Type"
            key="worldEventType"
            hasSuperPermission={geographicModuleSecurity.isSettingsEditable}
            upsertSettings={data => _timeZoneSettingsStore.upsertWorldEventTypes(data)}
            getSettings={() => _timeZoneSettingsStore.getWorldEventTypes()}
            settingsData={_timeZoneSettingsStore.worldEventTypes}
            isNameUnique={false}
            isEditable={false}
          />
        );
    }
  };

  return (
    <SettingsLayout
      title="Geographic"
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

export default inject('timeZoneSettingsStore', 'sidebarStore')(observer(Settings));
