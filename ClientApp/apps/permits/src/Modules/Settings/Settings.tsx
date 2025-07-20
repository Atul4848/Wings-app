import React, { ReactNode, useEffect, useState } from 'react';
import { UpsertSettings } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { regex, SelectOption } from '@wings-shared/core';
import { categoryList, settingList } from './Fields';
import {
  PermitSettingsStore,
  SETTING_CATEGORIES,
  SETTING_ID,
  sidebarOptions,
  usePermitModuleSecurity,
} from '../Shared';
import { Document, FARType } from './Components';
import { SettingsLayout, SidebarStore } from '@wings-shared/layout';

interface Props {
  permitSettingsStore?: PermitSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Settings: React.FC<Props> = ({ permitSettingsStore, sidebarStore }) => {
  const [ activeCategory, setActiveCategory ] = useState<number>(SETTING_CATEGORIES.GENERAL);
  const [ activeSubCategory, setActiveSubCategory ] = useState<number>(SETTING_ID.ACCESS_LEVEL);
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;
  const permitModuleSecurity = usePermitModuleSecurity();
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(sidebarOptions(false), 'permits');
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
            type="Source Type"
            key="sourceType"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertSourceType(data)}
            getSettings={() => _permitSettingsStore.getSourceTypes()}
            settingsData={_permitSettingsStore.sourceTypes}
          />
        );
      case SETTING_ID.RULE_CONDITIONAL_OPERATOR:
        return (
          <UpsertSettings
            type="Rule Conditional Operator"
            key="ruleConditionalOperator"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            getSettings={() => _permitSettingsStore.getRuleConditionalOperators()}
            upsertSettings={data => _permitSettingsStore.upsertRuleConditionalOperators(data)}
            settingsData={_permitSettingsStore.ruleConditionalOperators}
            isEditable={false}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.RULE_ENTITY:
        return (
          <UpsertSettings
            type="Rule Entity"
            key="ruleEntity"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            getSettings={() => _permitSettingsStore.getRuleEntities()}
            upsertSettings={data => _permitSettingsStore.upsertRuleEntities(data)}
            settingsData={_permitSettingsStore.ruleEntities}
            isEditable={false}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.BLANKET_VALIDITY:
        return (
          <UpsertSettings
            type="Blanket Validity"
            key="blanketValidity"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertBlanketValidityType(data)}
            getSettings={() => _permitSettingsStore.getBlanketValidityTypes()}
            settingsData={_permitSettingsStore.blanketValidityTypes}
            regExp={regex.all}
          />
        );
      case SETTING_ID.DOCUMENT:
        return <Document />;
      case SETTING_ID.DIPLOMATIC_CHANNEL_REQUIRED:
        return (
          <UpsertSettings
            type="Diplomatic Channel Required"
            key="diplomaticChannelRequired"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitDiplomaticType(data)}
            getSettings={() => _permitSettingsStore.getPermitDiplomaticTypes()}
            settingsData={_permitSettingsStore.permitDiplomaticTypes}
            regExp={regex.all}
          />
        );
      case SETTING_ID.ELEMENTS:
        return (
          <UpsertSettings
            type="Elements"
            key="elements"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertElements(data)}
            getSettings={() => _permitSettingsStore.getElements()}
            settingsData={_permitSettingsStore.elements}
            regExp={regex.all}
          />
        );
      case SETTING_ID.FAR_TYPE:
        return <FARType />;
      case SETTING_ID.FLIGHT_OPERATIONAL_CATEGORY:
        return (
          <UpsertSettings
            type="Flight Operational Category"
            key="flightOperationalCategory"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertFlightOperationalCategory(data)}
            getSettings={() => _permitSettingsStore.getFlightOperationalCategories()}
            settingsData={_permitSettingsStore.flightOperationalCategories}
            ignoreNumber={true}
            isEditable={false}
          />
        );
      case SETTING_ID.LEAD_TIME_TYPE:
        return (
          <UpsertSettings
            type="Lead Time Type"
            key="leadTimeType"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertLeadTimeType(data)}
            getSettings={() => _permitSettingsStore.getLeadTimeTypes()}
            settingsData={_permitSettingsStore.leadTimeTypes}
          />
        );
      case SETTING_ID.PERMIT_TYPE:
        return (
          <UpsertSettings
            type="Permit Type"
            key="permitType"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitType(data)}
            getSettings={() => _permitSettingsStore.getPermitTypes()}
            settingsData={_permitSettingsStore.permitTypes}
            isEditable={false}
          />
        );
      case SETTING_ID.PERMIT_APPLIED_TO:
        return (
          <UpsertSettings
            type="Permit Applied To"
            key="permitAppliedTo"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitAppliedTo(data)}
            getSettings={() => _permitSettingsStore.getPermitAppliedTo()}
            settingsData={_permitSettingsStore.permitAppliedTo}
            isEditable={false}
          />
        );
      case SETTING_ID.PERMIT_NUMBER_EXCEPTIONS:
        return (
          <UpsertSettings
            type="Permit Number Exceptions"
            key="permitNumberExceptions"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitNumberException(data)}
            getSettings={() => _permitSettingsStore.getPermitNumberExceptions()}
            settingsData={_permitSettingsStore.permitNumberExceptions}
            regExp={regex.all}
          />
        );
      case SETTING_ID.PERMIT_PREREQUISITES:
        return (
          <UpsertSettings
            type="Permit Prerequisites"
            key="permitPrerequisites"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertpermitPrerequisiteType(data)}
            getSettings={() => _permitSettingsStore.getpermitPrerequisiteTypes()}
            settingsData={_permitSettingsStore.permitPrerequisiteTypes}
            regExp={regex.all}
          />
        );
      case SETTING_ID.PERMIT_REQUIREMENT_TYPE:
        return (
          <UpsertSettings
            type="Permit Requirement Type"
            key="permitRequirementType"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitRequirementType(data)}
            getSettings={() => _permitSettingsStore.getPermitRequirementTypes()}
            settingsData={_permitSettingsStore.permitRequirementTypes}
            isEditable={false}
            regExp={regex.all}
          />
        );
      case SETTING_ID.PURPOSE_OF_FLIGHT:
        return (
          <UpsertSettings
            type="Purpose of Flight"
            key="purposeOfFlight"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertFlightPurpose(data)}
            getSettings={() => _permitSettingsStore.getFlightPurposes()}
            settingsData={_permitSettingsStore.flightPurposes}
            ignoreNumber={true}
            regExp={regex.all}
            isEditable={false}
          />
        );
      case SETTING_ID.TIME_LEVEL_UOM:
        return (
          <UpsertSettings
            type="Time Level UOM"
            key="timeLevelUOM"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertTimeLevelUOM(data)}
            getSettings={() => _permitSettingsStore.getTimeLevelsUOM()}
            settingsData={_permitSettingsStore.timeLevelsUOM}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.MISSION_ELEMENT:
        return (
          <UpsertSettings
            type="Mission Element"
            key="missionElement"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertMissionElement(data)}
            getSettings={() => _permitSettingsStore.getMissionElement()}
            settingsData={_permitSettingsStore.missionElements}
            isEditable={false}
            ignoreNumber={true}
          />
        );
      case SETTING_ID.DATA_ELEMENT:
        return (
          <UpsertSettings
            type="Data Element"
            key="dataElement"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertDataElement(data)}
            getSettings={() => _permitSettingsStore.getDataElement()}
            settingsData={_permitSettingsStore.dataElements}
            isEditable={false}
            ignoreNumber={true}
          />
        );

      case SETTING_ID.CROSSING_TYPE:
        return (
          <UpsertSettings
            type="Crossing Type"
            key="crossingType"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertCrossingType(data)}
            getSettings={() => _permitSettingsStore.getCrossingType()}
            settingsData={_permitSettingsStore.crossingTypes}
            isEditable={false}
            ignoreNumber={true}
            hideAddNewButton={true}
          />
        );
      case SETTING_ID.REJECTION_REASON:
        return (
          <UpsertSettings
            type="Rejection Reason"
            key="rejectionReason"
            upsertSettings={data => _permitSettingsStore.upsertRejectionReason(data)}
            getSettings={() => _permitSettingsStore.loadRejectionReason()}
            settingsData={_permitSettingsStore.rejectionReason}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
          />
        );
      case SETTING_ID.PERMIT_CLASSIFICATION:
        return (
          <UpsertSettings
            type="Permit Classification"
            key="permitClassification"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPermitClassification(data)}
            getSettings={() => _permitSettingsStore.getPermitClassifications()}
            settingsData={_permitSettingsStore.permitClassifications}
            isEditable={false}
          />
        );
      case SETTING_ID.PRESET_VALIDITY:
        return (
          <UpsertSettings
            type="Preset Validity"
            key="presetValidity"
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertPresetValidity(data)}
            getSettings={() => _permitSettingsStore.getPresetValidities()}
            settingsData={_permitSettingsStore.presetValidities}
            isEditable={false}
            maxLength={50}
          />
        );

      default:
      case SETTING_ID.ACCESS_LEVEL:
        return (
          <UpsertSettings
            type="Access Level"
            key="accessLevel"
            isEditable={false}
            hasSuperPermission={permitModuleSecurity.isSettingsEditable}
            upsertSettings={data => _permitSettingsStore.upsertAccessLevel(data)}
            getSettings={() => _permitSettingsStore.getAccessLevels()}
            settingsData={_permitSettingsStore.accessLevels}
          />
        );
    }
  };

  return (
    <SettingsLayout
      title="Permit"
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

export default inject('permitSettingsStore', 'sidebarStore')(observer(Settings));
export { Settings as PureSettings };
