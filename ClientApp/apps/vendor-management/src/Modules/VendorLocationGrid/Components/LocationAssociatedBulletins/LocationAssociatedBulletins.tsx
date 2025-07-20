import React, { FC, useEffect, ReactElement, useMemo, useState, ReactNode } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { NO_SQL_COLLECTIONS, BulletinModel, BulletinStore, BULLETIN_FILTERS } from '@wings/shared';
import { useAgGrid, CustomAgGridReact, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { observer, inject } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { GridPagination, IAPIGridRequest, UIStore, GRID_ACTIONS, SearchStore, Utilities } from '@wings-shared/core';
import { useSearchHeader } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, MenuItem, SidebarStore } from '@wings-shared/layout';
import { gridFilters } from './Fields';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { VendorLocationStore } from 'apps/vendor-management/src/Stores';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { useStyles } from './LocationAssociatedBulletins.style';
export interface INavigationLink {
  to: string;
  title: string;
  icon?: string | ReactElement;
  isHidden?: boolean;
  isDisabled?: boolean;
}
interface Props {
  defaultSidebarOptions?: (defaultOptions: boolean, isDisabled?: boolean) => MenuItem[] | INavigationLink[];
  basePath?: string;
  bulletinStore?: BulletinStore;
  sidebarStore?: typeof SidebarStore;
  securityModule: any;
  collectionName?: NO_SQL_COLLECTIONS;
  filters?: any;
  purgedBulletins?: boolean;
  vendorLocationStore?: VendorLocationStore;
}

const LocationAssociatedBulletins: FC<Props> = observer(
  ({ vendorLocationStore, defaultSidebarOptions, basePath,
    bulletinStore, collectionName, sidebarStore, purgedBulletins = false }) => {
    const navigate = useNavigate();
    const unsubscribe = useUnsubscribe();
    const classes = useStyles();
    const gridState = useGridState();
    const location = useLocation();
    const params = useParams();
    const agGrid = useAgGrid<BULLETIN_FILTERS, BulletinModel>(gridFilters, gridState);
    const searchHeader = useSearchHeader();
    const filterComponent = !purgedBulletins ? 'agTextColumnFilter' : '';
    const isCountryBulletin = useMemo(() => Utilities.isEqual(collectionName, NO_SQL_COLLECTIONS.COUNTRY_BULLETIN), [
      collectionName,
    ]);
    // Load Data on Mount
    useEffect(() => {
      if (defaultSidebarOptions) sidebarStore.setNavLinks(defaultSidebarOptions(true), basePath);
      // Restore Search Result based on available history
      searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
      agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
    }, []);
    const { id } = params;

    const loadInitialData = (pageRequest?: IAPIGridRequest) => {
      const _searchValue = searchHeader.getFilters().searchValue;
      const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
      let request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: gridState.pagination.pageSize,
        ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
        ...agGrid.filtersApi.gridSortFilters(),
        ...agGrid.filtersApi.getAdvancedSearchFilters(),
        ...pageRequest,
      };
      const levelName = JSON.stringify(Utilities.getFilter('BulletinLevel.Name', 'Vendor Location'));
      const entityId = JSON.stringify(Utilities.getFilter('BulletinEntity.BulletinEntityId', id as string));
      request = { ...request, filterCollection: `[${levelName},${entityId}]` };
      UIStore.setPageLoader(true);
      const getBulletinsApi = purgedBulletins
        ? bulletinStore?.getPurgedBulletins()
        : bulletinStore?.getBulletinsNoSql(request, NO_SQL_COLLECTIONS.AIRPORT_BULLETIN);
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

    const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number, node: any): void => {
      const { data } = node;
      const { bulletinId } = data;
      navigate(`/airports/bulletins/${bulletinId}/details`);
      if (rowIndex === null) {
        return;
      }
      switch (gridAction) {
        case GRID_ACTIONS.DETAILS:
          return navigate(`/airports/bulletins/${bulletinId}/details`);
      }
    };
    /* istanbul ignore next */
    const columnDefs: ColDef[] = [
      {
        headerName: 'Bulletin Entity',
        field: 'bulletinEntity',
        headerTooltip: 'Bulletin Entity',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinEntity', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin Level',
        field: 'bulletinLevel',
        headerTooltip: 'Bulletin Level',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinLevel', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Vendor Location Airport',
        field: 'vendorLocationAirport',
        headerTooltip: 'Vendor Location Airport',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('vendorLocationAirport', 1),
        hide: isCountryBulletin,
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin Source',
        field: 'bulletinSource',
        headerTooltip: 'Bulletin Source',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinSource', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin Priority',
        field: 'bulletinPriority',
        headerTooltip: 'Bulletin Priority',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinPriority', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin Type',
        field: 'appliedBulletinTypes',
        headerTooltip: 'Bulletin Type',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('appliedBulletinTypes', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      {
        headerName: 'Bulletin CAPPS Category Code',
        field: 'bulletinCAPPSCategory',
        headerTooltip: 'Bulletin CAPPS Category Code',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.code || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('bulletinCAPPSCategory', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'code'),
      },
      {
        headerName: 'Notam Id',
        field: 'notamNumber',
        headerTooltip: 'Notam Id',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('notamNumber', 1),
      },
      {
        headerName: 'UAOffice',
        field: 'uaOffice',
        headerTooltip: 'UAOffice',
        valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('uaOffice', 1),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
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
        filter: filterComponent,
        filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
        comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      },
      ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
      {
        ...agGrid.actionColumn({
          cellRendererParams: {
            isActionMenu: true,
            actionMenus: node => {
              const _id = purgedBulletins ? node.data?.purgedBulletinId : node.data?.id;
              return [
                {
                  title: 'Details',
                  action: GRID_ACTIONS.DETAILS,
                  //  to: () => ,
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

    /* istanbul ignore next */
    const purgedBulletionsGridOptions = (): GridOptions => {
      const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
        context: {},
        columnDefs,
      });

      return {
        ...baseOptions,
        suppressRowClickSelection: true,
        suppressCellSelection: true,
        isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue),
      };
    };
    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={'Associated Bulletins'} />}
          backNavTitle="Vendor Location"
          hideActionButtons={false}
          backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
          isEditMode={false}
          showStatusButton={false}
          isActive={true}
        />
      );
    };
    return (
      <>
        <DetailsEditorWrapper
          headerActions={headerActions()}
          classes={{ headerActions: classes.headerActions }}
          isEditMode={false}
        >
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={gridState.data}
            gridOptions={purgedBulletins ? purgedBulletionsGridOptions() : bulletinGridOptions()}
            serverPagination={purgedBulletins ? false : true}
            paginationData={!purgedBulletins && gridState.pagination}
            onPaginationChange={!purgedBulletins && loadInitialData}
          />
        </DetailsEditorWrapper>
      </>
    );
  }
);

export default inject('vendorLocationStore','bulletinStore', 'sidebarStore')(LocationAssociatedBulletins);
