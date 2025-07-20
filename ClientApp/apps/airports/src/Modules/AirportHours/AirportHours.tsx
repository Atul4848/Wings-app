import { withStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GridPagination,
  GRID_ACTIONS,
  IAPIGridRequest,
  IBaseGridFilterSetup,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import { BaseGrid } from '@wings-shared/custom-ag-grid';
import { SearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { AirportModel, AuditHistory, baseApiPath } from '@wings/shared';
import { FilterModifiedEvent, GridOptions, SortChangedEvent } from 'ag-grid-community';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  AirportHoursModel,
  AirportHoursStore,
  AirportModuleSecurity,
  AirportSettingsStore,
  airportSidebarOptions,
  AIRPORT_AUDIT_MODULES,
  AIRPORT_HOUR_FILTERS,
} from '../Shared';
import { styles } from './AirportHours.styles';
import { CommonAirportHoursGrid } from './Components';
import { airportHoursGridFilters } from './fields';

interface Props {
  classes?: IClasses;
  airportHoursStore?: AirportHoursStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const filterSetup: IBaseGridFilterSetup<AIRPORT_HOUR_FILTERS> = {
  defaultPlaceHolder: 'Search by ICAO',
  defaultFilterType: AIRPORT_HOUR_FILTERS.ICAO,
  filterTypesOptions: Object.values(AIRPORT_HOUR_FILTERS),
  apiFilterDictionary: airportHoursGridFilters,
};

@inject('airportHoursStore', 'airportSettingsStore', 'sidebarStore')
@observer
class AirportHours extends BaseGrid<Props, AirportHoursModel, AIRPORT_HOUR_FILTERS> {
  constructor(props) {
    super(props, filterSetup);
  }

  componentDidMount() {
    const { searchTypeOption, searchValue } = this.airportHoursStore;
    if (searchTypeOption) {
      this.selectedOption = searchTypeOption;
    }
    if (searchValue) {
      this.searchValue = searchValue;
      this.searchHeaderRef.current?.setSearchValue(searchValue);
    }
    this.loadAirportHours();
    this.props.sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    this.onAdvanceSearch$().subscribe(() => this.loadAirportHours());
    this.setMiniFilterTextDebounce();
  }

  private get airportHoursStore(): AirportHoursStore {
    return this.props.airportHoursStore as AirportHoursStore;
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  private get isChipInputControl(): boolean {
    if (Utilities.isEqual(AIRPORT_HOUR_FILTERS.ICAO, this.selectedOption)) {
      return false;
    }
    return !Boolean(this.gridAdvancedSearchFilters.length);
  }

  /* istanbul ignore next */
  protected get _searchFilters(): IAPIGridRequest {
    const property = this.filterSetup.apiFilterDictionary?.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as AIRPORT_HOUR_FILTERS, this.selectedOption)
    );
    if (!property) {
      return {};
    }

    if (Utilities.isEqual(AIRPORT_HOUR_FILTERS.ICAO, this.selectedOption) && this.searchValue) {
      return {
        searchCollection: JSON.stringify([ Utilities.getFilter(property.apiPropertyName, this.searchValue as string) ]),
      };
    }

    // If Chips are empty or search type is not ICAO then
    if (!this.airportHoursStore.searchChips) {
      return {};
    }

    const searchCollection = this.airportHoursStore.searchChips.map((_searchValue, index) => {
      const operator = Boolean(index) ? 'or' : 'and';
      const filterValue = Utilities.isEqual(property.apiPropertyName, 'Airport.DisplayCode')
        ? (_searchValue.value as string)
        : _searchValue.label;
      return Utilities.getFilter(property.apiPropertyName, filterValue, operator);
    });

    return { searchCollection: JSON.stringify(searchCollection) };
  }

  /* istanbul ignore next */
  // return options based on the filter
  private get searchFilterOptions(): ISelectOption[] {
    switch (this.selectedOption) {
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE:
        return this.airportSettingsStore.airportHourTypes;
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_SUB_TYPE:
        return this.airportSettingsStore.airportHourSubTypes;
      case AIRPORT_HOUR_FILTERS.AIRPORT_CODE:
        return this.airportHoursStore.wingsAirports;
      default:
        return [];
    }
  }

  @action
  private onChipAddOrRemove(searchChips: ISelectOption[]): void {
    this.airportHoursStore.searchChips = searchChips;
    if (!this.gridApi) {
      return;
    }
    if (!searchChips.length) {
      this.airportHoursStore.wingsAirports = [];
    }
    this.gridApi.onFilterChanged();
  }

  /* istanbul ignore next */
  private onSearchTypeChange(option: AIRPORT_HOUR_FILTERS): void {
    this.searchValue = '';
    this.airportHoursStore.searchValue = '';
    this.selectedOption = option;
    this.airportHoursStore.searchTypeOption = option;

    // Reset selected search chip values
    if (this.airportHoursStore.searchChips.length) {
      this.onChipAddOrRemove([]);
    }
    this.onSearch();
  }

  // Fetch DATA from API based on Search Filter
  /* istanbul ignore next */
  private onSearch(searchValue: string = '') {
    let observableOf;
    switch (this.selectedOption) {
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_TYPE:
        observableOf = this.airportSettingsStore.loadAirportHourTypes();
        break;
      case AIRPORT_HOUR_FILTERS.AIRPORT_HOURS_SUB_TYPE:
        observableOf = this.airportSettingsStore.loadAirportHourSubTypes();
        break;
      case AIRPORT_HOUR_FILTERS.AIRPORT_CODE:
        this.loadAirportHours();
        this.airportHoursStore.tfoAirports = [];
        observableOf = this.airportHoursStore.searchWingsAirportsByCode(searchValue, {
          excludeRetail: true,
          includeInactive: true,
        });
        break;
      case AIRPORT_HOUR_FILTERS.ICAO:
        this.searchValue = searchValue;
        this.airportHoursStore.searchValue = searchValue;
        this.loadAirportHours();
        break;
      default:
        break;
    }
    // If observable available then perform search
    if (observableOf) {
      UIStore.setPageLoader(true);
      observableOf
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe();
    }
  }

  /* istanbul ignore next */
  private loadAirportHours(pageRequest?: IAPIGridRequest): void {
    const request: IAPIGridRequest = {
      pageSize: this.pagination.pageSize,
      ...pageRequest,
      ...this._searchFilters,
      ...this._sortFilters,
      ...this._gridAPIAdvancedFilterCollection,
      ...this._gridAPIAdvancedSearchCollection,
    };
    UIStore.setPageLoader(true);
    this.airportHoursStore
      .loadAirportHours(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.data = response.results;
          this.pagination = new GridPagination({ ...response });
          this.gridAdvancedSearchFilterApplied();
        },
      });
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AirportHoursModel = this._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.airport?.label || model.icao}
          entityId={model.id}
          entityType={AIRPORT_AUDIT_MODULES.AIRPORT_HOURS}
          baseUrl={baseApiPath.airports}
        />
      );
    }
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: [],
      isEditable: false,
      gridActionProps: {
        tooltip: 'Airport Hours',
        getDisabledState: () => this.hasError,
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      isExternalFilterPresent: () => false,
      onFilterChanged: () => this.gridAdvancedSearchFilters.length === 0 && this.loadAirportHours(),
      onFilterModified: (filterModified: FilterModifiedEvent) => this.onGridApiFilterModified(filterModified),
      onSortChanged: ({ api }: SortChangedEvent) => {
        this.sortFilters = api.getSortModel() as any;
        this.loadAirportHours();
      },
    };
  }

  private get rightContent(): ReactNode {
    return (
      <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="/airports/airport-hours/new"
          title="Add Hours"
        />
      </ViewPermission>
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          ref={this.searchHeaderRef}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          isChipInputControl={this.isChipInputControl}
          isLoading={this.loader.isLoading}
          isDisabled={Boolean(this.gridAdvancedSearchFilters.length)}
          chipValue={this.airportHoursStore.searchChips}
          onSearchTypeChange={option => this.onSearchTypeChange(option as AIRPORT_HOUR_FILTERS)}
          options={this.searchFilterOptions}
          onSearch={(searchValue: string) => this.onSearch(searchValue)}
          onChipAddOrRemove={this.onChipAddOrRemove.bind(this)}
          rightContent={this.rightContent}
          expandCollapse={() => this.autoSizeColumns()}
          onResetFilterClick={() => this.onFilterResetClickHandler()}
          getChipLabel={option => (option as AirportModel)?.displayCode || option.label}
          getOptionLabel={option => (option as AirportModel)?.displayCode || option.label}
        />
        <CommonAirportHoursGrid
          rowData={this.data}
          auditFields={this.auditFieldsWithAdvanceFilter}
          gridOptions={this.gridOptions}
          serverPagination={true}
          paginationData={this.pagination}
          onPaginationChange={request => this.loadAirportHours(request)}
          onAction={(action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex)}
          nameSearchFilterParams={this.nameSearchFilterParams.bind(this)}
        />
      </>
    );
  }
}

export default withStyles(styles)(AirportHours);
