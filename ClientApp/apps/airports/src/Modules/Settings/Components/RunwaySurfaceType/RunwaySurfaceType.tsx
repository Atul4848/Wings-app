import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { action } from 'mobx';
import { AirportSettingsStore, RunwaySurfaceTypeModel, RUNWAY_SETTING_TYPE_FILTERS } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  UIStore,
  Utilities,
  YES_NO_NULL,
  SelectOption,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridGroupHeader,
  AgGridAutoComplete,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const filtersSetup: IBaseGridFilterSetup<RUNWAY_SETTING_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(RUNWAY_SETTING_TYPE_FILTERS),
  defaultFilterType: RUNWAY_SETTING_TYPE_FILTERS.CODE,
};

@inject('airportSettingsStore')
@observer
class RunwaySurfaceType extends BaseGrid<Props, RunwaySurfaceTypeModel, RUNWAY_SETTING_TYPE_FILTERS> {
  private readonly isHardSurfaceOptions: SelectOption[] = [
    new SelectOption({ name: 'Yes', value: YES_NO_NULL.YES }),
    new SelectOption({ name: 'No', value: YES_NO_NULL.NO }),
  ];

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
    this.props.airportSettingsStore
      ?.loadRunwaySurfaceTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: RunwaySurfaceTypeModel[]) => (this.data = response));
  }

  /* istanbul ignore next */
  private upsertRunwaySurfaceType(rowIndex: number): void {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.airportSettingsStore
      ?.upsertRunwaySurfaceType(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RunwaySurfaceTypeModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => this.showAlert(error.message, 'upsertRunwaySurfaceType'),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,10',
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:0,1000',
      },
    },
    {
      headerName: 'Is Hard Surface',
      field: 'isHardSurface',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Is Hard Surface',
        valueGetter: (option: SelectOption) => option.value,
        getAutoCompleteOptions: () => this.isHardSurfaceOptions,
      },
    },
    ...this.auditFields,
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
        const { id, code, name, description } = node.data as RunwaySurfaceTypeModel;
        return (
          !id ||
          this._isFilterPass({
            [RUNWAY_SETTING_TYPE_FILTERS.CODE]: code,
            [RUNWAY_SETTING_TYPE_FILTERS.NAME]: name,
            [RUNWAY_SETTING_TYPE_FILTERS.DESCRIPTION]: description,
          })
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customHeader: AgGridGroupHeader,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  private addNewType() {
    const runwaySurfaceType = new RunwaySurfaceTypeModel();
    this._addNewItems([ runwaySurfaceType ], { startEditing: true, colKey: 'code' });
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
        this.upsertRunwaySurfaceType(rowIndex);
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
        Add Runway Surface Type
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as RUNWAY_SETTING_TYPE_FILTERS)}
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

export default RunwaySurfaceType;
export { RunwaySurfaceType as PureRunwaySurfaceType };
