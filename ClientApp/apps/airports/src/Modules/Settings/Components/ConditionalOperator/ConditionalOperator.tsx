import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { action } from 'mobx';
import { CONDITIONAL_OPERATOR_FILTERS, AirportSettingsStore, ConditionalOperatorModel } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { AgGridCellEditor, CustomAgGridReact, BaseGrid, AgGridActions } from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  isEditable?: boolean;
}

const filtersSetup: IBaseGridFilterSetup<CONDITIONAL_OPERATOR_FILTERS> = {
  defaultPlaceHolder: 'Search by operator',
  filterTypesOptions: Object.values(CONDITIONAL_OPERATOR_FILTERS),
  defaultFilterType: CONDITIONAL_OPERATOR_FILTERS.OPERATOR,
};

@inject('airportSettingsStore')
@observer
class ConditionalOperator extends BaseGrid<Props, ConditionalOperatorModel, CONDITIONAL_OPERATOR_FILTERS> {
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
      .getConditionalOperators()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (conditionalOperators: ConditionalOperatorModel[]) => (this.data = conditionalOperators),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Operator',
      field: 'operator',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      hide: !SettingsModuleSecurity.isEditable || !this.props.isEditable,
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
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: !this.isRowEditing,
      onRowEditingStopped: () => {
        this._onRowEditingStopped();
        this._setColumnVisible('actionRenderer', Boolean(this.props.isEditable));
      },
      doesExternalFilterPass: node => {
        const { id, operator } = node.data as ConditionalOperatorModel;
        return (
          !id ||
          this._isFilterPass({
            [CONDITIONAL_OPERATOR_FILTERS.OPERATOR]: operator,
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
    this._setColumnVisible('actionRenderer', true);
    this._addNewItems(
      [
        new ConditionalOperatorModel({
          id: 0,
          operator: '',
        }),
      ],
      { startEditing: true, colKey: 'operator' }
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
        this.upsertConditionalOperator(rowIndex);
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
        Add Conditional Operator
      </PrimaryButton>
    );
  }

  /* istanbul ignore next */
  private upsertConditionalOperator(rowIndex: number): void {
    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertConditionalOperator(this._getTableItem(rowIndex))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ConditionalOperatorModel) => this._updateTableItem(rowIndex, response),
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as CONDITIONAL_OPERATOR_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
          isHideSearchSelectControl={true}
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

export default ConditionalOperator;
