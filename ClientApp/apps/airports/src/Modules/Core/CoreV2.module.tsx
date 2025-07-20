import { ColDef, GridOptions, RowNode, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AirportLocationIcon from '@material-ui/icons/LocationOnOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuditHistory, baseApiPath, VIEW_MODE } from '@wings/shared';
import {
  AIRPORT_AUDIT_MODULES,
  AIRPORT_FILTERS,
  AirportModel,
  updatedAirportSidebarOptions,
  useAirportModuleSecurity,
} from '../Shared';
import { AirportStore } from '../Shared/Stores';
import { finalize, takeUntil } from 'rxjs/operators';
import { gridFilters, specifiedFields } from './fields';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { MapBoxView } from '@wings-shared/mapbox';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { IMarker } from '@wings-shared/mapbox/dist/Interfaces';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const CoreModule: FC<Props> = ({ airportStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_FILTERS, AirportModel>(gridFilters, gridState);
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _airportStore = airportStore as AirportStore;
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore.setNavLinks(updatedAirportSidebarOptions('', window.location.search), '/airports');
    searchHeader.restoreSearchFilters(gridState, () => loadAirports());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAirports());
  }, []);

  /* istanbul ignore next */
  const loadAirports = (pageRequest?: IAPIGridRequest): void => {
    const _searchValue = searchHeader.getFilters().searchValue;
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption')
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      specifiedFields,
      ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    if (_searchValue && _selectedOption === AIRPORT_FILTERS.ALL) {
      const searchCollection = gridFilters.map((x, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return { propertyName: x.apiPropertyName, propertyValue: _searchValue, ...operator };
      });
      request.searchCollection = JSON.stringify(searchCollection);
    }

    UIStore.setPageLoader(true);
    _airportStore
      .getAirports(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.VIEW, GRID_ACTIONS.DETAILS ].includes(gridAction)) {
      searchHeader.saveSearchFilters(gridState);
    }
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AirportModel = agGrid._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.title}
          entityId={model.id}
          entityType={AIRPORT_AUDIT_MODULES.AIRPORT}
          baseUrl={baseApiPath.airports}
        />
      );
    }
  };

  const menuOptions = (rowNode: RowNode) => {
    return [
      {
        title: 'Edit',
        isHidden: !rowNode.data?.isActive || !airportModuleSecurity.isEditable,
        action: GRID_ACTIONS.EDIT,
        to: node => getAirportUrl(node.data, VIEW_MODE.EDIT),
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.VIEW,
        to: node => getAirportUrl(node.data, VIEW_MODE.DETAILS),
      },
      {
        title: 'View Hours Details',
        action: GRID_ACTIONS.VIEW,
        to: node => `${getAirportUrl(node.data, VIEW_MODE.DETAILS)}/airport-hours`,
      },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO',
      field: 'icaoCode.code',
      width: 250,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('icaoCode.code', 1),
    },
    {
      headerName: 'UWA',
      headerTooltip: 'UWA',
      field: 'uwaAirportCode.code',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('uwaAirportCode.code', 1),
    },
    {
      headerName: 'IATA',
      headerTooltip: 'IATA',
      field: 'iataCode',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('iataCode', 1),
    },
    {
      headerName: 'FAA Code',
      headerTooltip: 'FAA Code',
      field: 'faaCode',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('faaCode', 1),
    },
    {
      headerName: 'Regional Code',
      headerTooltip: 'Regional Code',
      field: 'regionalAirportCode.code',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('regionalAirportCode.code', 1),
    },
    {
      headerName: 'Source Location ID',
      headerTooltip: 'Source Location ID',
      field: 'sourceLocationId',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceLocationId', 1),
    },
    {
      headerName: 'Name',
      headerTooltip: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 1),
    },
    {
      headerName: 'CAPPS Airport Name',
      headerTooltip: 'CAPPS Airport Name',
      field: 'cappsAirportName',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('cappsAirportName', 1),
    },
    {
      headerName: 'City',
      headerTooltip: 'City',
      field: 'airportLocation.city',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('airportLocation.city', 1),
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'State',
      headerTooltip: 'State',
      field: 'airportLocation.state',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('airportLocation.state', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Country',
      headerTooltip: 'Country',
      field: 'airportLocation.country',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('airportLocation.country', 1),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Status',
      headerTooltip: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 1),
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
            disabled={!data.latitudeCoordinate?.latitude || !data.longitudeCoordinate?.longitude}
            onClick={() => openMapViewDialog(data)}
            style={{ height: '100%' }}
          >
            <AirportLocationIcon color="primary" />
          </Button>
        ),
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: gridActions,
          actionMenus: menuOptions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const openMapViewDialog = (model: AirportModel): void => {
    const { name, latitudeCoordinate, longitudeCoordinate } = model
    const title: string = `${name} (LAT: ${latitudeCoordinate?.latitude},  LON: ${longitudeCoordinate?.longitude})`;
    ModalStore.open(
      <Dialog
        title={title}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <MapBoxView
            marker={
              {
                title,
                latitude: latitudeCoordinate?.latitude,
                longitude: longitudeCoordinate?.longitude,
              } as IMarker
            }
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

  /* istanbul ignore next */
  // airport url without or without icao
  const getAirportUrl = (model: AirportModel, action: VIEW_MODE) => {
    return `upsert/${model.id}/${model.displayCode}/${action.toLocaleLowerCase()}`;
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: () => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs()
          return
        }
        loadAirports()
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAirports();
      },
    };
  };

  /* istanbul ignore next */
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="upsert/new" title="Add Airport" />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_FILTERS, AIRPORT_FILTERS.ALL) ]}
        rightContent={rightContent}
        onFiltersChanged={loadAirports}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
        onExpandCollapse={agGrid.autoSizeColumns}
        onSearch={(sv) => loadAirports()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadAirports}
      />
    </>
  );
};

export default inject('airportStore', 'sidebarStore')(observer(CoreModule));
