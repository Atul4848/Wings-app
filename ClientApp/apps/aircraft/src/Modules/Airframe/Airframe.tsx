import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  DATE_FORMAT,
  Utilities,
  UIStore,
  ViewPermission,
  SettingsTypeModel,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPIPageResponse,
  GridPagination,
} from '@wings-shared/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
  AirframeModel,
  AIRFRAME_FILTERS,
  AirframeStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { airframeFilterOptions, gridFilters } from './fields';
import moment from 'moment';

interface Props {
  airframeStore?: AirframeStore;
  sidebarStore?: typeof SidebarStore;
}

const Airframe: FC<Props> = ({ airframeStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRFRAME_FILTERS, AirframeModel>(gridFilters, gridState);
  const searchHeader = useSearchHeader();
  const _airframeStore = airframeStore as AirframeStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Airframe'), 'aircraft');
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const filterCollection = (_searchValue, _selectedOption) => {
    if (!_searchValue) {
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) => Utilities.isEqual(uiFilterType, _selectedOption));
    if (!property) return { filterCollection: JSON.stringify([]) };

    const filter = {
      propertyName: property.apiPropertyName,
      propertyValue: _searchValue,
      ...(_selectedOption === AIRFRAME_FILTERS.AIRWORTHINESS_DATE && { filterType: 'gte' }),
    };

    return { filterCollection: JSON.stringify([ filter ]) };
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const { searchValue: _searchValue, selectInputsValues } = searchHeader.getFilters();
    const _selectedOption = selectInputsValues.get('defaultOption');

    if (Utilities.isEqual(_selectedOption, AIRFRAME_FILTERS.AIRWORTHINESS_DATE)) {
      const isInvalidDate = _searchValue && !moment(_searchValue, DATE_FORMAT.API_DATE_FORMAT, true).isValid();
      if (isInvalidDate) return;
    }

    const shouldUseFilterCollection =
      [ _selectedOption ].some((option: AIRFRAME_FILTERS) => airframeFilterOptions.includes(option)) &&
      Boolean(_searchValue);

    const collection = shouldUseFilterCollection
      ? filterCollection(_searchValue, _selectedOption)
      : agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption);

    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...collection,
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _airframeStore
      .getAirframesNoSQL(request)
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

  const actionMenus = () => {
    return [
      {
        title: 'Edit',
        isHidden: !aircraftModuleSecurity.isEditable,
        action: GRID_ACTIONS.EDIT,
        to: node => `/aircraft/airframe/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: node => `/aircraft/airframe/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Serial Number',
      field: 'serialNumber',
      headerTooltip: 'Serial Number',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('serialNumber', 1),
    },
    {
      headerName: 'Series',
      field: 'aircraftVariation.series',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'Series',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aircraftVariation.series', 1),
    },
    {
      headerName: 'Airframe Status',
      field: 'airframeStatus',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('airframeStatus', 1),
    },
    {
      headerName: 'Airworthiness Date',
      field: 'airworthinessRecentDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
      headerTooltip: 'Airworthiness Date',
    },
    {
      headerName: 'Manufacture Date',
      field: 'manufactureDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
      headerTooltip: 'Manufacture Date',
    },
    {
      headerName: 'Temporary Engine Date',
      field: 'temporaryEngineDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
      headerTooltip: 'Temporary Engine Date',
    },
    {
      headerName: 'Crew Seat Cap',
      field: 'crewSeatCap',
      headerTooltip: 'Crew Seat Cap',
    },
    {
      headerName: 'Pax Seat Cap',
      field: 'paxSeatCap',
      headerTooltip: 'Pax Seat Cap',
    },
    {
      headerName: 'Variation',
      field: 'aircraftVariation.cappsId',
      headerTooltip: 'Variation',
    },
    {
      headerName: 'Registry',
      field: 'registries',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label,
      headerTooltip: 'Registry',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('registries', 1),
      cellRenderer: 'agGridChipView',
    },
    {
      headerName: 'ICAO Type',
      field: 'aircraftVariation.icaoTypeDesignator',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'ICAO Type',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aircraftVariation.icaoTypeDesignator', 1),
    },
    {
      headerName: 'Make',
      field: 'aircraftVariation.make',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'Make',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aircraftVariation.make', 1),
    },
    {
      headerName: 'Model',
      field: 'aircraftVariation.model',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      headerTooltip: 'Model',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aircraftVariation.model', 1),
    },
    {
      headerName: 'MTOW',
      field: 'airframeWeightAndLength.maxTakeOffWeight',
      headerTooltip: 'Max Take Off Weight(MTOW)',
    },
    {
      headerName: 'Verified',
      field: 'isVerified',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
      headerTooltip: 'Verified',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus,
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
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airframe',
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => false,
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
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
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={aircraftModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Airframe"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(AIRFRAME_FILTERS, AIRFRAME_FILTERS.SERIAL_NUMBER) ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        onExpandCollapse={agGrid.autoSizeColumns}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
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

export default inject('airframeStore', 'sidebarStore')(observer(Airframe));
