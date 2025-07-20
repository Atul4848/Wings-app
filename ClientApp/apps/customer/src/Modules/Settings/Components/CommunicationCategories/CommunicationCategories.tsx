import { inject, observer } from 'mobx-react';
import React, { FC } from 'react';
import { SettingsStore, useCustomerModuleSecurity } from '../../../Shared';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { UpsertSettings } from '@wings/shared';
import { regex } from '@wings-shared/core';

interface Props extends Partial<ICellRendererParams> {
  settingsStore?: SettingsStore;
}

const CommunicationCategories: FC<Props> = observer(({ settingsStore }) => {
  const _settingsStore = settingsStore as SettingsStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|between:1,50|regex:${regex.alphabetWithHyphen}`,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string|between:1,200',
      },
    },
  ];

  return (
    <UpsertSettings
      key="CommunicationCategories"
      type="Communication Categories"
      hasSuperPermission={customerModuleSecurity.isSettingsEditable}
      columnDefs={columnDefs}
      upsertSettings={data => _settingsStore.upsertCommunicationCategories(data)}
      getSettings={() => _settingsStore.getCommunicationCategories()}
      settingsData={_settingsStore.communicationCategories}
    />
  );
});

export default inject('settingsStore')(CommunicationCategories);
