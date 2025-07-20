import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import { AirportSettingsStore, AIRPORT_OF_ENTRY_FILTER } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AxiosError } from 'axios';
import { SearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, IdNameCodeModel, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { AgGridCellEditor, CustomAgGridReact, BaseGrid, AgGridActions } from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_OF_ENTRY_FILTER> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(AIRPORT_OF_ENTRY_FILTER),
  defaultFilterType: AIRPORT_OF_ENTRY_FILTER.CODE,
};

@inject('airportSettingsStore')
@observer
class AirportOfEntry extends BaseGrid<Props, IdNameCodeModel, AIRPORT_OF_ENTRY_FILTER> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadAirportOfEntries();
  }

  /* istanbul ignore next */
  @action
  private loadAirportOfEntries() {
    UIStore.setPageLoader(true);
    this.props.airportSettingsStore
      ?.loadAirportOfEntries()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => (this.data = response.results));
  }

  /* istanbul ignore next */
  private upsertAirportOfEntry(rowIndex: number): void {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.airportSettingsStore
      ?.upsertAirportOfEntry(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: IdNameCodeModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => this.showAlert(error.message, 'upsertAirportOfEntry'),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        rules: 'required|string|size:1',
        isUnique: (value: string) => {
          return !this.props.airportSettingsStore?.airportOfEntry.some(({ code }) =>
            Utilities.isEqual(code, value?.trim())
          );
        },
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
      hide: true,
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
        getEditableState: node => !Boolean(node.id),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      doesExternalFilterPass: node => {
        const { id, code, name } = node.data as IdNameCodeModel;
        return (
          !id ||
          this._isFilterPass({
            [AIRPORT_OF_ENTRY_FILTER.CODE]: code,
            [AIRPORT_OF_ENTRY_FILTER.NAME]: name,
          })
        );
      },
      onRowEditingStopped: () => {
        this._onRowEditingStopped();
        this._setColumnVisible('actionRenderer', false);
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
      },
    };
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        this.upsertAirportOfEntry(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  private addNewType(): void {
    this._setColumnVisible('actionRenderer', true);
    this._addNewItems([ new IdNameCodeModel() ], { startEditing: true, colKey: 'code' });
    this.hasError = true;
  }

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addNewType()}
      >
        Add Airport Of Entry
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as AIRPORT_OF_ENTRY_FILTER)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
          isDisabled={this.isRowEditing}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default AirportOfEntry;
