import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams, ColGroupDef } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, GRID_ACTIONS, SearchStore, ViewPermission, Utilities, SettingsTypeModel } from '@wings-shared/core';
import {
  CustomAgGridReact,
  useAgGrid,
  useGridState,
  agGridUtilities,
  IActionMenuItem,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  ETP_SCENARIO_FILTERS,
  EtpScenarioModel,
  EtpScenarioStore,
  EtpSettingsStore,
  ImportFileDataV2,
  SettingsStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { VIEW_MODE } from '@wings/shared';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import { EtpScenarioDetailDialog } from './Components';

interface Props {
  etpScenarioStore?: EtpScenarioStore;
  settingsStore?: SettingsStore;
  etpSettingsStore?: EtpSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const EtpScenario: FC<Props> = ({ etpScenarioStore, settingsStore, etpSettingsStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<ETP_SCENARIO_FILTERS, EtpScenarioModel>([], gridState);
  const _etpScenarioStore = etpScenarioStore as EtpScenarioStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _etpSettingsStore = etpSettingsStore as EtpSettingsStore;
  const _sidebarStore = sidebarStore as typeof sidebarStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateAircraftSidebarOptions('ETP Scenario'), 'aircraft');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _etpScenarioStore
      .getEtpScenarios()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(EtpScenarios => {
        gridState.setGridData(EtpScenarios);
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        showEtpScenarioDialog(VIEW_MODE.EDIT, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        showEtpScenarioDialog(VIEW_MODE.DETAILS, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  };

  /* istanbul ignore next */
  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isHidden: !aircraftModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
      { title: 'Details', isHidden: false, action: GRID_ACTIONS.DETAILS },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'ETP Scenario Number',
      field: 'etpScenarioNumber',
      comparator: (current: number, next: number) => current - next,
      filter: true,
    },
    {
      headerName: 'NFP Scenario Number',
      field: 'nfpScenarioNumber',
      comparator: (current: number, next: number) => current - next,
      filter: true,
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: true,
    },
    {
      headerName: 'Comments',
      field: 'comments',
      filter: true,
    },
    {
      headerName: 'ETP Scenario Type',
      field: 'etpScenarioType',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.etpScenarioType.name,
    },
    {
      headerName: 'ETP Scenario Engine',
      field: 'etpScenarioEngine',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.etpScenarioEngine.name,
    },
    {
      headerName: 'Weight UOM',
      field: 'weightUom',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.weightUom.name,
    },
    {
      headerName: 'ETP Time Limit Type',
      field: 'etpTimeLimitType',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.etpTimeLimitType.name,
    },
    ...agGrid.generalFields(_etpSettingsStore),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => actionMenus(),
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            gridActions(action, rowIndex);
          },
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'ETP Scenario',
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { etpScenarioNumber, id, comments, description } = node.data as EtpScenarioModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [ETP_SCENARIO_FILTERS.SCENARIO_NUMBER]: etpScenarioNumber.toString(),
              [ETP_SCENARIO_FILTERS.COMMENT]: comments,
              [ETP_SCENARIO_FILTERS.DESCRIPTION]: description,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const showEtpScenarioDialog = (viewMode: VIEW_MODE, rowIndex: number, etpScenarioModel: EtpScenarioModel): void => {
    ModalStore.open(
      <EtpScenarioDetailDialog
        etpScenarioId={etpScenarioModel.id}
        viewMode={viewMode}
        settingsStore={_settingsStore}
        etpSettingsStore={_etpSettingsStore}
        etpScenarioStore={_etpScenarioStore}
        onModelUpdate={updatedModel => agGrid._updateTableItem(rowIndex, updatedModel)}
      />
    );
  };

  const onRequestImportEtpScenario = (): void => {
    ModalStore.open(
      <ImportFileDataV2
        onImportFileData={file => _etpScenarioStore.uploadEtpScenarioData(file)}
        onImportDone={() => loadInitialData()}
        title="Import ETP Scenarios"
        successMessage="All ETP Scenarios Imported successfully!"
      />
    );
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to="new"
            title="Add ETP Scenario"
            disabled={gridState.isRowEditing || UIStore.pageLoading}
          />
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => onRequestImportEtpScenario()}
            disabled={gridState.isRowEditing || UIStore.pageLoading}
          >
            Import ETP Scenario
          </PrimaryButton>
        </>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(ETP_SCENARIO_FILTERS, ETP_SCENARIO_FILTERS.SCENARIO_NUMBER) ]}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('etpScenarioStore', 'settingsStore', 'etpSettingsStore', 'sidebarStore')(observer(EtpScenario));
