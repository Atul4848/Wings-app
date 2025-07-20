import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger, SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { action } from 'mobx';
import { forkJoin } from 'rxjs';
import {
  AIRPORT_HOUR_SUB_TYPE_FILTERS,
  AirportSettingsStore,
  AirportHoursSubTypeModel,
  AirportHoursTypeModel,
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import { IClasses, UIStore, Utilities, regex, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridAutoComplete,
  AgGridActions,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_HOUR_SUB_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Name.',
  filterTypesOptions: Object.values(AIRPORT_HOUR_SUB_TYPE_FILTERS),
  defaultFilterType: AIRPORT_HOUR_SUB_TYPE_FILTERS.NAME,
};

@inject('airportSettingsStore')
@observer
class AirportHourSubType extends BaseGrid<Props, AirportHoursSubTypeModel, AIRPORT_HOUR_SUB_TYPE_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    forkJoin([ this.airportSettingsStore.loadAirportHourSubTypes(), this.airportSettingsStore.loadAirportHourTypes() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: ([ airportHourSubTypes ]) => {
          this.data = airportHourSubTypes;
        },
        error: (error: AxiosError) => Logger.error(error.message),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Sequence Id',
      field: 'sequenceId',
      cellEditorParams: {
        isRequired: true,
        rules: `required|numeric|regex:${regex.numeric}`,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,255',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,500',
      },
    },
    {
      headerName: 'Airport Hours Type',
      field: 'airportHoursType',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Airport Hours Type',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getAutoCompleteOptions: () => this.airportSettingsStore.airportHourTypes,
        valueGetter: option => option,
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
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
      doesExternalFilterPass: node => {
        const { id, name, airportHoursType } = node.data as AirportHoursSubTypeModel;
        return (
          !id ||
          this._isFilterPass({
            [AIRPORT_HOUR_SUB_TYPE_FILTERS.NAME]: name,
            [AIRPORT_HOUR_SUB_TYPE_FILTERS.TYPE]: airportHoursType.name,
          })
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  private addNewType() {
    const airportHourSubTypes = new AirportHoursSubTypeModel();
    this._addNewItems([ airportHourSubTypes ], { startEditing: true, colKey: 'sequenceId' });
    this.hasError = true;
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  // Called from Ag Grid Component
  @action
  public onDropDownChange(params: ICellEditorParams, value: string): void {
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
        this.upsertAirportHourSubTypes(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addNewType()}
      >
        Add Airport Hour Sub Type
      </PrimaryButton>
    );
  }

  /* istanbul ignore next */
  private upsertAirportHourSubTypes(rowIndex: number): void {
    const model: AirportHoursSubTypeModel = this._getTableItem(rowIndex);
    const isSequenceIdExists = this._isAlreadyExists([ 'sequenceId', 'airportHoursType' ], model.id, rowIndex);
    if (isSequenceIdExists) {
      this.showAlert('Sequence Id should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    const isNameExists = this._isAlreadyExists([ 'name', 'airportHoursType' ], model.id, rowIndex);
    if (isNameExists) {
      this.showAlert('Name should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertAirportHourSubTypes(model)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AirportHoursSubTypeModel) => {
          this._updateTableItem(rowIndex, response);
          if (this.sortFilters) {
            this.data = Utilities.customArraySort(this.data, this.sortFilters[0].colId);
          }
          this.data = Utilities.customArraySort(this.data, 'airportHoursType.name', 'sequenceId');
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption =>
            this._setSelectedOption(selectedOption as AIRPORT_HOUR_SUB_TYPE_FILTERS)
          }
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
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

export default AirportHourSubType;
