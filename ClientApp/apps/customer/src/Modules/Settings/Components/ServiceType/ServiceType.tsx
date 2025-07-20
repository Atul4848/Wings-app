import { inject, observer } from 'mobx-react';
import React, { FC } from 'react';
import { SettingsStore, useCustomerModuleSecurity } from '../../../Shared';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { UpsertSettings } from '@wings/shared';
import { regex } from '@wings-shared/core';

interface Props extends Partial<ICellRendererParams> {
  settingsStore?: SettingsStore;
}

const ServiceType: FC<Props> = observer(({ settingsStore }) => {
  const _settingsStore = settingsStore as SettingsStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|between:1,100|regex:${regex.alphabetsWithSpaces}`,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string|between:1,100',
      },
    },
  ];

  return (
    <UpsertSettings
      key="ServiceType"
      type="Service Type"
      hasSuperPermission={customerModuleSecurity.isSettingsEditable}
      columnDefs={columnDefs}
      upsertSettings={data => _settingsStore.upsertServiceType(data)}
      getSettings={() => _settingsStore.getServiceType()}
      settingsData={_settingsStore.serviceType}
    />
  );
});

export default inject('settingsStore')(ServiceType);
