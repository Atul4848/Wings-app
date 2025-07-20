import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { 
  SETTING_ID,
} from '../../../Shared';
import { SettingsStore } from '../../../../Stores';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../../Shared/SettingCoreShared/SettingCore';

interface Props {
  settingsStore?:SettingsStore
}

const HoursTypeSettings: FC<Props> = ({ settingsStore }) => {
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      headerTooltip:'Name',
      cellEditorParams: {
        placeHolder: 'name',
        ignoreNumber: true,
        rules: 'required|string|between:1,256',
      },
    },
  ];

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTINGS_HOURS_TYPE}
      collectionName="Hours Type"
    />
  );
};
export default inject('settingsStore')(observer(HoursTypeSettings));
