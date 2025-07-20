import React, { FC, useEffect, createRef } from 'react';
import { ColDef } from 'ag-grid-community';
import { CAPPSTerritoryTypeModel, SettingsType } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { SettingsStore, useCountryModuleSecurity } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { UIStore } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
}

const CAPPSTerritoryType: FC<Props> = ({ settingsStore }) => {
  const settingsTypesRef: React.RefObject<SettingsType> = createRef<SettingsType>();
  const _settingsStore = settingsStore as SettingsStore;
  const unsubscribe = useUnsubscribe();
  const countryModuleSecurity = useCountryModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getCAPPSTerritoryType()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        tap((response: CAPPSTerritoryTypeModel[]) => settingsTypesRef.current?.setData(response)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  /* istanbul ignore next */
  const upsertCAPPSTerritoryType = (rowIndex: number, model: CAPPSTerritoryTypeModel) => {
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertCAPPSTerritoryType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        tap((response: CAPPSTerritoryTypeModel) => settingsTypesRef.current?.updateTableItem(rowIndex, response)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,5',
      },
    },
  ];

  return (
    <SettingsType
      ref={settingsTypesRef}
      rowData={_settingsStore.cappsTerritoryTypes}
      onGetNewModel={() => new CAPPSTerritoryTypeModel({ id: 0 })}
      onUpsert={(rowIndex: number, data: CAPPSTerritoryTypeModel) => upsertCAPPSTerritoryType(rowIndex, data)}
      type="CAPPS Territory Type"
      columnDefs={columnDefs}
      hasSuperPermission={countryModuleSecurity.isSettingsEditable}
    />
  );
};

export default inject('settingsStore')(observer(CAPPSTerritoryType));
