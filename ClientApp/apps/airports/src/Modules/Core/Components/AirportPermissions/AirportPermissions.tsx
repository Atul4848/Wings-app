import React, { FC, ReactNode, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import {
  PERMISSION_FILTERS,
  AirportPermissionModel,
  AirportSettingsStore,
  AirportStore,
  useAirportModuleSecurity,
  updateAirportSidebarOptions,
  airportBasePath,
} from '../../../Shared';
import {
  UIStore,
  GRID_ACTIONS,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
  IAPIPageResponse,
  Utilities,
  DATE_FORMAT,
} from '@wings-shared/core';
import { VIEW_MODE } from '@wings/shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { GridOptions, ColDef } from 'ag-grid-community';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { gridFilters } from './fields';
import { useParams } from 'react-router';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportPermissions: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<PERMISSION_FILTERS, AirportPermissionModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const _airportStore = props.airportStore as AirportStore;
  const _settingsStore = props.airportSettingsStore as AirportSettingsStore;
  const { isEditable } = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    props.sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Airport Permissions', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );

    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadAirportPermissions());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAirportPermissions());
  }, []);

  /* istanbul ignore next */
  const loadAirportPermissions = (pageRequest?: IAPIGridRequest): void => {
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
      filterCollection: JSON.stringify([ Utilities.getFilter('Airport.AirportId', params.airportId) ]),
    };
    UIStore.setPageLoader(true);
    _airportStore
      ?.getAirportPermissions(request)
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
      headerName: 'Permission Type',
      field: 'permissionType',
      headerTooltip: 'Permission Type',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('permissionType', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Required For',
      field: 'permissionRequiredFors',
      headerTooltip: 'Required For',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      sortable: false,
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('permissionRequiredFors', 1),
    },
    {
      headerName: 'PPR Purpose',
      field: 'pprPurposes',
      headerTooltip: 'PPR Purpose',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      sortable: false,
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('pprPurposes', 1),
    },
    {
      headerName: 'Notification Type',
      field: 'notificationType',
      headerTooltip: 'Notification Type',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('notificationType', 1),
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      headerTooltip: 'End Date',
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'Documents',
      field: 'documents',
      headerTooltip: 'Documents',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      sortable: false,
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('documents', 1),
    },
    ...agGrid.generalFields(_settingsStore),
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
                isHidden: !isEditable,
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
      isEditable,
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadAirportPermissions();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAirportPermissions({ pageNumber: 1 });
      },
    };
  };

  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Airport Permission" />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(PERMISSION_FILTERS, PERMISSION_FILTERS.PERMISSION_TYPE) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onFiltersChanged={loadAirportPermissions}
        onSearch={sv => loadAirportPermissions()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadAirportPermissions}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('sidebarStore', 'airportStore')(observer(AirportPermissions));
