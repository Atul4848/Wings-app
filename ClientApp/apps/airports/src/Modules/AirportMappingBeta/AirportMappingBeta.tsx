import React, { ReactNode } from 'react';
import { BaseAirportStore, AirportModel } from '@wings/shared';
import {
  GridOptions,
  ColDef,
  SortChangedEvent,
  FilterModifiedEvent,
  ICellEditorParams,
  ValueFormatterParams,
  EditableCallbackParams,
} from 'ag-grid-community';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './AirportMappingBeta.styles';
import {
  AirportFlightPlanInfoModel,
  AirportMappingsBetaModel,
  AirportModuleSecurity,
  AirportStore,
  AIRPORT_MAPPING_FILTERS,
} from '../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { gridFilters } from './fields';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  SelectOption,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
  IGridSortFilter,
} from '@wings-shared/core';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  BaseGrid,
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  AgGridAutoComplete,
} from '@wings-shared/custom-ag-grid';

interface Props {
  classes?: IClasses;
  airportStore?: AirportStore;
}

const filterSetup: IBaseGridFilterSetup<AIRPORT_MAPPING_FILTERS> = {
  defaultPlaceHolder: 'Search by ICAO',
  apiFilterDictionary: gridFilters,
  defaultFilterType: AIRPORT_MAPPING_FILTERS.ICAO,
  filterTypesOptions: Object.values(AIRPORT_MAPPING_FILTERS),
};

@inject('airportStore')
@observer
class AirportMappingBeta extends BaseGrid<Props, AirportMappingsBetaModel, AIRPORT_MAPPING_FILTERS> {
  private baseAirportStore = new BaseAirportStore();
  @observable private airports: Record<string, ISelectOption[]> = {
    icao: [],
    uwaCode: [],
    faaCode: [],
    regionalCode: [],
  };
  @observable private optionalColumns: string[] = [ 'uwaCode', 'regionalCode', 'faaCode', 'icaoCode' ];
  @observable private disabledColumns: string[] = [];
  @observable private airportId: number;

  constructor(props) {
    super(props, filterSetup);
    this.selectedOption = AIRPORT_MAPPING_FILTERS.ICAO;
  }

  componentDidMount() {
    this.loadAirportMapping();
  }

  /* istanbul ignore next */
  private get searchCollection(): IAPIGridRequest {
    let searchCollection = {};
    if (this._searchFilters?.searchCollection) {
      const result = JSON.parse(this._searchFilters?.searchCollection)[0];
      searchCollection = { [result['propertyName']]: { $regex: `(?i)^${result['propertyValue']}` } };
    }
    return searchCollection;
  }

  /* istanbul ignore next */
  private loadAirportMapping(pageRequest?: IAPIGridRequest): void {
    UIStore.setPageLoader(true);
    const request = {
      pageNumber: 1,
      pageSize: this.pagination.pageSize,
      queryFilter: JSON.stringify(this.searchCollection),
      ...pageRequest,
    };
    this.props.airportStore
      ?.loadAirportMappingsBeta(request)
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
  private searchAirports(key: string, propertyName: string, propertyValue: string): void {
    const airportRequest = {
      searchCollection: JSON.stringify([{ propertyName, propertyValue }]),
    };
    this.baseAirportStore
      .getWingsAirports(airportRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: airports => this.setAutoCompleteOptions(key, airports.results),
      });
  }

  /* istanbul ignore next */
  private setAutoCompleteOptions(key: string, response: AirportModel[]): void {
    this.airports = {
      ...this.airports,
      [key]: response.map(item => {
        return { label: key === 'icao' ? item[key].code : item[key], value: item.id };
      }),
    };
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'ICAO Code',
      field: 'icaoCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        getAutoCompleteOptions: () => this.airports['icao'],
        onSearch: value => this.searchAirports('icao', 'ICAOCode.Code', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => this.disabledColumns.includes('icaoCode'),
      },
    },
    {
      headerName: 'UWA Code',
      field: 'uwaCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value,
      cellEditorParams: {
        getAutoCompleteOptions: () => this.airports['uwaCode'],
        onSearch: value => this.searchAirports('uwaCode', 'UWACode', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => this.disabledColumns.includes('uwaCode'),
      },
    },
    {
      headerName: 'Regional Code',
      field: 'regionalCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value,
      cellEditorParams: {
        getAutoCompleteOptions: () => this.airports['regionalCode'],
        onSearch: value => this.searchAirports('regionalCode', 'RegionalCode', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => this.disabledColumns.includes('regionalCode'),
      },
    },
    {
      headerName: 'FAA Code',
      field: 'faaCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value,
      cellEditorParams: {
        getAutoCompleteOptions: () => this.airports['faaCode'],
        onSearch: value => this.searchAirports('faaCode', 'FAACode', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => this.disabledColumns.includes('faaCode'),
      },
    },
    {
      headerName: 'NAVBLUE Code',
      field: 'airportFlightPlanInfo.navBlueCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:3,4',
      },
    },
    {
      headerName: 'APG Code',
      field: 'airportFlightPlanInfo.apgCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:3,4',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
      hide: !AirportModuleSecurity.isEditable,
    },
  ];

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        this.disabledColumns = this.optionalColumns;
        this._startEditingCell(rowIndex, this.columnDefs[4].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        this.upsertAirportFlightPlanInfo(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  /* istanbul ignore next */
  private upsertAirportFlightPlanInfo(rowIndex: number): void {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    const request = new AirportFlightPlanInfoModel({ ...model.airportFlightPlanInfo, airportId: this.airportId });
    UIStore.setPageLoader(true);
    this.props.airportStore
      ?.upsertAirportFlightPlanInfo(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportFlightPlanInfoModel) => {
          this._updateTableItem(
            rowIndex,
            AirportMappingsBetaModel.deserialize({
              ...model,
              ...response,
              id: model.id,
              icaoCode: { code: model?.icaoCode?.label, id: model?.icaoCode?.value },
              airportFlightPlanInfo: { ...response },
            })
          );
        },
        error: error => {
          this._startEditingCell(rowIndex, this.columnDefs[4].field || '');
          AlertStore.critical(error.message);
        },
      });
  }

  // Called from Ag Grid Component
  /* istanbul ignore next */
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi) || !this.airportId;
  }

  // Called from Ag Grid Component
  /* istanbul ignore next */
  @action
  public onDropDownChange(params: ICellEditorParams, option: ISelectOption): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi) || !option?.value;
    if (option?.value) {
      this.airportId = Number(option.value);
      this.disabledColumns = this.optionalColumns.filter(item => !Utilities.isEqual(params.colDef.field || '', item));
      return;
    }
    this.disabledColumns = [];
  }

  private addNewType(): void {
    this.disabledColumns = [];
    const airportMappingsBeta = new AirportMappingsBetaModel({
      id: 0,
      airportFlightPlanInfo: new AirportFlightPlanInfoModel({ airportId: 0 }),
    });
    this._addNewItems([ airportMappingsBeta ], { startEditing: true, colKey: 'icaoCode' });
    this.hasError = true;
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: AirportModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => this.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
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
      onRowEditingStarted: node => {
        this._startEditingRow(node);
        this.airportId = node.data.airportFlightPlanInfo.airportId;
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customHeader: AgGridGroupHeader,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  private get rightContent(): ReactNode {
    return (
      <ViewPermission hasPermission={AirportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={this.isProcessing}
          onClick={() => this.addNewType()}
        >
          Add Airport Mapping
        </PrimaryButton>
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
          onSearchTypeChange={option => this._setSelectedOption(option as AIRPORT_MAPPING_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          onResetFilterClick={() => this.onFilterResetClickHandler()}
          isDisabled={Boolean(this.gridAdvancedSearchFilters.length)}
          expandCollapse={() => this.autoSizeColumns()}
          rightContent={this.rightContent}
        />
        <CustomAgGridReact
          isRowEditing={this.isRowEditing}
          rowData={this.data}
          gridOptions={this.gridOptions}
          serverPagination={true}
          disablePagination={this.isRowEditing}
          paginationData={this.pagination}
          onPaginationChange={request => this.loadAirportMapping(request)}
          rowsPerPageOptions={[ 10, 20, 30, 50 ]}
        />
      </>
    );
  }
}

export default withStyles(styles)(AirportMappingBeta);
export { AirportMappingBeta as PureAirportMappingBeta };
