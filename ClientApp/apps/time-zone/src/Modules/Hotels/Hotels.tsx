import React, { FC, ReactNode, useEffect } from 'react';
import { GridOptions, ColDef, ValueFormatterParams } from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import {
  TimeZoneSettingsStore,
  updateTimezoneSidebarOptions,
  HOTEL_FILTERS,
  HotelModel,
  TimeZoneStore,
} from '../Shared';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  GRID_ACTIONS,
  ViewPermission,
  IAPIGridRequest,
  IAPIPageResponse,
  GridPagination,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { VIEW_MODE } from '@wings/shared';
import AirportDetailsGrid from './AirportDetailsGrid/AirportDetailsGrid';
import { gridFilters } from './fields';

interface Props {
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  timeZoneStore?: TimeZoneStore;
  sidebarStore?: typeof SidebarStore;
}

const Hotels: FC<Props> = ({ timeZoneStore, timeZoneSettingsStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<HOTEL_FILTERS, HotelModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  const geographicModuleSecurity = useGeographicModuleSecurity();
  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Hotels'), 'geographic');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadHotels());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadHotels());
  }, []);

  /* istanbul ignore next */
  const loadHotels = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    UIStore.setPageLoader(true);
    _timeZoneStore
      .getHotelsNosql(request)
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

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Hotel Name',
      field: 'name',
      headerTooltip: 'Hotel Name',
      cellRenderer: 'agGroupCellRenderer',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 2),
    },
    {
      headerName: 'External ID',
      field: 'externalId',
      headerTooltip: 'External ID',
    },
    {
      headerName: 'External Source',
      field: 'hotelSource',
      headerTooltip: 'External Source',
    },
    {
      headerName: 'Address Line 1',
      field: 'addressLine1',
      headerTooltip: 'Address Line 1',
    },
    {
      headerName: 'Address Line 2',
      field: 'addressLine2',
      headerTooltip: 'Address Line 2',
    },
    {
      headerName: 'City',
      field: 'city',
      cellEditor: 'customAutoComplete',
      sortable: false,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      headerTooltip: 'City',
    },
    {
      headerName: 'Zip',
      field: 'zip',
      headerTooltip: 'Zip',
    },
    {
      headerName: 'State',
      field: 'state',
      cellEditor: 'customAutoComplete',
      sortable: false,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      headerTooltip: 'State',
    },
    {
      headerName: 'Country',
      field: 'country',
      cellEditor: 'customAutoComplete',
      sortable: false,
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      headerTooltip: 'Country',
    },
    {
      headerName: 'Local Phone Number',
      field: 'localPhoneNumber',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('localPhoneNumber', 2),
      headerTooltip: 'Local Phone Number',
    },
    {
      headerName: 'Fax Number',
      field: 'faxNumber',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('faxNumber', 2),
      headerTooltip: 'Fax Number',
    },
    {
      headerName: 'Reservation Email',
      field: 'reservationEmail',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('reservationEmail', 2),
      headerTooltip: 'Reservation Email',
    },
    {
      headerName: 'Front Desk Email',
      field: 'frontDeskEmail',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('frontDeskEmail', 2),
      headerTooltip: 'Front Desk Email',
    },
    {
      headerName: 'Website',
      field: 'website',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('website', 2),
      headerTooltip: 'Website',
    },
    ...agGrid.generalFields(_timeZoneSettingsStore),
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: node => {
            return [
              {
                title: 'Edit',
                action: GRID_ACTIONS.EDIT,
                isHidden: !geographicModuleSecurity.isEditable,
                to: () => `${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
              },
              {
                title: 'Details',
                action: GRID_ACTIONS.DETAILS,
                to: () => `${node.data?.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
              },
            ];
          },
          onAction: (action: GRID_ACTIONS) => {
            if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.DETAILS ].includes(action)) {
              searchHeader.saveSearchFilters(gridState);
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
      columnDefs,
      isEditable: geographicModuleSecurity.isEditable,
    });

    return {
      ...baseOptions,
      suppressCellSelection: true,
      suppressClickEdit: true,
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isEditable: geographicModuleSecurity.isEditable,
        timeZoneStore: _timeZoneStore,
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: AirportDetailsGrid,
      },
      isExternalFilterPresent: () => false,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadHotels();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadHotels({ pageNumber: 1 });
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Hotel" />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(HOTEL_FILTERS, HOTEL_FILTERS.NAME) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onFiltersChanged={loadHotels}
        onSearch={sv => loadHotels()}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadHotels}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('timeZoneStore', 'timeZoneSettingsStore', 'sidebarStore')(observer(Hotels));
