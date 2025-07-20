import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GridPagination,
  GRID_ACTIONS,
  IAPIGridRequest,
  UIStore,
  Utilities,
  ViewPermission,
  ISelectOption
} from '@wings-shared/core';
import { agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { AirportModel, AuditHistory, baseApiPath } from '@wings/shared';
import { GridOptions } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportHoursModel,
  AirportHoursStore,
  AirportSettingsStore,
  airportSidebarOptions,
  AIRPORT_AUDIT_MODULES,
  AIRPORT_HOUR_FILTERS,
  useAirportModuleSecurity,
} from '../Shared';
import { airportHoursGridFilters } from './fields';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CommonAirportHoursGrid } from './Components';

interface Props {
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportHours: FC<Props> = ({ airportHoursStore, airportSettingsStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<AIRPORT_HOUR_FILTERS, AirportHoursModel>(airportHoursGridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const [ entityOptions, setEntityOptions ] = useState([]);
  const isICAOFilter = Utilities.isEqual(searchHeader.searchType, AIRPORT_HOUR_FILTERS.ICAO);
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAirportHours());
    searchHeader.restoreSearchFilters(gridState, () => loadAirportHours());
  }, []);

  /* istanbul ignore next */
  const _searchFilters = (): IAPIGridRequest => {
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
    const _searchChips = searchHeader.getFilters().chipValue as ISelectOption[];
    const _searchValue = searchHeader.getFilters().searchValue;
    const _value = Utilities.isEqual(_selectedOption, AIRPORT_HOUR_FILTERS.ICAO)
      ? _searchValue
      : _searchChips.map(x =>
        Utilities.isEqual(_selectedOption, AIRPORT_HOUR_FILTERS.AIRPORT_CODE) ? x.value : x.label
      );

    if (!_value) {
      return {};
    }
    return {
      ...agGrid.filtersApi.getSearchFilters(_value, _selectedOption),
    };
  };

  // load dropdown options for search header select control
  /* istanbul ignore next */
  const onSearchEntity = searchValue => {
    if (searchHeader.searchType === AIRPORT_HOUR_FILTERS.ICAO) {
      loadAirportHours({ pageNumber: 1 });
    }
    let observableOf;
    switch (searchHeader.searchType) {
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE:
        observableOf = _airportSettingsStore.loadAirportHourTypes();
        break;
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_SUB_TYPE:
        observableOf = _airportSettingsStore.loadAirportHourSubTypes();
        break;
      case AIRPORT_HOUR_FILTERS.AIRPORT_CODE:
        if (!searchValue) {
          setEntityOptions([]);
          return;
        }
        observableOf = _airportHoursStore.searchWingsAirportsByCode(searchValue, {
          excludeRetail: true,
          includeInactive: true,
        });
        break;
      default:
        break;
    }
    if (observableOf) {
      UIStore.setPageLoader(true);
      observableOf
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(response => setEntityOptions(response));
    }
  };

  /* istanbul ignore next */
  const loadAirportHours = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ..._searchFilters(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _airportHoursStore
      .loadAirportHours(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results);
          gridState.setPagination(new GridPagination({ ...response }));
          agGrid.filtersApi.gridAdvancedSearchFilterApplied();
        },
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.AUDIT:
        const model: AirportHoursModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.airport?.label || model.icao}
            entityId={model.id}
            entityType={AIRPORT_AUDIT_MODULES.AIRPORT_HOURS}
            baseUrl={baseApiPath.airports}
          />
        );
        break;
      case GRID_ACTIONS.DETAILS:
      case GRID_ACTIONS.EDIT:
      case GRID_ACTIONS.VIEW:
        searchHeader.saveSearchFilters(gridState);
        break;
    }
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: [],
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Hours',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      onFilterChanged: (e) => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs()
          return
        }
        loadAirportHours()
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAirportHours();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="/airports/airport-hours/new"
          title="Add Hours"
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_HOUR_FILTERS, AIRPORT_HOUR_FILTERS.ICAO) ]}
        isChipInputControl={!isICAOFilter}
        chipInputProps={{
          options: entityOptions,
          allowOnlySingleSelect: false,
          getChipLabel: option => (option as AirportModel)?.displayCode || option.label,
          getOptionLabel: option => (option as AirportModel)?.displayCode || option.label,
          onFocus: () => onSearchEntity(''),
        }}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onSearch={onSearchEntity}
        onFiltersChanged={loadAirportHours}
        onSelectionChange={(fieldKey, updatedValue) => {
          setEntityOptions([]);
          searchHeader.onSelectionChange(fieldKey, updatedValue);
        }}
        isLoading={UIStore.pageLoading}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
      />
      <CommonAirportHoursGrid
        rowData={gridState.data}
        auditFields={agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing)}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadAirportHours}
        onAction={gridActions}
        nameSearchFilterParams={agGrid.filtersApi.getAdvanceFilterParams}
        airportSettingsStore={_airportSettingsStore}
      />
    </>
  );
};

export default inject('airportHoursStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportHours));
