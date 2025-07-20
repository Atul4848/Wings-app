import React, { FC, useEffect, useMemo } from 'react';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridSwitch,
  IActionMenuItem,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { styles } from './Settings.styles';
import { GridOptions, ColDef, GridReadyEvent, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { CacheControlStore, CacheSettingOptionsModel, SettingsModel } from '../../../Shared';
import { finalize } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import SettingOptionEditor from '../SettingOptionEditor/SettingOptionEditor';
import { UIStore, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';

interface Props {
  cacheControlStore?: CacheControlStore;
}

const Settings: FC<Props> = ({ cacheControlStore }: Props) => {

  const _cacheControlStore = cacheControlStore as CacheControlStore;
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<any, SettingsModel>([], gridState);
  const classes: Record<string, string> = styles();

  useEffect(() => {
    loadInitialData();
  }, []);

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _cacheControlStore
      ?.getCacheSettings()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: SettingsModel[]) => (gridState.setGridData(data)));
  }

  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isDisabled: !hasAnyPermission, action: GRID_ACTIONS.EDIT },
      { title: 'Reset to Default', isDisabled: !hasAnyPermission, action: GRID_ACTIONS.RESET },
    ];
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Enable/Disable',
      field: 'isEnabled',
      cellRenderer: 'switchRenderer',
      cellRendererParams: {
        isReadOnly: !hasAnyPermission,
      },
    },
    {
      headerName: 'Key',
      field: 'key',
    },
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'JobDetails',
      field: 'details',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => actionMenus(),
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: { onSwitchChangeHandler },
        columnDefs: columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => { },
        },
      }),
      frameworkComponents: {
        actionRenderer: AgGridActions,
        switchRenderer: AgGridSwitch,
      },
      onGridReady: (event: GridReadyEvent) => {
        event.api.setDatasource({ getRows: () => loadInitialData() });
        gridState.setGridApi(event.api);
        gridState.setColumnApi(event.columnApi);
      },
      pagination: false,
    };
  }

  /* istanbul ignore next */
  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const setting = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      ModalStore.open(
        <SettingOptionEditor
          setting={setting}
          cacheControlStore={_cacheControlStore}
          onUpdate={(options: CacheSettingOptionsModel[]) => updateSetting(rowIndex, options)}
        />
      );
    }
    if (setting && gridAction === GRID_ACTIONS.RESET) {
      resetCacheSettings(setting, rowIndex);
    }
  }

  /* istanbul ignore next */
  const updateSetting = (rowIndex: number, options: CacheSettingOptionsModel[]): void => {
    UIStore.setPageLoader(true);
    const setting = agGrid._getTableItem(rowIndex);
    setting.options = options;
    _cacheControlStore
      ?.updateCacheSetting(setting)
      .pipe(
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(() => agGrid._updateTableItem(rowIndex, setting));
  }

  /* istanbul ignore next */
  const onSwitchChangeHandler = (rowIndex: number, isActive: boolean): void => {
    const setting = agGrid._getTableItem(rowIndex);
    setting.isEnabled = isActive;
    UIStore.setPageLoader(true);
    _cacheControlStore
      ?.updateCacheSetting(setting)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(() => gridState.gridApi.onFilterChanged());
  }

  /* istanbul ignore next */
  const resetCacheSettings = (setting: SettingsModel, rowIndex: number): void => {
    UIStore.setPageLoader(true);
    _cacheControlStore
      ?.resetCacheSetting(setting.key)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((response: SettingsModel) => {
        agGrid._updateTableItem(rowIndex, response);
      });
  }

  return (
    <div className={classes.mainroot}>
      <div className={classes.mainContent}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
      </div>
    </div>
  );
};

export default inject('cacheControlStore')(observer(Settings));
export { Settings as PureSettings };
