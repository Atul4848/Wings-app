import React, { FC, useEffect, useRef } from 'react';
import { ColDef, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { Utilities, UIStore, SettingsTypeModel, AccessLevelModel, SourceTypeModel } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { FARTypeModel, SettingsType } from '@wings/shared';
import { PermitSettingsStore, usePermitModuleSecurity } from '../../../Shared';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import { AlertStore } from '@uvgo-shared/alert';
import { forkJoin } from 'rxjs';
import PurposeOfFlightsEditor from './PurposeOfFlightsEditor';

interface Props {
  permitSettingsStore?: PermitSettingsStore;
}

const FARType: FC<Props> = ({ permitSettingsStore }) => {
  const settingsTypesRef = useRef<typeof PurposeOfFlightsEditor>();
  const unsubscribe = useUnsubscribe();
  const _settingsStore = permitSettingsStore as PermitSettingsStore;
  const permitModuleSecurity = usePermitModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    loadFARTypes();
  }, []);

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
      _settingsStore.getFlightOperationalCategories(),
      _settingsStore.getFlightPurposes(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  /* istanbul ignore next */
  const loadFARTypes = (): void => {
    _settingsStore
      .getFARTypes()
      .pipe(tap((response: FARTypeModel[]) => settingsTypesRef.current?.setData(response)))
      .subscribe({
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const upsertFARType = (rowIndex: number, model: FARTypeModel): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertFARType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        tap((response: FARTypeModel) => settingsTypesRef.current?.updateTableItem(rowIndex, response)),
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
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
        isUnique: (value: string) => {
          return !_settingsStore.farTypes.some(({ name }) => Utilities.isEqual(name, value?.trim()));
        },
      },
    },
    {
      headerName: 'CAPPS Code',
      field: 'cappsCode',
      maxWidth: 130,
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,4',
        getDisableState: (node: RowNode) => Boolean(node.data?.id),
        isUnique: (value: string) => {
          return !_settingsStore.farTypes.some(({ cappsCode }) => Utilities.isEqual(cappsCode, value?.trim()));
        },
      },
    },
    {
      headerName: 'Flight Operational Category',
      field: 'flightOperationalCategory',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Flight Operational Category',
        getAutoCompleteOptions: () => _settingsStore.flightOperationalCategories,
      },
    },
    {
      headerName: 'Purpose Of Flight',
      field: 'purposeOfFlights',
      filter: false,
      cellRenderer: 'purposeOfFlightEditor',
      cellEditor: 'purposeOfFlightEditor',
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRowEditing: true,
        getAutoCompleteOptions: () => _settingsStore.flightPurposes,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      maxWidth: 130,
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      maxWidth: 130,
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
      },
    },
  ];

  return (
    <SettingsType
      ref={settingsTypesRef}
      rowData={_settingsStore.farTypes}
      onGetNewModel={() => new FARTypeModel({ id: 0 })}
      onUpsert={(rowIndex: number, data: FARTypeModel) => upsertFARType(rowIndex, data)}
      type="FAR Type"
      columnDefs={columnDefs}
      frameworkComponents={{ purposeOfFlightEditor: PurposeOfFlightsEditor }}
      onEditingStarted={() => loadSettingsData()}
      hasSuperPermission={permitModuleSecurity.isSettingsEditable}
    />
  );
};

export default inject('permitSettingsStore')(observer(FARType));
