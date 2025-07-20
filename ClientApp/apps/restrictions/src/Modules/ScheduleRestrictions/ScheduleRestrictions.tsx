import React, { ReactNode, FC, useEffect } from 'react';
import { ModelStatusOptions, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  ScheduleRestrictionsStore,
  ScheduleRestrictionsModel,
  SCHEDULE_RESTRICTIONS_FILTERS,
  updateRestrictionSidebarOptions,
  useRestrictionModuleSecurity,
} from '../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { gridFilters } from './fields';
import {
  DATE_FORMAT,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  GRID_ACTIONS,
  cellStyle,
  StatusTypeModel,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { observable } from 'mobx';

interface Props {
  viewMode?: VIEW_MODE;
  scheduleRestrictionsStore?: ScheduleRestrictionsStore;
  classes?: IClasses;
  sidebarStore?: typeof SidebarStore;
}

const ScheduleRestrictions: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<SCHEDULE_RESTRICTIONS_FILTERS, ScheduleRestrictionsModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  /* eslint-disable max-len */
  const _scheduleRestrictionsStore = props.scheduleRestrictionsStore as ScheduleRestrictionsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const scheduleStatusFilter = observable({
    isStatusFilter: Utilities.isEqual(searchHeader.searchType, SCHEDULE_RESTRICTIONS_FILTERS.STATUS),
  });

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateRestrictionSidebarOptions('Schedule Restrictions'), 'restrictions');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadScheduleRestrictions());
    loadScheduleRestrictions();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadScheduleRestrictions());
  }, []);

  /* istanbul ignore next */
  const isStatusFilter = () =>
    Utilities.isEqual(
      searchHeader.getFilters().selectInputsValues.get('defaultOption'),
      SCHEDULE_RESTRICTIONS_FILTERS.STATUS
    );

  /* istanbul ignore next */
  const __searchFilters = (): IAPIGridRequest => {
    const chip = searchHeader.getFilters().chipValue?.valueOf() as StatusTypeModel[];
    if (isStatusFilter() && chip?.length) {
      return {
        filterCollection: JSON.stringify([{ propertyName: 'Status.Name', propertyValue: chip[0]?.name || '' }]),
      };
    }
    return agGrid.filtersApi.getSearchFilters(
      searchHeader.getFilters().searchValue || '',
      searchHeader.getFilters().selectInputsValues.get('defaultOption')
    );
  };

  /* istanbul ignore next */
  const loadScheduleRestrictions = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...__searchFilters(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _scheduleRestrictionsStore
      .getScheduleRestrictions(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Restriction Type',
      field: 'restrictionType',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('restrictionType', 2),
    },
    {
      headerName: 'Restricting Entity',
      field: 'restrictingEntities',
      cellRenderer: 'agGridChipView',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('restrictingEntities', 2),
      cellRendererParams: {
        tooltipField: 'entityName',
      },
    },
    {
      headerName: 'Departure Level',
      field: 'departureLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('departureLevel', 2),
    },
    {
      headerName: 'Departure Entity',
      field: 'departureLevelEntities',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        tooltipField: 'entityName',
      },
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('departureLevelEntities', 2),
    },
    {
      headerName: 'Arrival Level',
      field: 'arrivalLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('arrivalLevel', 2),
    },
    {
      headerName: 'Arrival Entity',
      field: 'arrivalLevelEntities',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        tooltipField: 'entityName',
      },
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('arrivalLevelEntities', 2),
    },
    {
      headerName: 'Overflight Level',
      field: 'overFlightLevel',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('overFlightLevel', 2),
    },
    {
      headerName: 'Overflight Entity',
      field: 'overFlightLevelEntities',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        tooltipField: 'entityName',
      },
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('overFlightLevelEntities', 2),
    },
    {
      headerName: 'Far Types',
      field: 'farTypes',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        tooltipField: 'entityName',
      },
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('farTypes', 2),
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 2, 'start'),
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'other details',
      groupId: 'otherDetails',
      suppressMenu: true,
      children: [
        {
          headerName: 'Start Date',
          field: 'startDate',
          headerComponent: 'customHeader',
          comparator: (current, next) => Utilities.customDateComparator(current, next),
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
        },
        {
          headerName: 'End Date',
          field: 'endDate',
          columnGroupShow: 'open',
          comparator: (current, next) => Utilities.customDateComparator(current, next),
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
        },
        {
          headerName: 'Validated Date',
          field: 'validatedDate',
          columnGroupShow: 'open',
          comparator: (current, next) => Utilities.customDateComparator(current, next),
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
        },
        {
          headerName: 'Validated By',
          field: 'validatedBy',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('validatedBy', 2),
        },
        {
          headerName: 'Validation Notes',
          field: 'validationNotes',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          filterParams: agGrid.filtersApi.getAdvanceFilterParams('validationNotes', 2),
        },
      ],
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS) => {
            if (searchHeader.getFilters().searchValue) {
              searchHeader.saveSearchFilters(gridState);
            }
          },
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !restrictionModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `${node.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.VIEW,
              to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
            },
          ],
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
        cellRendererParams: {
          ...baseOptions.defaultColDef?.cellRendererParams,
          chipLabelField: 'code',
        },
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
        loadScheduleRestrictions();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadScheduleRestrictions();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={restrictionModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Schedule Restriction" />
      </ViewPermission>
    );
  };

  /* istanbul ignore next */
  const _searchFilters = () => {
    scheduleStatusFilter.isStatusFilter = Utilities.isEqual(
      searchHeader.getFilters().selectInputsValues.get('defaultOption'),
      SCHEDULE_RESTRICTIONS_FILTERS.STATUS
    );
    loadScheduleRestrictions()
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(
            SCHEDULE_RESTRICTIONS_FILTERS,
            SCHEDULE_RESTRICTIONS_FILTERS.RESTRICTION_TYPE
          ),
        ]}
        onFiltersChanged={_searchFilters}
        onSearch={sv => loadScheduleRestrictions()}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        isChipInputControl={scheduleStatusFilter.isStatusFilter}
        chipInputProps={{
          options: ModelStatusOptions,
          allowOnlySingleSelect: true,
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadScheduleRestrictions}
      />
    </>
  );
};

export default inject('scheduleRestrictionsStore', 'sidebarStore')(observer(ScheduleRestrictions));
