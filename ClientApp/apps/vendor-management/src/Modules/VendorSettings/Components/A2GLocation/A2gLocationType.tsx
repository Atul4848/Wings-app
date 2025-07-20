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

const A2gLocationtype: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      headerTooltip:'Name',
    }
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTING_A2G_LOCATION_TYPE}
      collectionName="A2G Location Type"
      selectInputs={[]}
    />
  );
};
export default inject('settingsStore')(observer(A2gLocationtype));