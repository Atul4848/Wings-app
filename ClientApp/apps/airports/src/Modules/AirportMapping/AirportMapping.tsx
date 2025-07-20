import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { GridOptions, ColDef, ValueFormatterParams, SortChangedEvent, FilterModifiedEvent } from 'ag-grid-community';
import { action, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withStyles, Theme } from '@material-ui/core';
import { styles } from './AirportMapping.styles';
import { AirportMappingsModel, AirportMappingStore, AIRPORT_MAPPING_FILTERS, AirportModuleSecurity } from '../Shared';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import UpsertAirportMapping from './Components/UpsertAirportMapping';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AddCircleOutline as AddIcon } from '@material-ui/icons';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { gridFilters } from './fields';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  UIStore,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  IGridSortFilter,
} from '@wings-shared/core';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { BaseGrid, CustomAgGridReact } from '@wings-shared/custom-ag-grid';

interface Props {
  classes?: IClasses;
  airportMappingsStore?: AirportMappingStore;
  theme?: Theme;
}

const filterSetup: IBaseGridFilterSetup<AIRPORT_MAPPING_FILTERS> = {
  defaultPlaceHolder: 'Search by ICAO',
  apiFilterDictionary: gridFilters,
  defaultFilterType: AIRPORT_MAPPING_FILTERS.ICAO,
  filterTypesOptions: Object.values(AIRPORT_MAPPING_FILTERS),
};

@inject('airportMappingsStore')
@observer
class AirportMapping extends BaseGrid<Props, AirportMappingsModel, AIRPORT_MAPPING_FILTERS> {
  constructor(props) {
    super(props, filterSetup);
    this.selectedOption = AIRPORT_MAPPING_FILTERS.ICAO;
  }

  componentDidMount() {
    this.loadAirportMapping();
    this.onAdvanceSearch$().subscribe(() => this.loadAirportMapping());
    this.setMiniFilterTextDebounce();
  }

  /* istanbul ignore next */
  private loadAirportMapping(pageRequest?: IAPIGridRequest): void {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: this.pagination.pageSize,
      ...pageRequest,
      ...this._searchFilters,
      ...this._sortFilters,
      ...this._gridAPIAdvancedFilterCollection,
      ...this._gridAPIAdvancedSearchCollection,
    };

    UIStore.setPageLoader(true);
    this.props.airportMappingsStore
      ?.loadAirportMappings(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        this.pagination = new GridPagination({ ...response });
        this.data = response.results;
        this.gridAdvancedSearchFilterApplied();
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'UV ICAO',
      field: 'icao',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'icao', 2) },
    },
    {
      headerName: 'NAVBLUE Airport Code',
      field: 'navblueCode',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value ?? '-',
      filterParams: { ...this.nameSearchFilterParams('contains', 'navblueCode', 2) },
    },
    {
      headerName: 'APG Airport Code',
      field: 'apgCode',
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }: ValueFormatterParams) => value ?? '-',
      filterParams: { ...this.nameSearchFilterParams('contains', 'apgCode', 2) },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      hide: !AirportModuleSecurity.isEditable,
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', action: GRID_ACTIONS.EDIT },
          { title: 'Delete', action: GRID_ACTIONS.DELETE },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          this.gridActions(action, rowIndex);
        },
      },
    },
  ];

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }

    const mapping = this._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      this.openUpsertDialog(VIEW_MODE.EDIT, mapping);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Delete Mapping"
          message="Are you sure you want to delete this Record?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => this.deleteMapping(mapping)}
        />
      );
    }
  }

  private openUpsertDialog(mode: VIEW_MODE, mapping?: AirportMappingsModel): void {
    const { airportMappingsStore } = this.props;
    ModalStore.open(
      <UpsertAirportMapping
        viewMode={mode}
        airportMappingsStore={airportMappingsStore}
        upsertMapping={(response: AirportMappingsModel) => this.upsertMapping(response)}
        airportMappingsModel={mapping}
      />
    );
  }

  /* istanbul ignore next */
  @action
  private deleteMapping(mapping: AirportMappingsModel): void {
    const { airportMappingsStore } = this.props;
    airportMappingsStore
      ?.removeAirportMapping(mapping?.icao)
      .pipe(
        switchMap(() => airportMappingsStore.loadAirportMappings(this.pagination)),
        takeUntil(this.destroy$),
        finalize(() => {
          ModalStore.close();
        })
      )
      .subscribe(
        response => {
          runInAction(() => {
            this.pagination = new GridPagination({ ...response });
            this.data = response.results;
            this.gridAdvancedSearchFilterApplied();
          });
        },
        _error => (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  /* istanbul ignore next */
  @action
  private upsertMapping(mapping: AirportMappingsModel): void {
    const { airportMappingsStore } = this.props;
    airportMappingsStore
      ?.upsertAirportMapping(mapping)
      .pipe(
        switchMap(() => airportMappingsStore.loadAirportMappings(this.pagination)),
        takeUntil(this.destroy$),
        finalize(() => {
          ModalStore.close();
        })
      )
      .subscribe(
        response => {
          runInAction(() => {
            this.pagination = new GridPagination({ ...response });
            this.data = response.results;
            this.gridAdvancedSearchFilterApplied();
          });
        },
        _error => (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: false,
      gridActionProps: {
        getDisabledState: () => this.hasError,
        onAction: () => {},
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      onFilterChanged: () => this.gridAdvancedSearchFilters.length === 0 && this.loadAirportMapping(),
      onFilterModified: (filterModified: FilterModifiedEvent) => this.onGridApiFilterModified(filterModified),
      onSortChanged: ({ api }: SortChangedEvent) => {
        this.sortFilters = api.getSortModel() as IGridSortFilter[];
        this.loadAirportMapping();
      },
    };
  }

  /* istanbul ignore next */
  private get rightContent(): ReactNode {
    if (!AirportModuleSecurity.isEditable) {
      return null;
    }
    return (
      <CustomLinkButton
        variant="contained"
        to=""
        onClick={() => this.openUpsertDialog(VIEW_MODE.NEW, new AirportMappingsModel())}
        startIcon={<AddIcon />}
        title="Add Airport Mapping"
      />
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          ref={this.searchHeaderRef}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={option => this._setSelectedOption(option as AIRPORT_MAPPING_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          onResetFilterClick={() => this.onFilterResetClickHandler()}
          rightContent={this.rightContent}
          isDisabled={Boolean(this.gridAdvancedSearchFilters.length)}
          expandCollapse={() => this.autoSizeColumns()}
        />
        <CustomAgGridReact
          isRowEditing={this.isRowEditing}
          rowData={this.data}
          gridOptions={this.gridOptions}
          serverPagination={true}
          paginationData={this.pagination}
          onPaginationChange={request => this.loadAirportMapping(request)}
          rowsPerPageOptions={[ 10, 20, 30, 50 ]}
        />
      </>
    );
  }
}

export default withStyles(styles)(AirportMapping);
export { AirportMapping as PureAirportMapping };
