import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { action } from 'mobx';
import { AirportCategoryModel, AIRPORT_CATEGORY_FILTERS } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Observable } from 'rxjs';
import { UIStore, Utilities, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridGroupHeader,
} from '@wings-shared/custom-ag-grid';

interface Props {
  getSettings?: () => Observable<AirportCategoryModel[]>;
  upsertSettings?: (object: AirportCategoryModel) => Observable<AirportCategoryModel>;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_CATEGORY_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(AIRPORT_CATEGORY_FILTERS),
  defaultFilterType: AIRPORT_CATEGORY_FILTERS.NAME,
};

@observer
class AirportCategory extends BaseGrid<Props, AirportCategoryModel, AIRPORT_CATEGORY_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  @action
  private loadInitialData() {
    UIStore.setPageLoader(true);
    this.props.getSettings &&
      this.props
        .getSettings()
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: AirportCategoryModel[]) => (this.data = response));
  }

  /* istanbul ignore next */
  private upsertSettings(rowIndex: number): void {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.upsertSettings &&
      this.props
        .upsertSettings(model)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: AirportCategoryModel) => this._updateTableItem(rowIndex, response),
          error: (error: AxiosError) => this.showAlert(error.message, 'upsertAirportCategory'),
        });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,10',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,100',
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
        const { id, name, description } = node.data as AirportCategoryModel;
        return (
          !id ||
          this._isFilterPass({
            [AIRPORT_CATEGORY_FILTERS.NAME]: name,
            [AIRPORT_CATEGORY_FILTERS.DESCRIPTION]: description,
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
        customHeader: AgGridGroupHeader,
      },
    };
  }

  private addNewType(): void {
    this._setColumnVisible('actionRenderer', true);
    const airportCategoryType = new AirportCategoryModel({ id: 0 });
    this._addNewItems([ airportCategoryType ], { startEditing: true, colKey: 'name' });
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
      case GRID_ACTIONS.SAVE:
        this.upsertSettings(rowIndex);
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
        Add Airport Category
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as AIRPORT_CATEGORY_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default AirportCategory;
