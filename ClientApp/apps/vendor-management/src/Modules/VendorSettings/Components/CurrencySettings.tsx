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

const CurrencySettings: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 295,
      headerTooltip: 'Name',
    }
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTINGS_CURRENCY}
      collectionName="Currency"
      isEditable={false}
      selectInputs={[]}
    />
  );
};
export default inject('settingsStore')(observer(CurrencySettings));