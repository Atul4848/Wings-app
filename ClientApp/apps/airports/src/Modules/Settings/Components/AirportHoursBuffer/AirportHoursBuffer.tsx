import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import {
  AirportHoursBufferModel,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
  AirportSettingsStore,
  AIRPORT_HOUR_BUFFER_FILTER,
} from '../../../Shared';
import { AxiosError } from 'axios';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IClasses,
  UIStore,
  Utilities,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridAutoComplete,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_HOUR_BUFFER_FILTER> = {
  defaultPlaceHolder: 'Search by Airport Hour Type',
  filterTypesOptions: Object.values(AIRPORT_HOUR_BUFFER_FILTER),
  defaultFilterType: AIRPORT_HOUR_BUFFER_FILTER.AIRPORT_HOURS_TYPE_ID,
};

@inject('airportSettingsStore')
@observer
class AirportHourBuffers extends BaseGrid<Props, AirportHoursBufferModel, AIRPORT_HOUR_BUFFER_FILTER> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadAirportHourBuffers();
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore
  }

  /* istanbul ignore next */
  @action
  private loadAirportHourBuffers(pageRequest?: IAPIGridRequest) {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: this.pagination.pageSize,
      ...pageRequest,
      ...this._searchFilters,
      ...this._sortFilters,
    };
    this.airportSettingsStore
      .loadAirportHourBuffers(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => (this.data = response.results));
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        this._startEditingCell(rowIndex, this.columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        this.upsertAirportHourBuffer(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  /* istanbul ignore next */
  private upsertAirportHourBuffer(rowIndex: number): void {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertAirportHourBuffer(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportHoursBufferModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => this.showAlert(error.message, 'upsertAirportHourBuffer'),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Airport Hour Type ',
      field: 'airportHoursType',
      editable: false,
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) => {
        return Utilities.customComparator(current, next, 'name');
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Hour Type',
        getAutoCompleteOptions: () => this.airportSettingsStore.airportHourTypes,
      },
    },
    {
      headerName: 'Sub Type',
      field: 'airportHoursBufferSubType',
      editable: false,
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursSubTypeModel, next: AirportHoursSubTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Hour Sub Type',
        getAutoCompleteOptions: () => this.airportSettingsStore.airportHourSubTypes,
      },
    },
    {
      headerName: 'Buffer',
      field: 'buffer',
      cellEditorParams: {
        rules: 'required|numeric|between:0,1440',
      },
    },
    {
      headerName: 'Created By',
      field: 'createdBy',
      editable: false,
    },
    {
      headerName: 'Created On',
      field: 'createdOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Modified By',
      field: 'modifiedBy',
      editable: false,
    },
    {
      headerName: 'Modified On',
      field: 'modifiedOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      hide: !SettingsModuleSecurity.isEditable,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: SettingsModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => this.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: !this.isRowEditing,
      onRowEditingStopped: () => {
        this._onRowEditingStopped();
      },
      doesExternalFilterPass: node => {
        const { id, airportHoursType } = node.data as AirportHoursBufferModel;
        return !id || this._isFilterPass({ [AIRPORT_HOUR_BUFFER_FILTER.AIRPORT_HOURS_TYPE_ID]: airportHoursType.name });
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          isHideSearchSelectControl={true}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as AIRPORT_HOUR_BUFFER_FILTER)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          isDisabled={this.isRowEditing}
        />
        <CustomAgGridReact
          isRowEditing={this.isRowEditing}
          rowData={this.data}
          gridOptions={this.gridOptions}
          disablePagination={this.isRowEditing}
        />
      </>
    );
  }
}

export default AirportHourBuffers;
