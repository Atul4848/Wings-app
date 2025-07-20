import React, { ReactNode, FC, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { CityModel, StateModel, CountryModel, VIEW_MODE, baseApiPath, AuditHistory } from '@wings/shared';
import { CountryStore, SettingsStore } from '../Shared/Stores';
import { inject, observer } from 'mobx-react';
import {
  COUNTRY_AUDIT_MODULES,
  CITY_FILTERS,
  updatedBackNavigation,
  updateCountrySidebarOptions,
  useCountryModuleSecurity,
} from '../Shared';
import { Button, Theme } from '@material-ui/core';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import LocationCityIcon from '@material-ui/icons/LocationOnOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { cityGridFilters } from './fields';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { MapBoxView } from '@wings-shared/mapbox';
import { IMarker } from '@wings-shared/mapbox/dist/Interfaces';
import {
  GridPagination,
  IAPIGridRequest,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { SidebarStore, CustomLinkButton } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import UpsertCity from './UpsertCity/UpsertCity';
import ArrowBack from '@material-ui/icons/ArrowBack';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
  theme?: Theme;
}

const City: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<CITY_FILTERS, CityModel>(cityGridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _countryStore = props.countryStore as CountryStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const params = useParams();
  const countryId = Utilities.getNumberOrNullValue(params?.countryId);
  const stateId = Utilities.getNumberOrNullValue(params?.stateId);
  const _useConfirmDialog = useConfirmDialog();
  const countryModuleSecurity = useCountryModuleSecurity();

  useEffect(() => {
    loadCities();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadCities());
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Cities'), 'countries');
  }, []);

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest | null => {
    if (countryId || stateId) {
      const countryFilter = countryId ? { propertyName: 'Country.CountryId', propertyValue: countryId } : {};
      const stateFilter = stateId ? { propertyName: 'State.StateId', propertyValue: stateId } : {};
      return {
        filterCollection: JSON.stringify([ countryFilter, stateFilter ]),
      };
    }
    return null;
  };

  /* istanbul ignore next */
  const loadCities = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
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
    UIStore.setPageLoader(true);
    _countryStore
      ?.getCities(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(cities => {
        gridState.setGridData(cities.results);
        gridState.setPagination(new GridPagination({ ...cities }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const removeCity = (rowIndex: number) => {
    ModalStore.close();
    const model: CityModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _countryStore
      .removeCity(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Official Name',
      field: 'officialName',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('officialName', 2),
    },
    {
      headerName: 'Common Name',
      field: 'commonName',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('commonName', 2),
    },
    {
      headerName: 'CAPPS Name',
      field: 'cappsName',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cappsName', 2),
    },
    {
      headerName: 'CAPPS Code',
      field: 'cappsCode',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cappsCode', 1, 'start'),
    },
    {
      headerName: 'State Code',
      field: 'state',
      filter: 'agTextColumnFilter',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('state', 1, 'start'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.code || value?.isoCode || '',
    },
    {
      headerName: 'Country Code',
      field: 'country',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('country', 1, 'start'),
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.code || value?.isO2Code || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      headerName: 'View Location',
      field: 'latitude',
      cellRenderer: 'viewRenderer',
      minWidth: 110,
      maxWidth: 120,
      suppressMenu: true,
      filter: false,
      sortable: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <Button
            disabled={!data.latitude || !data.longitude}
            onClick={() => openMapViewDialog(data)}
            style={{ height: '100%' }}
          >
            <LocationCityIcon color="primary" />
          </Button>
        ),
      },
    },
    {
      ...agGrid.actionColumn({ headerName: 'Action' }),
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: columnDefs,
      isEditable: countryModuleSecurity.isEditable,
      gridActionProps: {
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        actionMenus: ({ data }) => [
          { title: 'Edit', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
          { title: 'Details', action: GRID_ACTIONS.DETAILS },
          { title: 'Audit', action: GRID_ACTIONS.AUDIT },
          {
            title: 'Delete',
            isHidden: !countryModuleSecurity.isEditable || data.cappsCode,
            action: GRID_ACTIONS.DELETE,
          },
        ],
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
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      pagination: false,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadCities();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadCities();
      },
    };
  };

  const openUpsertCityDialog = (viewMode: VIEW_MODE, rowIndex: number, cityModel: CityModel) => {
    ModalStore.open(
      <UpsertCity
        countryStore={_countryStore}
        settingsStore={_settingsStore}
        viewMode={viewMode}
        cityModel={cityModel}
        onUpsertCity={(cityModel: CityModel) => upsertCity(rowIndex, cityModel)}
      />
    );
  };

  /* istanbul ignore next */
  const openMapViewDialog = (model: CityModel) => {
    const title: string = `${model.officialName} (LAT: ${model.latitude},  LON: ${model.longitude})`;
    ModalStore.open(
      <Dialog
        title={title}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <MapBoxView
            marker={{ title, latitude: Number(model.latitude), longitude: Number(model.longitude) } as IMarker}
          />
        )}
        dialogActions={() => (
          <PrimaryButton variant="outlined" onClick={() => ModalStore.close()}>
            Close
          </PrimaryButton>
        )}
      />
    );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        openUpsertCityDialog(VIEW_MODE.EDIT, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        openUpsertCityDialog(VIEW_MODE.DETAILS, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveCity(rowIndex);
        break;
      case GRID_ACTIONS.AUDIT:
        const model: CityModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.officialName || model.commonName}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.CITY}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
    }
  };

  const upsertCity = (rowIndex: number, cityModel: CityModel): Observable<CityModel> => {
    gridState.gridApi.stopEditing();
    return (_countryStore as CountryStore)
      .upsertCity(cityModel)
      .pipe(tap((response: CityModel) => agGrid._updateTableItem(rowIndex, response)));
  };

  /* istanbul ignore next */
  const addCity = () => {
    const country = countryId
      ? _countryStore.countries.find(({ id }) => Utilities.isEqual(id, countryId))
      : new CountryModel({ id: 0 });

    const state = stateId
      ? _countryStore.states.find(({ id }) => Utilities.isEqual(id, stateId))
      : new StateModel({ id: 0 });

    const city = new CityModel({ id: 0, country, state });
    openUpsertCityDialog(VIEW_MODE.NEW, 0, city);
  };

  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={UIStore.pageLoading} onClick={addCity}>
          Add City
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const confirmRemoveCity = (rowIndex: number) => {
    const model: CityModel = agGrid._getTableItem(rowIndex);
    if (!Boolean(model.id)) {
      agGrid._removeTableItems([ model ]);
      return;
    }
    _useConfirmDialog.confirmAction(() => removeCity(rowIndex), { isDelete: true });
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
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(CITY_FILTERS, CITY_FILTERS.CITY_NAME) ]}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onSearch={sv => loadCities()}
        onFiltersChanged={loadCities}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        backButton={backButton()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadCities}
      />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(City));
