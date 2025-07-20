import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridState,
  IActionMenuItem,
} from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  DATE_FORMAT,
  ViewPermission,
  GRID_ACTIONS,
  UIStore,
  Utilities,
  GridPagination,
  IAPIGridRequest,
  SettingsTypeModel,
} from '@wings-shared/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import {
  SettingsStore,
  CountryStore,
  STATE_FILTERS,
  updateCountrySidebarOptions,
  updatedBackNavigation,
  COUNTRY_AUDIT_MODULES,
  useCountryModuleSecurity,
} from '../Shared';
import { useParams } from 'react-router-dom';
import { stateGridFilters } from './fields';
import { AuditHistory, CountryModel, StateModel, VIEW_MODE, baseApiPath } from '@wings/shared';
import { Observable } from 'rxjs';
import UpsertState from './UpsertState/UpsertState';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const State: FC<Props> = ({ countryStore, settingsStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const countryModuleSecurity = useCountryModuleSecurity();
  const agGrid = useAgGrid<STATE_FILTERS, StateModel>(stateGridFilters, gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _countryStore = countryStore as CountryStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateCountrySidebarOptions('States'), 'countries');
    loadStates();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadStates());
  }, []);

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest | null => {
    if (params?.countryId) {
      return {
        filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: params.countryId }]),
      };
    }
    return null;
  };

  /* istanbul ignore next */
  const loadStates = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: 30,
      ...pageRequest,
      ...getFilterCollection(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _countryStore
      .getStates(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(states => {
        gridState.setGridData(states.results);
        gridState.setPagination(new GridPagination({ ...states }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  const countryHeader = (): string => {
    if (!params.countryId) return 'Country Code';
    return `Country Code [${params.countryId}]`;
  };

  /* istanbul ignore next */
  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
      { title: 'Details', action: GRID_ACTIONS.DETAILS },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
      {
        title: 'View Cities',
        action: GRID_ACTIONS.VIEW,
        to: node => `${node?.data.id}/cities`,
      },
      {
        title: 'View Islands',
        action: GRID_ACTIONS.VIEW,
        to: node => `${node?.data.id}/islands`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: countryHeader(),
      field: 'country',
      minWidth: 150,
      cellEditor: 'customAutoComplete',
      tooltipField: 'country.officialName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('country', 1),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.isO2Code,
    },
    {
      headerName: 'State Code',
      field: 'code',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('code', 1),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'ISO Code',
      field: 'isoCode',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('isoCode', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'State Type',
      field: 'stateType',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('stateType', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
    },
    {
      headerName: 'Common Name',
      field: 'commonName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('commonName', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Official Name',
      field: 'officialName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('officialName', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'CAPPS Code',
      field: 'cappsCode',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cappsCode', 1),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'CAPPS Name',
      field: 'cappsName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cappsName', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Sync To CAPPS',
      field: 'syncToCAPPS',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('accessLevel', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customDateEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customDateEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceType', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({ headerName: 'Action' }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        actionMenus: () => actionMenus(),
      },
    });
    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      isExternalFilterPresent: () => false,
      pagination: false,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadStates();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadStates();
      },
    };
  };

  const openUpsertStateDialog = (viewMode: VIEW_MODE, rowIndex: number, stateModel: StateModel): void => {
    ModalStore.open(
      <UpsertState
        countryId={Number(params?.countryId)}
        countryStore={_countryStore}
        settingsStore={_settingsStore}
        viewMode={viewMode}
        stateModel={stateModel}
        onUpsertState={(stateModel: StateModel) => upsertState(rowIndex, stateModel)}
      />
    );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        openUpsertStateDialog(VIEW_MODE.EDIT, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        openUpsertStateDialog(VIEW_MODE.DETAILS, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.AUDIT:
        const model: StateModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.officialName || model.commonName}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.STATE}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
    }
  };

  /* istanbul ignore next */
  const addNewState = () => {
    const country: any = params?.countryId
      ? _countryStore.countries.find(({ id }) => Utilities.isEqual(id, Number(params?.countryId)))
      : new CountryModel({ id: 0, name: '', isO2Code: '' });

    const state = new StateModel({
      id: 0,
      isoCode: '',
      name: '',
      country,
      stateType: new SettingsTypeModel({ id: 0, name: '' }),
    });
    openUpsertStateDialog(VIEW_MODE.NEW, 0, state);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addNewState}
        >
          Add State
        </PrimaryButton>
      </ViewPermission>
    );
  };

  /* istanbul ignore next */
  const upsertState = (rowIndex: number, stateMode: StateModel): Observable<StateModel> => {
    gridState.gridApi.stopEditing();
    return _countryStore
      .upsertState(stateMode)
      .pipe(tap((response: StateModel) => agGrid._updateTableItem(rowIndex, response)));
  };

  const backButton = (): ReactNode => {
    if (!params.countryId) return null;
    const { updatedBackNavLink, backNavTitle } = updatedBackNavigation();
    return <CustomLinkButton to={updatedBackNavLink} title={backNavTitle} startIcon={<ArrowBack />} />;
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        backButton={backButton()}
        selectInputs={[ agGridUtilities.createSelectOption(STATE_FILTERS, STATE_FILTERS.COUNTRY_CODE) ]}
        onSearch={sv => loadStates()}
        onFiltersChanged={loadStates}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadStates}
      />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(State));
