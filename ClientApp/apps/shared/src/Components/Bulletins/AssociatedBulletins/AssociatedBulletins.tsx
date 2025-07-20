import { GRID_ACTIONS, GridPagination, IAPIGridRequest, SearchStore, UIStore, Utilities } from '@wings-shared/core';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  ASSOCIATED_BULLETIN_FILTERS,
  BULLETIN_FILTERS,
  BulletinModel,
  BulletinStore,
  NO_SQL_COLLECTIONS,
  VIEW_MODE,
} from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactElement, ReactNode, useEffect, useMemo } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, MenuItem, SidebarStore } from '@wings-shared/layout';
import { useLocation, useParams } from 'react-router-dom';
import { associatedBulletinFilters } from '../fields';

export interface INavigationLink {
  to: string;
  title: string;
  icon?: string | ReactElement;
  isHidden?: boolean;
  isDisabled?: boolean;
}
interface Props {
  title: string;
  updateAirportSidebarOptions?: (tabQuery?: string, isDisabled?: boolean) => MenuItem[] | INavigationLink[];
  airportBasePath?: (airportId, icao, viewMode) => string;
  basePath?: string;
  bulletinStore?: BulletinStore;
  sidebarStore?: typeof SidebarStore;
  collectionName?: NO_SQL_COLLECTIONS;
}

const AssociatedBulletins: FC<Props> = observer(
  ({ bulletinStore, title, collectionName, sidebarStore, updateAirportSidebarOptions, airportBasePath }) => {
    const unsubscribe = useUnsubscribe();
    const gridState = useGridState();
    const location = useLocation();
    const params = useParams();
    const agGrid = useAgGrid<ASSOCIATED_BULLETIN_FILTERS, BulletinModel>(associatedBulletinFilters, gridState);
    const searchHeader = useSearchHeader();

    // Load Data on Mount
    useEffect(() => {
      const { airportId, icao, viewMode } = params;
      sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Associated Bulletins', !Boolean(airportId)),
        airportBasePath(airportId, icao, viewMode)
      );
      // Restore Search Result based on available history
      searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
      agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
    }, []);

    // need to send filter for Code along with Name
    const searchFilters = (searchValue, selectedOption, request) => {
      const _searchFilters = agGrid.filtersApi.getSearchFilters(searchValue, selectedOption);
      const result = JSON.parse(_searchFilters.searchCollection as string)[0];
      if (selectedOption === BULLETIN_FILTERS.BULLETIN_ENTITY) {
        request.searchCollection = JSON.stringify(
          [ result ].concat(Utilities.getFilter('BulletinEntity.Code', searchValue as string, 'or'))
        );
      }
      if (selectedOption === BULLETIN_FILTERS.VENDOR_LOCATION_AIRPORT) {
        request.searchCollection = JSON.stringify(
          [ result ].concat(Utilities.getFilter('VendorLocationAirport.DisplayCode', searchValue as string, 'or'))
        );
      }
    };

    const loadInitialData = (pageRequest?: IAPIGridRequest) => {
      const _searchValue = searchHeader.getFilters().searchValue;
      const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
      const request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: gridState.pagination.pageSize,
        filterCollection: JSON.stringify([
          Utilities.getFilter('BulletinEntity.Code', params.icao, 'and'),
          Utilities.getFilter('VendorLocationAirport.DisplayCode', params.icao, 'or'),
        ]),
        ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
        ...agGrid.filtersApi.gridSortFilters(),
        ...agGrid.filtersApi.getAdvancedSearchFilters(),
        ...pageRequest,
      };
      if (_searchValue) {
        searchFilters(_searchValue, _selectedOption, request);
      }
      UIStore.setPageLoader(true);
      const getBulletinsApi = bulletinStore?.getBulletinsNoSql(request, collectionName);
      getBulletinsApi
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(response => {
          gridState.setPagination(new GridPagination({ ...response }));
          gridState.setGridData(response.results);
          agGrid.filtersApi.gridAdvancedSearchFilterApplied();
        });
    };

    const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
      if (rowIndex === null) {
        return;
      }
      searchHeader.saveSearchFilters(gridState);
    };

    const selectInputs = useMemo(() => {
      return [
        agGridUtilities.createSelectOption(ASSOCIATED_BULLETIN_FILTERS, ASSOCIATED_BULLETIN_FILTERS.BULLETIN_LEVEL),
      ];
    }, []);

    /* istanbul ignore next */
    const columnDefs: ColDef[] = [
      {
        headerName: 'Bulletin Level',
        field: 'bulletinLevel',
        headerTooltip: 'Bulletin Level',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinLevel', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin Source',
        field: 'bulletinSource',
        headerTooltip: 'Bulletin Source',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinSource', 1),
      },
      {
        headerName: 'Bulletin Priority',
        field: 'bulletinPriority',
        headerTooltip: 'Bulletin Priority',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinPriority', 1),
      },
      {
        headerName: 'Bulletin Type',
        field: 'appliedBulletinTypes',
        headerTooltip: 'Bulletin Type',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('appliedBulletinTypes', 1),
      },
      {
        headerName: 'Bulletin CAPPS Category Code',
        field: 'bulletinCAPPSCategory',
        headerTooltip: 'Bulletin CAPPS Category Code',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.code || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinCAPPSCategory', 1),
      },
      {
        headerName: 'Vendor Location Airport',
        field: 'vendorLocationAirport',
        headerTooltip: 'Vendor Location Airport',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('vendorLocationAirport', 1),
      },
      {
        headerName: 'Notam Id',
        field: 'notamNumber',
        headerTooltip: 'Notam Id',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('notamNumber', 1),
      },
      {
        headerName: 'UAOffice',
        field: 'uaOffice',
        headerTooltip: 'UAOffice',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: 'agTextColumnFilter',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('uaOffice', 1),
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        headerTooltip: 'Start Date',
      },
      {
        headerName: 'End Date',
        field: 'endDate',
        headerTooltip: 'End Date',
      },
      {
        headerName: 'Status',
        field: 'status',
        headerTooltip: 'Status',
        cellRenderer: 'statusRenderer',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
      },
      ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
      {
        ...agGrid.actionColumn({
          cellRendererParams: {
            isActionMenu: true,
            actionMenus: node => {
              const _id = node.data?.id;
              return [
                {
                  title: 'Details',
                  action: GRID_ACTIONS.DETAILS,
                  to: () => `${_id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
                },
              ];
            },
            onAction: gridActions,
          },
        }),
      },
    ];

    const bulletinGridOptions = (): GridOptions => {
      const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
        context: {},
        columnDefs,
      });

      return {
        ...baseOptions,
        pagination: false,
        suppressRowClickSelection: true,
        suppressCellSelection: true,
        isExternalFilterPresent: () => false,
        onFilterChanged: () => {
          if (Array.from(gridState.columFilters).length) {
            searchHeader.resetInputs();
            return;
          }
          loadInitialData();
        },
        onSortChanged: e => {
          agGrid.filtersApi.onSortChanged(e);
          loadInitialData();
        },
        onGridReady: e => {
          agGrid.onGridReady(e);
          SearchStore.applyDefaultSortFilter(location.pathname, gridState.gridApi);
        },
      };
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={title}
          isEditMode={false}
          backNavLink="/airports"
          backNavTitle="Airports"
          hideActionButtons={true}
        />
      );
    };

    return (
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
        <SearchHeaderV3
          useSearchHeader={searchHeader}
          selectInputs={selectInputs}
          onFiltersChanged={loadInitialData}
          onSearch={() => loadInitialData()}
          onResetFilterClick={() => {
            agGrid.cancelEditing(0);
            agGrid.filtersApi.resetColumnFilters();
          }}
          onExpandCollapse={agGrid.autoSizeColumns}
          disableControls={Boolean(Array.from(gridState.columFilters).length)}
        />
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={gridState.data}
          gridOptions={bulletinGridOptions()}
          serverPagination={true}
          paginationData={gridState.pagination}
          onPaginationChange={loadInitialData}
        />
      </DetailsEditorWrapper>
    );
  }
);

export default inject('bulletinStore', 'sidebarStore')(AssociatedBulletins);
