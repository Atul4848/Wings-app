import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { 
  StatusBaseModel,
  SETTING_ID
} from '../../../Shared';
import {
  UIStore, cellStyle,
} from '@wings-shared/core';
import { BaseStore, SettingsStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import SettingCore from '../../../Shared/SettingCoreShared/SettingCore';
import { apiUrls } from '../../../../Stores/API.url';
import { SettingNamesMapper } from '../../../../Stores/SettingsMapper'

interface Props {
  settingsStore?:SettingsStore
}

const ContactMethodSettings: FC<Props> = ({ settingsStore }) => {
  const unsubscribe = useUnsubscribe();
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
      headerName: 'Description',
      field: 'description',
      headerTooltip:'Description',
      cellEditorParams: {
        placeHolder: 'description',
        ignoreNumber: true,
        rules: 'string|between:1,512',
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
      cellStyle: { ...cellStyle() },
    },
  ];

  const upsertContactMethod = (rowIndex: number, agGrid:any): void =>{
    const model = agGrid._getTableItem(rowIndex)
    const request = new StatusBaseModel({ ...model });
    UIStore.setPageLoader(true);
    settingsStore
      ?.upsertSetting(request, apiUrls.vendorContactMethod, SettingNamesMapper[SETTING_ID.SETTING_CONTACT_METHOD])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: StatusBaseModel) => {
          agGrid._updateTableItem(
            rowIndex,
            response
          );
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, request.id);
        },
      });
  }

  return (
    <SettingCore 
      columnDefs={columnDefs} 
      settingsStore={settingsStore}
      showCollapseExpand={false}
      settingId={SETTING_ID.SETTING_CONTACT_METHOD}
      collectionName="Contact Method"
      rightContentActionText="Add Contact Method"
      rightContentAction={false}
      isAuditColumnEnabled={true}
      isActionEnabled={false}
      isEditable={false}
    />
  );
};
export default inject('settingsStore')(observer(ContactMethodSettings));
