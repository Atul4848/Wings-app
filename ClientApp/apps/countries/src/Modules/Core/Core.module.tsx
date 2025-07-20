import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, RowNode, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { Theme } from '@material-ui/core';
import { CountryModel, VIEW_MODE, AuditHistory, baseApiPath } from '@wings/shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  COUNTRY_FILTERS,
  COUNTRY_AUDIT_MODULES,
  updatedBackNavigation,
  updateCountrySidebarOptions,
  CountryStore,
  RegionStore,
  SettingsStore,
  countrySidebarOptions,
  useCountryModuleSecurity,
} from '../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Observable } from 'rxjs';
import {
  AccessLevelModel,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  SourceTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  IActionMenuItem,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import { countryGridFilters } from './fields';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  regionStore?: RegionStore;
  sidebarStore?: typeof SidebarStore;
  theme?: Theme;
}

const CoreModule: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<COUNTRY_FILTERS, CountryModel>(countryGridFilters, gridState);
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _countryStore = props.countryStore as CountryStore;
  const countryModuleSecurity = useCountryModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(countrySidebarOptions(true), 'countries');
    if (Boolean(params?.continentId)) {
      _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Countries'), 'countries');
    }
    loadInitialData();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    loadCountries(pageRequest)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest | null => {
    const { continentId } = params;
    if (continentId) {
      return {
        filterCollection: JSON.stringify([{ propertyName: 'Continent.ContinentId', propertyValue: continentId }]),
      };
    }
    return null;
  };

  /* istanbul ignore next */
  const loadCountries = (pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<CountryModel>> => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    return (_countryStore as CountryStore).getCountries(request).pipe(
      takeUntil(unsubscribe.destroy$),
      tap(countries => {
        gridState.setGridData(countries.results);
        gridState.setPagination(new GridPagination({ ...countries }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      })
    );
  };

  const rightContent = () => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="upsert/new" title="Add Country" />
      </ViewPermission>
    );
  };

  const backButton = () => {
    const { continentId } = params;
    if (!continentId) return null;
    const { updatedBackNavLink, backNavTitle } = updatedBackNavigation();
    return <CustomLinkButton to={updatedBackNavLink} title={backNavTitle} startIcon={<ArrowBack />} />;
  };

  /* istanbul ignore next */
  const actionMenus = (): IActionMenuItem[] => {
    return [
      {
        title: 'Edit',
        isHidden: !countryModuleSecurity.isEditable,
        action: GRID_ACTIONS.EDIT,
        to: node => `upsert/${node.data.id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: node => `upsert/${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
      },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
      {
        title: 'View States',
        action: GRID_ACTIONS.VIEW,
        to: node => `${node.data.id}/states`,
      },
      {
        title: 'View Islands',
        action: GRID_ACTIONS.VIEW,
        to: node => `${node.data.id}/islands`,
      },
    ];
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'ISO2 code',
      field: 'isO2Code',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('isO2Code', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'ISO3 code',
      field: 'isO3Code',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('isO3Code', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Official Name',
      field: 'officialName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('officialName', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Common Name',
      field: 'commonName',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('commonName', 2),
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Is Territory',
      field: 'isTerritory',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      filter: false,
    },
    {
      headerName: 'Sovereign Country',
      field: 'sovereignCountry',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('sovereignCountry', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('accessLevel', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceType', 2),
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        minWidth: 140,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => actionMenus(),
          onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
            if (action === GRID_ACTIONS.AUDIT) {
              const model: CountryModel = agGrid._getTableItem(rowIndex);
              ModalStore.open(
                <AuditHistory
                  title={model.officialName || model.commonName}
                  entityId={model.id}
                  entityType={COUNTRY_AUDIT_MODULES.COUNTRY}
                  baseUrl={baseApiPath.countries}
                />
              );
            }
          },
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
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadInitialData();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData(gridState.pagination);
      },
    };
  };
  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(COUNTRY_FILTERS, COUNTRY_FILTERS.COMMONNAME) ]}
        backButton={backButton()}
        onSearch={sv => loadInitialData()}
        onFiltersChanged={loadInitialData}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
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
        onPaginationChange={loadInitialData}
      />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'regionStore', 'sidebarStore')(observer(CoreModule));
