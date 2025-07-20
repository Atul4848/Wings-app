import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { SETTING_ID } from '../../../Shared';
import { cellStyle } from '@wings-shared/core';
import { SettingsStore } from '../../../../Stores';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../../Shared/SettingCoreShared/SettingCore';

interface Props {
  settingsStore?: SettingsStore;
}

const InternationalDepartureProcedures: FC<Props> = ({ settingsStore }) => {
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
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];


  return (
    <SettingCore
      columnDefs={columnDefs}
      settingsStore={settingsStore}
      settingId={SETTING_ID.SETTING_INTERNATIONAL_DEPARTURE_PROCEDURES}
      rightContentActionText="Add International Departure Procedures"
      rightContentAction={false}
      isAuditColumnEnabled={false}
      isActionEnabled={false}
      isEditable={false}
      selectInputs={[]}
    />
  );
};
export default inject('settingsStore')(observer(InternationalDepartureProcedures));
