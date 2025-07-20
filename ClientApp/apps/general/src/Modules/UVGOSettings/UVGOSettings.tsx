import React, { FC, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Theme, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
  agGridUtilities,
  AgGridActions,
  AgGridSwitch,
  AgGridCheckBox,
} from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { useStyles } from './UVGOSettings.style';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { GridOptions, ColDef, RowNode, ValueFormatterParams, GridReadyEvent } from 'ag-grid-community';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { UvgoSettingsStore, UvgoSettings, UVGO_SETTING } from '../Shared';
import {
  DATE_FORMAT,
  IClasses,
  UIStore,
  Utilities,
  GRID_ACTIONS,
  cellStyle,
  SearchStore,
  Loader,
} from '@wings-shared/core';
import { ConfirmDialog, CustomLinkButton, ImportDialog } from '@wings-shared/layout';
import { useNavigate } from 'react-router';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { AuthStore } from '@wings-shared/security';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  uvgoSettingsStore?: UvgoSettingsStore;
};

const UVGOSettings: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<UVGO_SETTING, UvgoSettings>([], gridState);
  const [ recurringTypeState, setRecurringTypeState ] = useState(false);
  const [ settingTypeState, setSettingTypeState ] = useState(false);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const navigate = useNavigate();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const progressLoader: Loader = new Loader(false);

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const rowData = () => {
    const users = JSON.parse(JSON.stringify(gridState.data));
    let filteredUsers = users;
    if (recurringTypeState) {
      filteredUsers = users.filter(a => a.settingType.value == 'Recurring').slice();
    }

    if (settingTypeState) {
      filteredUsers = users.filter(a => a.settingType.value == 'Setting').slice();
    }
    return recurringTypeState && settingTypeState ? users : filteredUsers;
  }

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.getUvgoSettings()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: UvgoSettings[]) => {
        gridState.setGridData(data);
      });
  }

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const columnDefs: ColDef[] = [
    {
      headerName: 'Enable/Disable',
      field: 'isEnabled',
      cellRenderer: 'switchRenderer',
      cellRendererParams: {
        isReadOnly: false,
      },
    },
    {
      headerName: 'Key',
      field: 'id',
    },
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'Assembly Name',
      field: 'assemblyName',
    },
    {
      headerName: 'Set Type',
      field: 'settingType',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.value || '';
      },
    },
    {
      headerName: 'Area',
      field: 'area',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.value || '';
      },
    },
    {
      headerName: 'Published',
      field: 'isPublished',
      filter: true,
      filterParams: { applyMiniFilterWhileTyping: true },
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Last Connected',
      field: 'lastConnectedOn',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Description',
      field: 'description',
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
        actionMenus: (node: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            isDisabled: !hasAnyPermission,
            to: node => `/general/uvgo-settings/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Delete',
            isDisabled: !hasAnyPermission,
            action: GRID_ACTIONS.DELETE,
            isHidden: Boolean(node.data.isPublished),
          },
          {
            title: 'Publish',
            isDisabled: !hasAnyPermission,
            action: GRID_ACTIONS.PUBLISH,
            isHidden: Boolean(node.data.isPublished),
          },
          {
            title: 'Export',
            isDisabled: !hasAnyPermission,
            action: GRID_ACTIONS.EXPORT,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: { onSwitchChangeHandler },
        columnDefs,
        isEditable: true,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { id, name, description } = node.data as UvgoSettings;
        return agGrid.isFilterPass(
          {
            [UVGO_SETTING.NAME]: name,
            [UVGO_SETTING.DESCRIPTION]: description,
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        switchRenderer: AgGridSwitch,
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  /* istanbul ignore next */
  const onSwitchChangeHandler = (rowIndex: number, isEnabled: boolean): void => {
    const settingFromGrid = agGrid._getTableItem(rowIndex);
    const setting = new UvgoSettings({ ...settingFromGrid, isEnabled });
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.upsertUvgoSettings(setting, false)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => agGrid._updateTableItem(rowIndex, setting),
        error: error => AlertStore.critical(error.message),
      });
  }

  const deleteUvgoSetting = (uvgoSetting: UvgoSettings): void => {
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.deleteUvgoSetting(uvgoSetting.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        }),
        filter((isDeleted: boolean) => isDeleted)
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ uvgoSetting ]);
          AlertStore.info('Setting deleted successfully');
          loadInitialData();
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const exportUsers = (rowIndex: number): void => {
    const settingFromGrid = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.exportUserSetting(settingFromGrid.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${settingFromGrid.id}.uvgosettings.json`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      });
  }

  const isPublished = (rowIndex: number, isPublished: boolean): void => {
    const settingFromGrid = agGrid._getTableItem(rowIndex);
    const setting = new UvgoSettings({ ...settingFromGrid, isPublished });
    UIStore.setPageLoader(true);
    props.uvgoSettingsStore
      ?.upsertUvgoSettings(setting, false)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: () => agGrid._updateTableItem(rowIndex, setting),
        error: error => AlertStore.critical(error.message),
      });
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    const uvgoSetting = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Delete uvGO Setting"
          message="Are you sure you want to delete this uvGO setting?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteUvgoSetting(uvgoSetting)}
        />
      );
    }
    if (gridAction === GRID_ACTIONS.EXPORT) {
      ModalStore.open(
        <ConfirmDialog
          title="Export uvGO Setting"
          message="Are you sure you want to Export this uvGO setting?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => exportUsers(rowIndex)}
        />
      );
    }
    if (gridAction === GRID_ACTIONS.PUBLISH) {
      ModalStore.open(
        <ConfirmDialog
          title="Publish uvGO Setting"
          message="Are you sure you want to publish this uvGO setting?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => isPublished(rowIndex, true)}
        />
      );
    }
  }

  const setRecurringType = (value: boolean) => {
    setRecurringTypeState(value);
  }

  const setSettingType = (value: boolean) => {
    setSettingTypeState(value);
  }

  const uploadImportData = (file: File): void => {
    const { uvgoSettingsStore } = props;
    UIStore.setPageLoader(true);
    uvgoSettingsStore
      ?.uploadImportData(file)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => {
          if (response) {
            AlertStore.info('Import uvGO Setting Successfully');
            loadInitialData();
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  const importUser = (): void => {
    ModalStore.open(
      <ImportDialog
        title="Import uvGO Setting"
        btnText="Import"
        fileType="json"
        isLoading={() => progressLoader.isLoading}
        onUploadFile={file => uploadImportData(file)}
      />
    );
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <SettingsApplicationsIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            uvGO Settings
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[ agGridUtilities.createSelectOption(UVGO_SETTING, UVGO_SETTING.NAME) ]}
            onFilterChange={() => gridState.gridApi.onFilterChanged()}
            disableControls={gridState.isRowEditing}
            onExpandCollapse={agGrid.autoSizeColumns}
          />
        </div>
        <div>
          <FormControlLabel
            value={recurringTypeState}
            control={<Checkbox onChange={e => setRecurringType(e.target.checked)} />}
            label="Recurring Only"
          />
        </div>
        <div>
          <FormControlLabel
            value={settingTypeState}
            control={<Checkbox onChange={e => setSettingType(e.target.checked)} />}
            label="Setting Only"
          />
        </div>
        <PrimaryButton
          variant="contained"
          color="primary"
          disabled={gridState.isProcessing}
          onClick={() => importUser()}
          startIcon={<CloudUploadIcon />}
        >
          Import
        </PrimaryButton>
        <div>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={VIEW_MODE.NEW.toLowerCase()}
            title="Add uvGO Setting"
            disabled={!hasAnyPermission}
          />
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact rowData={rowData()} gridOptions={gridOptions()} />
        </div>
      </div>
    </>
  );
}

export default inject('uvgoSettingsStore')(observer(UVGOSettings));
