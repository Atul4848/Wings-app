import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import {
  FlightPlanModel,
  FlightPlanStore,
  FLIGHT_PLAN_FILTERS,
  sidebarMenu,
  useAircraftModuleSecurity,
} from '../Shared';
import { Chip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { useStyles } from './FlightPlan.styles';
import {
  AccessLevelModel,
  DATE_FORMAT,
  IClasses,
  ISelectOption,
  SourceTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  SettingsTypeModel,
  GRID_ACTIONS,
  IAPIGridRequest,
  GridPagination,
} from '@wings-shared/core';
import { SidebarStore, CustomLinkButton } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  IActionMenuItem,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { flightPlanGridFilters } from './fields';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';

interface Props {
  flightPlanStore?: FlightPlanStore;
  sidebarStore?: typeof SidebarStore;
}

const FlightPlan: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const location = useLocation();
  const agGrid = useAgGrid<FLIGHT_PLAN_FILTERS, FlightPlanModel>(flightPlanGridFilters, gridState);
  const searchHeader = useSearchHeader();
  const _flightPlanStore = props.flightPlanStore as FlightPlanStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(sidebarMenu, 'aircraft');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    loadInitialData();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    UIStore.setPageLoader(true);
    _flightPlanStore
      .getFlightPlans(true, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(flightPlans => {
        gridState.setPagination(new GridPagination({ ...flightPlans }));
        gridState.setGridData(flightPlans.results);
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  const actionMenus = (): IActionMenuItem[] => {
    return [
      {
        title: 'Edit',
        isHidden: !aircraftModuleSecurity.isEditable,
        action: GRID_ACTIONS.EDIT,
        to: node => `/aircraft/flight-plan/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: node => `/aircraft/flight-plan/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Format',
      field: 'format',
      cellRenderer: 'agGroupCellRenderer',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('format', 2),
    },
    {
      headerName: 'Assignment',
      field: 'flightPlanFormatStatus',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('flightPlanFormatStatus', 2),
    },
    {
      headerName: 'Last Used Date',
      field: 'lastUsedDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
    {
      headerName: 'Flight Plan Details',
      groupId: 'flightPlanDetails',
      children: [
        {
          headerName: 'Built By',
          groupId: 'flightPlanDetails',
          headerComponent: 'customHeader',
          field: 'builtBy',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('builtBy', 2),
        },
        {
          headerName: 'Built Date',
          columnGroupShow: 'open',
          field: 'builtDate',
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
          comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
        },
        {
          headerName: 'Contact For Changes',
          field: 'contactForChanges',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('contactForChanges', 2),
        },
        {
          headerName: 'Notes',
          field: 'notes',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('notes', 2),
        },
        {
          headerName: 'Access Level',
          columnGroupShow: 'open',
          field: 'accessLevel',
          comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('accessLevel', 2),
        },
        {
          headerName: 'Source',
          columnGroupShow: 'open',
          field: 'sourceType',
          comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
            Utilities.customComparator(current, next, 'name'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('sourceType', 2),
        },
        {
          headerName: 'Status',
          field: 'status',
          cellRenderer: 'statusRenderer',
          columnGroupShow: 'open',
          comparator: (current: ISelectOption, next: ISelectOption) =>
            Utilities.customComparator(current, next, 'value'),
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
        },
        {
          columnGroupShow: 'open',
          ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing)[0],
        },
      ],
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          onAction: (gridAction: GRID_ACTIONS) => {
            if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.DETAILS ].includes(gridAction)) {
              if (searchHeader) {
                searchHeader.saveSearchFilters(gridState);
              }
            }
          },
          actionMenus,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Flight Plan',
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      pagination: false,
      isExternalFilterPresent: () => false,
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: 'Account',
              field: 'accountNumber',
            },
            {
              headerName: 'Name',
              field: 'name',
            },
            {
              headerName: 'Registries',
              field: 'registriesName',
              cellRenderer: 'viewRenderer',
              cellRendererParams: {
                getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
                  viewRenderer(node.data?.registriesName),
              },
            },
          ],
          defaultColDef: { flex: 1 },
        },
        getDetailRowData: function(params) {
          params.successCallback(params.data.flightPlanFormatAccounts);
        },
      },
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
        loadInitialData({ pageNumber: 1 });
      },
    };
  };

  const viewRenderer = (registries: string, getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return registries
      .split(';')
      .filter(a => a.trim().length)
      .map((registries: string, index) => (
        <Chip
          classes={{ root: classes.chip }}
          key={index}
          label={registries.toUpperCase()}
          {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
        />
      ));
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to={`flight-plan/${VIEW_MODE.NEW.toLowerCase()}`}
          title="Add Flight Plan Format"
          disabled={UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(FLIGHT_PLAN_FILTERS, FLIGHT_PLAN_FILTERS.FORMAT) ]}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onExpandCollapse={agGrid.autoSizeColumns}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
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

export default inject('flightPlanStore', 'sidebarStore')(observer(FlightPlan));
