import React, { FC, ReactNode, useEffect, ReactElement, useMemo } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { VIEW_MODE, NO_SQL_COLLECTIONS } from '@wings/shared';
import { useAgGrid, CustomAgGridReact, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { observer, inject } from 'mobx-react';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { GridPagination, IAPIGridRequest, UIStore, GRID_ACTIONS, SearchStore, Utilities } from '@wings-shared/core';
import { BulletinModel } from './Models';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, MenuItem, SidebarStore } from '@wings-shared/layout';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { BulletinStore } from './Stores/Bulletin.store';
import { BULLETIN_FILTERS } from './Enums';
import { gridFilters } from './fields';
import { useLocation } from 'react-router-dom';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { observable } from 'mobx';
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
}

const Bulletins: FC<Props> = observer(
  ({
    defaultSidebarOptions,
    basePath,
    bulletinStore,
    securityModule,
    collectionName,
    sidebarStore,
    purgedBulletins = false,
  }) => {
    const unsubscribe = useUnsubscribe();
    const gridState = useGridState();
    const location = useLocation();
    const agGrid = useAgGrid<BULLETIN_FILTERS, BulletinModel>(gridFilters, gridState);
    const searchHeader = useSearchHeader();
    const _useConfirmDialog = useConfirmDialog();
    const filterComponent = !purgedBulletins ? 'agTextColumnFilter' : '';
    const isCountryBulletin = useMemo(() => Utilities.isEqual(collectionName, NO_SQL_COLLECTIONS.COUNTRY_BULLETIN), [
      collectionName,
    ]);

    const _observable = observable({
      resetFilter: () => agGrid.filtersApi.resetColumnFilters(),
      noFilterIcon: '',
    });

    // Load Data on Mount
    useEffect(() => {
      if (defaultSidebarOptions) sidebarStore.setNavLinks(defaultSidebarOptions(true), basePath);
      if (purgedBulletins) {
        loadInitialData();
        return;
      }
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
        ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
        ...agGrid.filtersApi.gridSortFilters(),
        ...agGrid.filtersApi.getAdvancedSearchFilters(),
        ...pageRequest,
      };
      if (_searchValue) {
        searchFilters(_searchValue, _selectedOption, request);
      }
      UIStore.setPageLoader(true);
      const getBulletinsApi = purgedBulletins
        ? bulletinStore?.getPurgedBulletins()
        : bulletinStore?.getBulletinsNoSql(request, collectionName);
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

    const activateBulletin = (rowIndex: number) => {
      const data: BulletinModel = agGrid._getTableItem(rowIndex);
      UIStore.setPageLoader(true);
      bulletinStore
        ?.activateBulletin(data.purgedBulletinId)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: () => {
            agGrid._removeTableItems([ data ]);
            gridState.setGridData(agGrid._getAllTableRows());
          },
          error: (error: AxiosError) => AlertStore.critical(error.message),
        });
    };

    const confirmActivateBulletin = (rowIndex: number) => {
      _useConfirmDialog.confirmAction(
        () => {
          activateBulletin(rowIndex);
          ModalStore.close();
        },
        {
          message: 'Are you sure you want to clone this bulletin?',
          title: 'Confirm Clone',
        }
      );
    };

    const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
      if (rowIndex === null) {
        return;
      }
      switch (gridAction) {
        case GRID_ACTIONS.TOGGLE_STATUS:
          confirmActivateBulletin(rowIndex);
          break;
        case GRID_ACTIONS.DETAILS:
        case GRID_ACTIONS.EDIT:
          searchHeader.saveSearchFilters(gridState);
          break;
      }
    };

    const selectInputs = useMemo(() => {
      const { VENDOR_LOCATION_AIRPORT, VENDOR_LOCATION_AIRPORT_CODE, BULLETIN_ENTITY } = BULLETIN_FILTERS;
      const filterOptions = agGridUtilities.createSelectOption(BULLETIN_FILTERS, BULLETIN_ENTITY);
      if (isCountryBulletin) {
        filterOptions.selectOptions = filterOptions.selectOptions.filter(
          x => ![ VENDOR_LOCATION_AIRPORT, VENDOR_LOCATION_AIRPORT_CODE ].includes(x.label as BULLETIN_FILTERS)
        );
        return [ filterOptions ];
      }
      return [ filterOptions ];
    }, []);

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
                  title: 'Edit',
                  isHidden: !securityModule.isEditable || purgedBulletins,
                  action: GRID_ACTIONS.EDIT,
                  to: () => `${_id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
                },
                {
                  title: 'Details',
                  action: GRID_ACTIONS.DETAILS,
                  to: () => `${_id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
                },
                {
                  title: 'Clone',
                  isHidden: !securityModule.isEditable || !purgedBulletins,
                  action: GRID_ACTIONS.TOGGLE_STATUS,
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
            return
          }
          loadInitialData()
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
        doesExternalFilterPass: node => {
          const { searchValue, selectInputsValues } = searchHeader.getFilters()
          if (!searchValue) {
            return false;
          }
          const {
            id,
            bulletinEntity,
            bulletinLevel,
            bulletinCAPPSCategory,
            bulletinPriority,
            bulletinSource,
            uaOffice,
            appliedBulletinTypes,
            vendorLocationAirport,
            notamNumber,
          } = node.data as BulletinModel;
          return (
            !id ||
            agGrid.isFilterPass(
              {
                [BULLETIN_FILTERS.BULLETIN_ENTITY]: bulletinEntity.label,
                [BULLETIN_FILTERS.BULLETIN_LEVEL]: bulletinLevel.label,
                [BULLETIN_FILTERS.VENDOR_LOCATION_AIRPORT]: vendorLocationAirport.label,
                [BULLETIN_FILTERS.VENDOR_LOCATION_AIRPORT_CODE]: vendorLocationAirport.code,
                [BULLETIN_FILTERS.BULLETIN_CAPPS_CATEGORY_CODE]: bulletinCAPPSCategory.label,
                [BULLETIN_FILTERS.BULLETIN_PRIORITY]: bulletinPriority.label,
                [BULLETIN_FILTERS.BULLETIN_SOURCE]: bulletinSource.label,
                [BULLETIN_FILTERS.BULLETIN_TYPE]: appliedBulletinTypes.label,
                [BULLETIN_FILTERS.UA_OFFICE]: uaOffice.label,
                [BULLETIN_FILTERS.NOTAM_ID]: notamNumber,
              },
              searchValue,
              selectInputsValues.get('defaultOption')
            )
          );
        },
      };
    };

    const rightContent = (): ReactNode => {
      if (!securityModule.isEditable || purgedBulletins) {
        return null;
      }

      return <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Bulletin" />;
    };

    return (
      <>
        <SearchHeaderV3
          useSearchHeader={searchHeader}
          selectInputs={selectInputs}
          rightContent={rightContent}
          onFiltersChanged={() =>
            purgedBulletins
              ? gridState.gridApi?.onFilterChanged()
              : loadInitialData()
          }
          onSearch={sv => {
            purgedBulletins
              ? gridState.gridApi?.onFilterChanged()
              : loadInitialData()
          }}
          onResetFilterClick={!purgedBulletins ? _observable.resetFilter : (_observable.noFilterIcon as any)}
          onExpandCollapse={agGrid.autoSizeColumns}
          disableControls={Boolean(Array.from(gridState.columFilters).length)}
        />
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={gridState.data}
          gridOptions={purgedBulletins ? purgedBulletionsGridOptions() : bulletinGridOptions()}
          serverPagination={purgedBulletins ? false : true}
          paginationData={!purgedBulletins && gridState.pagination}
          onPaginationChange={!purgedBulletins && loadInitialData}
        />
      </>
    );
  }
);

export default inject('bulletinStore', 'sidebarStore')(Bulletins);
