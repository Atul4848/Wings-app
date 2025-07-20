import React, { ReactNode } from 'react';
import {
  ColDef,
  GridOptions,
  ICellEditorParams,
  ValueFormatterParams,
  RowEditingStartedEvent,
  RowNode,
} from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger, SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { action, observable } from 'mobx';
import { forkJoin, Observable } from 'rxjs';
import {
  AIRPORT_HOUR_REMARKS_FILTERS,
  AirportSettingsStore,
  AirportHoursSubTypeModel,
  AirportHourRemarksModel,
  AirportHoursTypeModel,
} from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  UIStore,
  Utilities,
  regex,
  ISelectOption,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridAutoComplete,
  AgGridActions,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_HOUR_REMARKS_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(AIRPORT_HOUR_REMARKS_FILTERS),
  defaultFilterType: AIRPORT_HOUR_REMARKS_FILTERS.NAME,
};

@inject('airportSettingsStore')
@observer
class AirportHourSubType extends BaseGrid<Props, AirportHourRemarksModel, AIRPORT_HOUR_REMARKS_FILTERS> {
  @observable private airportHourSubTypes: AirportHoursSubTypeModel[] = [];

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
  private columnDefs: ColDef[] = [
    {
      headerName: 'Hour Type',
      field: 'airportHoursType',
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursTypeModel, next: AirportHoursTypeModel) => {
        return Utilities.customComparator(current, next, 'name');
      },
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Hour Type',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
        getAutoCompleteOptions: () => this.airportSettingsStore.airportHourTypes,
      },
    },
    {
      headerName: 'Hour Sub Type',
      field: 'airportHoursSubType',
      cellEditor: 'customAutoComplete',
      comparator: (current: AirportHoursSubTypeModel, next: AirportHoursSubTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Hour Sub Type',
        getAutoCompleteOptions: () => this.airportHourSubTypes,
      },
    },
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
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        if (this.isProcessing) {
          this.gridApi.stopEditing();
          return;
        }
        this.hasError = true;
        this._startEditingRow(params);
        const selectedHoursType: number = params.data.airportHoursType?.id;
        if (Boolean(selectedHoursType)) {
          this.setAirportHoursSubTypes(selectedHoursType);
        }
      },
      doesExternalFilterPass: node => {
        const { id, name, airportHoursType, airportHoursSubType } = node.data as AirportHourRemarksModel;
        return (
          !id ||
          this._isFilterPass({
            [AIRPORT_HOUR_REMARKS_FILTERS.NAME]: name,
            [AIRPORT_HOUR_REMARKS_FILTERS.TYPE]: airportHoursType.name,
            [AIRPORT_HOUR_REMARKS_FILTERS.SUBTYPE]: airportHoursSubType.name,
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
    this._addNewItems([ new AirportHourRemarksModel() ], { startEditing: true, colKey: 'airportHoursType' });
    this.hasError = true;
  }

  @action
  private setAirportHoursSubTypes(airportHoursId: number): void {
    this.airportHourSubTypes = this.airportSettingsStore.airportHourSubTypes.filter(({ airportHoursType }) =>
      Utilities.isEqual(airportHoursType.id, airportHoursId)
    );
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  // Called from Ag Grid Component
  @action
  public onDropDownChange({ colDef }: ICellEditorParams, value: ISelectOption): void {
    if (colDef.field === 'airportHoursType') {
      const selectedHoursType: AirportHoursTypeModel = value as AirportHoursTypeModel;
      const hourTypeId: number = this.getInstanceValue<AirportHoursSubTypeModel>('airportHoursSubType')
        ?.airportHoursType.id;
      this.airportHourSubTypes = [];

      if (hourTypeId !== selectedHoursType?.id) {
        this.getComponentInstance('airportHoursSubType').setValue(null);
      }

      if (Boolean(selectedHoursType?.id)) {
        this.setAirportHoursSubTypes(selectedHoursType.id);
      }
    }
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
        this.upsertAirportHourRemarks(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    forkJoin([ this.loadAirportHoursRemarks(), this.airportSettingsStore.loadAirportHourSubTypes() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: ([ airportHoursRemarks ]) => {
          this.data = airportHoursRemarks;
        },
        error: (error: AxiosError) => Logger.error(error.message),
      });
  }

  /* istanbul ignore next */
  private loadAirportHoursRemarks(): Observable<AirportHourRemarksModel[]> {
    return forkJoin([
      this.airportSettingsStore.getAirportHoursRemarks(),
      this.airportSettingsStore.loadAirportHourTypes(),
    ]).pipe(
      map(([ airportHoursRemarks, airportHourTypes ]) =>
        airportHoursRemarks.map(
          (remark: AirportHourRemarksModel) =>
            new AirportHourRemarksModel({
              ...remark,
              airportHoursType: new AirportHoursTypeModel(
                airportHourTypes.find(({ id }) => id === remark.airportHoursSubType.airportHoursType.id)
              ),
            })
        )
      )
    );
  }

  /* istanbul ignore next */
  private upsertAirportHourRemarks(rowIndex: number): void {
    const model: AirportHourRemarksModel = this._getTableItem(rowIndex);
    const isSequenceIdExists = this._isAlreadyExists(
      [ 'sequenceId', 'airportHoursType', 'airportHoursSubType' ],
      model.id,
      rowIndex
    );
    if (isSequenceIdExists) {
      this.showAlert('Sequence Id should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    const isNameExists = this._isAlreadyExists(
      [ 'airportHoursType', 'airportHoursSubType', 'name' ], model.id, rowIndex
    );
    if (isNameExists) {
      this.showAlert('Name should be unique.', 'airportHourSubTypeAlertMessageId');
      return;
    }

    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertAirportHourRemark(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportHourRemarksModel) => {
          this._updateTableItem(rowIndex, response);
          if (Array.isArray(this.sortFilters) && this.sortFilters.length) {
            this.data = Utilities.customArraySort(this.data, this.sortFilters[0].colId);
          }
          this.data = Utilities.customArraySort(this.data, 'airportHoursSubType.name', 'sequenceId');
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  }

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addNewType()}
      >
        Add Airport Hour Remark
      </PrimaryButton>
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as AIRPORT_HOUR_REMARKS_FILTERS)}
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
