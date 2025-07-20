import React, { FC } from 'react';
import { ColDef, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { RestrictionSourceModel, SettingsStore, useRestrictionModuleSecurity } from '../../../Shared';
import { UpsertSettings } from '@wings/shared';

interface Props {
  settingsStore?: SettingsStore;
}

const RestrictionSource: FC<Props> = ({ settingsStore }: Props) => {
  const _settingsStore = settingsStore as SettingsStore;
  const restrictionModuleSecurity = useRestrictionModuleSecurity()
  
  /* istanbul ignore next */
  const getEditableState = ({ data }: RowNode) => !Boolean(data.id);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
      editable: ({ node }) => getEditableState(node),
    },
    {
      headerName: 'Summary Description',
      field: 'summaryDescription',
      cellEditorParams: {
        isRequired: false,
        rules: 'string|between:0,1000',
      },
    },
  ];

  return (
    <UpsertSettings
      key="restrictionSource"
      type="Restriction Source"
      columnDefs={columnDefs}
      upsertSettings={(data: RestrictionSourceModel) => _settingsStore.upsertRestrictionSource(data)}
      getSettings={() => _settingsStore.getRestrictionSources()}
      settingsData={_settingsStore.restrictionSources}
      hasSuperPermission={restrictionModuleSecurity.isSettingsEditable}
    />
  );
};

export default inject('settingsStore')(observer(RestrictionSource));
