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

const HandlingFeeTypeSettings: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 355,
      maxWidth: 455,
      headerTooltip:'Name',
    },
    {
      headerName: 'Description',
      field: 'description',
      minWidth: 600,
      headerTooltip: 'Description',
    },
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTINGS_HANDLING_FEES}
      collectionName="Handling Fee"
      selectInputs={[]}
    />
  );
};
export default inject('settingsStore')(observer(HandlingFeeTypeSettings));
