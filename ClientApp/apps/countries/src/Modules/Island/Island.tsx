import { Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GRID_ACTIONS,
  GridPagination,
  IAPIFilterDictionary,
  IAPIGridRequest,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import {
  CustomAgGridReact,
  IActionMenuItem,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import {
  AuditHistory,
  CountryModel,
  IslandModel,
  StateModel,
  VIEW_MODE,
  baseApiPath,
  baseGridFiltersDictionary,
} from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import {
  COUNTRY_AUDIT_MODULES,
  ISLAND_FILTERS,
  updateCountrySidebarOptions,
  updatedBackNavigation,
  useCountryModuleSecurity,
} from '../Shared';
import { CountryStore, SettingsStore } from '../Shared/Stores';
import UpsertIsland from './UpsertIsland/UpsertIsland';
import { useParams } from 'react-router';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
  theme?: Theme;
}

const gridFilters: IAPIFilterDictionary<ISLAND_FILTERS>[] = [
  { columnId: 'name', apiPropertyName: 'Name', uiFilterType: ISLAND_FILTERS.NAME },
  { columnId: 'country', apiPropertyName: 'Country.Name', uiFilterType: ISLAND_FILTERS.COUNTRY },
  { columnId: 'state', apiPropertyName: 'State.Name', uiFilterType: ISLAND_FILTERS.STATE },
  ...baseGridFiltersDictionary<ISLAND_FILTERS>(),
];

const Island: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<ISLAND_FILTERS, IslandModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const countryModuleSecurity = useCountryModuleSecurity();
  const _countryStore = props.countryStore as CountryStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const params = useParams();
  const countryId = Number(params.countryId);
  const stateId = Number(params.stateId);

  useEffect(() => {
    loadIslands();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadIslands());
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Islands'), 'countries');
  }, []);

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest | null => {
    if (params?.countryId && params.stateId) {
      return {
        filterCollection: JSON.stringify([
          { propertyName: 'Country.CountryId', propertyValue: params.countryId },
          { propertyName: 'State.StateId', propertyValue: params.stateId },
        ]),
      };
    }
    if (params?.countryId) {
      return {
        filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: params?.countryId }]),
      };
    }
    return null;
  };

  /* istanbul ignore next */
  const loadIslands = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageSize: 30,
      ...pageRequest,
      ...agGrid.filtersApi.gridSortFilters(),
      ...filterCollection(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _countryStore
      .getIslands(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results);
          gridState.setPagination(new GridPagination({ ...response }));
          agGrid.filtersApi.gridAdvancedSearchFilterApplied();
        },
      });
  };

  /* istanbul ignore next */
  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
      { title: 'Details', action: GRID_ACTIONS.DETAILS },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Country',
      field: 'country',
      minWidth: 210,
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('country', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
    },
    {
      headerName: 'State',
      field: 'state',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('state', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => actionMenus(),
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: columnDefs,
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
        loadIslands();
      },
      onSortChanged: api => {
        agGrid.filtersApi.onSortChanged(api);
        loadIslands({ pageNumber: 1 });
      },
    };
  };

  const openUpsertIslandDialog = (viewMode: VIEW_MODE, rowIndex: number, islandModel: IslandModel) => {
    ModalStore.open(
      <UpsertIsland
        islandModel={islandModel}
        countryStore={_countryStore}
        settingsStore={_settingsStore}
        viewMode={viewMode}
        onUpsertIsland={(islandModel: IslandModel) => upsertIsland(rowIndex, islandModel)}
      />
    );
  };

  const addNewIsland = () => {
    const country = countryId
      ? _countryStore.countries.find(({ id }) => Utilities.isEqual(id, countryId))
      : new CountryModel({ id: 0 });

    const state = stateId
      ? _countryStore.states.find(({ id }) => Utilities.isEqual(id, stateId))
      : new StateModel({ id: 0 });

    const island = new IslandModel({ id: 0, country, state });
    openUpsertIslandDialog(VIEW_MODE.NEW, 0, island);
  };

  /* istanbul ignore next */
  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        openUpsertIslandDialog(VIEW_MODE.EDIT, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        openUpsertIslandDialog(VIEW_MODE.DETAILS, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.AUDIT:
        const model: IslandModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.ISLAND}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
    }
  };

  const rightContent = () => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={UIStore.pageLoading || gridState.isRowEditing}
          onClick={addNewIsland}
        >
          Add Island
        </PrimaryButton>
      </ViewPermission>
    );
  };

  /* istanbul ignore next */
  const upsertIsland = (rowIndex: number, islandModel: IslandModel) => {
    return (_countryStore as CountryStore).upsertIsland(islandModel.serialize()).pipe(
      tap((response: IslandModel) => {
        agGrid._updateTableItem(rowIndex, response);
        ModalStore.close();
      })
    );
  };

  const backButton = (): ReactNode => {
    if (!countryId && !stateId) return null;
    const { updatedBackNavLink, backNavTitle } = updatedBackNavigation();
    return <CustomLinkButton to={updatedBackNavLink} title={backNavTitle} startIcon={<ArrowBack />} />;
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(ISLAND_FILTERS, ISLAND_FILTERS.NAME) ]}
        onFiltersChanged={loadIslands}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onSearch={sv => loadIslands()}
        onExpandCollapse={agGrid.autoSizeColumns}
        backButton={backButton()}
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
        onPaginationChange={loadIslands}
      />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(Island));
