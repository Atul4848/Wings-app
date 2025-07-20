import React, { FC } from 'react';
import { ColDef } from 'ag-grid-community';
import { 
  StatusBaseModel,
  SETTING_ID,
  VmsModuleSecurity
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
import { SettingNamesMapper } from '../../../../Stores/SettingsMapper';

interface Props {
  settingsStore?:SettingsStore
}

const UsageTypeSettings: FC<Props> = ({ settingsStore }) => {
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

  const upsertUsageType = (rowIndex: number, agGrid:any, gridState:any): void =>{
    const model = agGrid._getTableItem(rowIndex)
    const request = new StatusBaseModel({ ...model });
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true)
    settingsStore
      ?.upsertSetting(request, apiUrls.vendorContactUsageType, SettingNamesMapper[SETTING_ID.SETTING_USAGES_TYPE])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false)
          gridState.setIsProcessing(false)
        })
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
      settingId={SETTING_ID.SETTING_USAGES_TYPE}
      collectionName="Usage Type"
      rightContentActionText="Add Usage Type"
      rightContentAction={VmsModuleSecurity.isEditable}
      isAuditColumnEnabled={true}
      isActionEnabled={true}
      isEditable={VmsModuleSecurity.isEditable}
      onSave={(rowIndex,agGrid,gridState)=>upsertUsageType(rowIndex,agGrid,gridState)} />
  );
};
export default inject('settingsStore')(observer(UsageTypeSettings));
