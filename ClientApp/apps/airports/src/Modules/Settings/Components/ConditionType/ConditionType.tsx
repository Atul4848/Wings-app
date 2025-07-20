import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { action } from 'mobx';
import { CONDITION_TYPE_FILTERS, AirportSettingsStore, ConditionTypeModel } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, regex, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { AgGridCellEditor, CustomAgGridReact, BaseGrid, AgGridActions } from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const filtersSetup: IBaseGridFilterSetup<CONDITION_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by name',
  filterTypesOptions: Object.values(CONDITION_TYPE_FILTERS),
  defaultFilterType: CONDITION_TYPE_FILTERS.NAME,
};

@inject('airportSettingsStore')
@observer
class ConditionType extends BaseGrid<Props, ConditionTypeModel, CONDITION_TYPE_FILTERS> {
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
    this.airportSettingsStore
      .loadConditionTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (conditionTypes: ConditionTypeModel[]) => (this.data = conditionTypes),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Sequence Id',
      field: 'sequenceId',
      cellEditorParams: {
        isRequired: true,
        rules: `required|numeric|regex:${regex.numberOnly}`,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
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
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      hide: !SettingsModuleSecurity.isEditable,
      minWidth: 150,
      maxWidth: 210,
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
        const { id, name, description } = node.data as ConditionTypeModel;
        return (
          !id ||
          this._isFilterPass({
            [CONDITION_TYPE_FILTERS.NAME]: name,
            [CONDITION_TYPE_FILTERS.DESCRIPTION]: description,
          })
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
      },
    };
  }

  private addNewType() {
    this._addNewItems(
      [
        new ConditionTypeModel({
          id: 0,
        }),
      ],
      { startEditing: true, colKey: 'sequenceId' }
    );
    this.hasError = true;
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
        this.upsertConditionType(rowIndex);
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
        Add Condition Type
      </PrimaryButton>
    );
  }

  /* istanbul ignore next */
  private upsertConditionType(rowIndex: number): void {
    const model: ConditionTypeModel = this._getTableItem(rowIndex);
    const isExists = this._isAlreadyExists([ 'name' ], model.id, rowIndex);

    if (isExists) {
      this.showAlert('Name should be unique.', 'airportConditionTypeAlertMessageId');
      return;
    }

    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertConditionType(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ConditionTypeModel) => {
          this._updateTableItem(rowIndex, response);
          if (this.sortFilters) {
            this.data = Utilities.customArraySort(this.data, this.sortFilters[0].colId);
          }
          this.data = Utilities.customArraySort(this.data, 'sequenceId');
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
        },
      });
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as CONDITION_TYPE_FILTERS)}
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

export default ConditionType;
