import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  IClasses,
  SettingsTypeModel,
  ViewPermission,
  IAPIGridRequest,
  IAPIPageResponse,
  GridPagination,
} from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import {
  AIRCRAFT_VARIATION_FILTERS,
  AircraftVariationModel,
  AircraftVariationStore,
  AirframeStore,
  updateAircraftSidebarOptions,
  useAircraftModuleSecurity,
} from '../Shared';
import { VIEW_MODE } from '@wings/shared';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { aircraftVariationGridFilters } from './fields';

interface Props {
  classes?: IClasses;
  aircraftVariationStore?: AircraftVariationStore;
  airframeStore?: AirframeStore;
  sidebarStore?: typeof SidebarStore;
}

const AircraftVariation: FC<Props> = ({ aircraftVariationStore, sidebarStore, airframeStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRCRAFT_VARIATION_FILTERS, AircraftVariationModel>(aircraftVariationGridFilters, gridState);
  const _aircraftVariationStore = aircraftVariationStore as AircraftVariationStore;
  const _airframeStore = airframeStore as AirframeStore;
  const _useConfirmDialog = useConfirmDialog();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Aircraft Variation'), 'aircraft');
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
    _aircraftVariationStore
      .getAircraftVariations(request)
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
      headerName: 'Popular Names',
      field: 'popularNames',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('popularNames', 2),
      cellRenderer: 'agGridChipView',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      filterValueGetter: ({ data }: ValueGetterParams) => data.popularNames?.map(v => v.label).join(', ') || '',
    },
    {
      headerName: 'Make',
      field: 'make',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('make', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.make.name,
    },
    {
      headerName: 'Model',
      field: 'model',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('model', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.model.name,
    },
    {
      headerName: 'Series',
      field: 'series',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('series', 1, 'start'),
      filterValueGetter: ({ data }: ValueGetterParams) => data.series.name,
    },
    {
      headerName: 'Engine Type',
      field: 'engineType',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('engineType', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.engineType.name,
    },
    {
      headerName: 'ICAO Type Designator',
      field: 'icaoTypeDesignator',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('icaoTypeDesignator', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.icaoTypeDesignator?.label,
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: !aircraftModuleSecurity.isEditable,
            action: GRID_ACTIONS.EDIT,
            to: node => `/aircraft/aircraft-variation/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Details',
            action: GRID_ACTIONS.DETAILS,
            to: node => `/aircraft/aircraft-variation/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
          },
          {
            title: 'Delete',
            isHidden: !aircraftModuleSecurity.isEditable,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (searchHeader.getFilters().searchValue) {
            searchHeader.saveSearchFilters(gridState);
          }
          if (Utilities.isEqual(action, GRID_ACTIONS.DELETE)) {
            const model: AircraftVariationModel = agGrid._getTableItem(rowIndex);
            UIStore.setPageLoader(true);
            _airframeStore
              .getAirframesNoSQL({
                filterCollection: JSON.stringify([
                  Utilities.getFilter('AircraftVariation.AircraftVariationId', model.id),
                ]),
              })
              .pipe(
                takeUntil(unsubscribe.destroy$),
                finalize(() => UIStore.setPageLoader(false))
              )
              .subscribe(response => {
                if (Boolean(response.results.length)) {
                  AlertStore.important(
                    'You can\'t delete this Aircraft Variation as it is associated with Airframe records.'
                  );
                  return;
                }
                confirmDeleteAction(rowIndex);
              });
          }
        },
      },
    },
  ];

  /* istanbul ignore next */
  const deleteAircraftVariationRecord = (model: AircraftVariationModel): void => {
    UIStore.setPageLoader(true);
    _aircraftVariationStore
      .deleteAircraftVariationRecord(model.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const confirmDeleteAction = (rowIndex: number): void => {
    const model: AircraftVariationModel = agGrid._getTableItem(rowIndex);
    _useConfirmDialog.confirmAction(
      () => {
        deleteAircraftVariationRecord(model), ModalStore.close();
      },
      {
        title: 'Confirm Delete',
        isDelete: true,
      }
    );
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropdownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Aircraft Variation',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
      },
      pagination: false,
      isExternalFilterPresent: () => false,
      onFilterChanged: e => {
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
          title="Add Aircraft Variation"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(AIRCRAFT_VARIATION_FILTERS, AIRCRAFT_VARIATION_FILTERS.POPULAR_NAME),
        ]}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadInitialData(request)}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('aircraftVariationStore', 'airframeStore', 'sidebarStore')(observer(AircraftVariation));
