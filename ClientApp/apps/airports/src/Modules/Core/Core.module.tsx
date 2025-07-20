import {
  ColDef,
  FilterModifiedEvent,
  GridOptions,
  RowNode,
  SortChangedEvent,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { Button, withStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import AirportLocationIcon from '@material-ui/icons/LocationOnOutlined';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuditHistory, baseApiPath, VIEW_MODE } from '@wings/shared';
import {
  AIRPORT_AUDIT_MODULES,
  AIRPORT_FILTERS,
  AirportModel,
  AirportModuleSecurity,
  updatedAirportSidebarOptions,
} from '../Shared';
import { AirportStore } from '../Shared/Stores';
import { styles } from './Core.module.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import { gridFilters, specifiedFields } from './fields';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
  IGridSortFilter,
} from '@wings-shared/core';
import { MapBoxView } from '@wings-shared/mapbox';
import { SearchHeader } from '@wings-shared/form-controls';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import {
  AgColumnHeader,
  AgGridViewRenderer,
  AgGridActions,
  AgGridGroupHeader,
  BaseGrid,
  CustomAgGridReact,
  AgGridStatusBadge,
} from '@wings-shared/custom-ag-grid';
import { IMarker } from '@wings-shared/mapbox/dist/Interfaces';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
  classes?: IClasses;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_FILTERS> = {
  defaultPlaceHolder: 'Search by All',
  apiFilterDictionary: gridFilters,
  filterTypesOptions: Object.values(AIRPORT_FILTERS),
  defaultFilterType: AIRPORT_FILTERS.ALL,
};

@inject('airportStore', 'sidebarStore')
@observer
class CoreModule extends BaseGrid<Props, AirportModel, AIRPORT_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
    this.selectedOption = AIRPORT_FILTERS.ALL;
  }

  componentDidMount() {
   this.props.sidebarStore?.setNavLinks(updatedAirportSidebarOptions('', window.location.search),'/airports');
   this.loadAirports();
   this.onAdvanceSearch$().subscribe(() => this.loadAirports());
   this.setMiniFilterTextDebounce();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    const { clientSearchValue } = SearchStore;
    if (clientSearchValue.searchValue) {
      return;
    }
    SearchStore.clearSearch();
  }

  /* istanbul ignore next */
  @action
  private loadAirports(pageRequest?: IAPIGridRequest): void {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: this.pagination.pageSize,
      ...pageRequest,
      specifiedFields,
      ...this._searchFilters,
      ...this._sortFilters,
      ...this._gridAPIAdvancedFilterCollection,
      ...this._gridAPIAdvancedSearchCollection,
    };
    if (this.searchValue && this.selectedOption === AIRPORT_FILTERS.ALL) {
      const searchCollection = gridFilters.map((x, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return { propertyName: x.apiPropertyName, propertyValue: this.searchValue, ...operator };
      });
      request.searchCollection = JSON.stringify(searchCollection);
    }

    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.getAirports(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        this.pagination = new GridPagination({ ...response });
        this.data = response.results;
        this.gridAdvancedSearchFilterApplied();
        const { clientSearchValue } = SearchStore;
        const { selectedOption, searchValue } = clientSearchValue;
        if (searchValue) {
          this._setSelectedOption((selectedOption as AIRPORT_FILTERS) || AIRPORT_FILTERS.ICAO);
          this._setSearchValue(searchValue);
          this.searchHeaderRef.current?.setSearchValue(searchValue);
          SearchStore.clearSearch();
          return;
        }
        SearchStore.clearSearch();
      });
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (this.searchValue) {
      const clientSearchValue = { selectedOption: this.selectedOption, searchValue: this.searchValue as string };
      SearchStore.setclientSearchValue(clientSearchValue);
    }
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AirportModel = this._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.title}
          entityId={model.id}
          entityType={AIRPORT_AUDIT_MODULES.AIRPORT}
          baseUrl={baseApiPath.airports}
        />
      );
    }
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO',
      field: 'icaoCode.code',
      width: 250,
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'icaoCode.code', 2) },
    },
    {
      headerName: 'UWA',
      headerTooltip: 'UWA',
      field: 'uwaAirportCode.code',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'uwaAirportCode.code', 2) },
    },
    {
      headerName: 'IATA',
      headerTooltip: 'IATA',
      field: 'iataCode',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'iataCode', 2) },
    },
    {
      headerName: 'FAA Code',
      headerTooltip: 'FAA Code',
      field: 'faaCode',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'faaCode', 2) },
    },
    {
      headerName: 'Regional Code',
      headerTooltip: 'Regional Code',
      field: 'regionalAirportCode.code',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'regionalAirportCode.code', 2) },
    },
    {
      headerName: 'Source Location ID',
      headerTooltip: 'Source Location ID',
      field: 'sourceLocationId',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'sourceLocationId', 2) },
    },
    {
      headerName: 'Name',
      headerTooltip: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'name', 2) },
    },
    {
      headerName: 'CAPPS Airport Name',
      headerTooltip: 'CAPPS Airport Name',
      field: 'cappsAirportName',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'cappsAirportName', 2) },
    },
    {
      headerName: 'City',
      headerTooltip: 'City',
      field: 'airportLocation.city',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'airportLocation.city', 2) },
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'State',
      headerTooltip: 'State',
      field: 'airportLocation.state',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'airportLocation.state', 2) },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Country',
      headerTooltip: 'Country',
      field: 'airportLocation.country',
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'airportLocation.country', 2) },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Status',
      headerTooltip: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      filter: 'agTextColumnFilter',
      filterParams: { ...this.nameSearchFilterParams('contains', 'status', 2) },
    },
    ...this.auditFieldsWithAdvanceFilter,
    {
      headerName: 'View Location',
      field: 'latitude',
      cellRenderer: 'viewRenderer',
      minWidth: 110,
      maxWidth: 120,
      suppressMenu: true,
      filter: false,
      sortable: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <Button
            disabled={!data.latitudeCoordinate?.latitude || !data.longitudeCoordinate?.longitude}
            onClick={() => this.openMapViewDialog(data)}
            style={{ height: '100%' }}
          >
            <AirportLocationIcon color="primary"/>
          </Button>
        ),
      },
    },
    {
      headerName: '',
      maxWidth: 120,
      minWidth: 120,
      suppressAutoSize: true,
      suppressMenu: true,
      suppressMovable: true,
      editable: false,
      cellRenderer: 'actionRenderer',
      suppressSizeToFit: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  private openMapViewDialog(model: AirportModel): void {
    const title: string = `${model.name} (LAT: ${model.latitudeCoordinate?.latitude},  LON: ${model.longitudeCoordinate?.longitude})`;
    ModalStore.open(
      <Dialog
        title={title}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <MapBoxView
            marker={
              {
                title,
                latitude: model.latitudeCoordinate?.latitude,
                longitude: model.longitudeCoordinate?.longitude,
              } as IMarker
            }
          />
        )}
        dialogActions={() => (
          <PrimaryButton variant="outlined" onClick={() => ModalStore.close()}>
            Close
          </PrimaryButton>
        )}
      />
    );
  }

  /* istanbul ignore next */
  // airport url without or without icao
  private getAirportUrl = (model: AirportModel, action: VIEW_MODE) => {
    // const { icaoCode, uwaCode, regionalCode, faaCode, iataCode } = model;
    // const code = icaoCode?.code || uwaCode || regionalCode || iataCode || faaCode;
    return `upsert/${model.id}/${model.displayCode}/${action.toLocaleLowerCase()}`;
  };

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      gridActionProps: {
        isActionMenu: true,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
        actionMenus: rowNode => [
          {
            title: 'Edit',
            isHidden: !rowNode.data?.isActive || !AirportModuleSecurity.isEditable,
            action: GRID_ACTIONS.EDIT,
            to: node => this.getAirportUrl(node.data, VIEW_MODE.EDIT),
          },
          {
            title: 'Details',
            action: GRID_ACTIONS.VIEW,
            to: node => this.getAirportUrl(node.data, VIEW_MODE.DETAILS),
          },
          {
            title: 'View Hours Details',
            action: GRID_ACTIONS.VIEW,
            to: node => `${this.getAirportUrl(node.data, VIEW_MODE.DETAILS)}/airport-hours`,
          },
          { title: 'Audit', action: GRID_ACTIONS.AUDIT },
        ],
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
        agColumnHeader: AgColumnHeader,
        viewRenderer: AgGridViewRenderer,
        statusRenderer: AgGridStatusBadge,
      },
      onFilterChanged: () => this.gridAdvancedSearchFilters.length === 0 && this.loadAirports(),
      onFilterModified: (filterModified: FilterModifiedEvent) => this.onGridApiFilterModified(filterModified),
      onSortChanged: ({ api }: SortChangedEvent) => {
        this.sortFilters = api.getSortModel() as IGridSortFilter[];
        this.loadAirports();
      },
    };
  }

  /* istanbul ignore next */
  private get rightContent(): ReactNode {
    return (
      <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="upsert/new" title="Add Airport" />
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
          onSearchTypeChange={option => this._setSelectedOption(option as AIRPORT_FILTERS)}
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
          onPaginationChange={request => this.loadAirports(request)}
        />
      </>
    );
  }
}

export default withStyles(styles)(CoreModule);
