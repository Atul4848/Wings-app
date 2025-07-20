import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { 
  SETTING_ID
} from '../../Shared';
import { SettingsStore } from '../../../Stores';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../Shared/SettingCoreShared/SettingCore';

interface Props {
  settingsStore?:SettingsStore
}

const ServiceCategorySettings: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Service category',
      field: 'name',
      editable: false,
      headerTooltip: 'Service category',
    },
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTINGS_SERVICE_CATEGORY}
      collectionName="Service Category"
      selectInputs={[]}
    />
  );
};
export default inject('settingsStore')(observer(ServiceCategorySettings));