import React, { FC, ReactNode, useEffect } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from '../Settings/Settings.style';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { runInAction } from 'mobx';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { GridOptions, ColDef, RowNode } from 'ag-grid-community';
import SettingsIcon from '@material-ui/icons/Settings';
import { IAPISyncSettings, SETTING_TYPE, SyncSettingsModel, SyncSettingsStore } from '../../../Shared';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import UpsertSetting from '../UpsertSetting/UpsertSetting';
import { Edit } from '@material-ui/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { UIStore, GRID_ACTIONS } from '@wings-shared/core';
import {
  AgGridViewRenderer,
  CustomAgGridReact,
  AgGridSwitch,
  useGridState,
  useAgGrid
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  syncSettingsStore?: SyncSettingsStore;
  settingType: SETTING_TYPE;
}

const Settings: FC<Props> = ({ ...props }: Props) => {

  const gridState = useGridState();
  const agGrid = useAgGrid<'', SyncSettingsModel>([], gridState);
  const classes: Record<string, string> = styles();
  const _syncSettingsStore = props.syncSettingsStore as SyncSettingsStore;
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _syncSettingsStore
      ?.getSyncSettings(props.settingType)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: SyncSettingsModel[]) => {
        gridState.setGridData(data);
        agGrid.reloadColumnState();
      });
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: '',
      field: 'action',
      cellRenderer: 'viewRenderer',
      filter: false,
      maxWidth: 100,
      minWidth: 100,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => resetViewRenderer(node.data),
      },
    },
    {
      headerName: 'Enable/Disable',
      field: 'isEnabled',
      cellRenderer: 'switchRenderer',
      cellRendererParams: {
        isReadOnly: false,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      sortable: true,
    },
    {
      headerName: 'Details',
      field: 'details',
      sortable: true,
    },
    {
      headerName: '',
      field: 'action',
      cellRenderer: 'viewRenderer',
      filter: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => editViewRenderer(node.data),
      },
    },
  ];

  const editViewRenderer = (rowData: SyncSettingsModel): ReactNode => {
    return (
      <IconButton onClick={() => openUpsertDialog(rowData)}>
        <Edit color="primary" />
      </IconButton>
    );
  }

  const resetViewRenderer = (rowData: SyncSettingsModel): ReactNode => {
    return (
      <PrimaryButton variant="contained" color="primary" onClick={() => resetSetting(rowData)}>
        Reset
      </PrimaryButton>
    );
  }

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onSwitchChangeHandler },
      columnDefs: columnDefs,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => { },
      },
    });
    return {
      ...baseOptions,
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      frameworkComponents: {
        viewRenderer: AgGridViewRenderer,
        switchRenderer: AgGridSwitch,
        ...baseOptions.frameworkComponents,
      },
    };
  }

  /* istanbul ignore next */
  const onSwitchChangeHandler = (rowIndex: number, isEnabled: boolean): void => {
    const settingFromGrid = agGrid._getTableItem(rowIndex);
    const setting = new SyncSettingsModel({ ...settingFromGrid, isEnabled });

    const request = SyncSettingsModel.serialize(setting);

    upsertSetting(request);
  }

  /* istanbul ignore next */
  const upsertSetting = (upsertSettingRequest: IAPISyncSettings): void => {
    UIStore.setPageLoader(true);
    _syncSettingsStore
      ?.upsertSyncSettings(upsertSettingRequest)
      .pipe(
        switchMap(() => _syncSettingsStore.getSyncSettings(props.settingType)),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        response => {
          runInAction(() => {
            gridState.setGridData(response);
          });
        },
        _error => (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const resetSetting = (syncSetting?: SyncSettingsModel): void => {
    UIStore.setPageLoader(true);
    _syncSettingsStore
      ?.resetSyncSettings(syncSetting?.key || '')
      .pipe(
        switchMap(() => _syncSettingsStore.getSyncSettings(props.settingType)),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        response => {
          runInAction(() => {
            gridState.setGridData(response);
          });
        },
        _error => (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  /* istanbul ignore next */
  const openUpsertDialog = (syncSettings?: SyncSettingsModel): void => {
    ModalStore.open(
      <UpsertSetting
        syncSettingsStore={_syncSettingsStore}
        syncSettings={syncSettings}
        settingType={props.settingType}
        onUpdate={(options: SyncSettingsModel) => upsertSetting(SyncSettingsModel.serialize(options))}
      />
    );
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <SettingsIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            {props?.settingType == SETTING_TYPE.SETTING ? 'Settings' : 'Recurring Jobs'}
          </Typography>
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
        </div>
      </div>
    </>
  );
}

export default inject('syncSettingsStore')(observer(Settings));
export { Settings as PureSettings };
