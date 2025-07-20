import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { 
  SETTING_ID
} from '../../../Shared';
import { SettingsStore } from '../../../../Stores';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../../Shared/SettingCoreShared/SettingCore';

interface Props {
  settingsStore?:SettingsStore
}

const AccessLevelSettings: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 255,
      headerTooltip:'Name',
    },
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTING_ACCESS_LEVEL}
      collectionName="Access Level"
    />
  );
};
export default inject('settingsStore')(observer(AccessLevelSettings));
