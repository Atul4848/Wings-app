import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { action } from 'mobx';
import { RunwaySettingsTypeModel, RUNWAY_SETTING_TYPE_FILTERS } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Observable } from 'rxjs';
import { SearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, IBaseGridFilterSetup, cellStyle } from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridGroupHeader,
} from '@wings-shared/custom-ag-grid';

interface Props {
  type: string;
  getSettings?: () => Observable<RunwaySettingsTypeModel[]>;
  upsertSettings?: (object: RunwaySettingsTypeModel) => Observable<RunwaySettingsTypeModel>;
  codeLength?: number;
}

const filtersSetup: IBaseGridFilterSetup<RUNWAY_SETTING_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(RUNWAY_SETTING_TYPE_FILTERS),
  defaultFilterType: RUNWAY_SETTING_TYPE_FILTERS.CODE,
};

@observer
class RunwaySettings extends BaseGrid<Props, RunwaySettingsTypeModel, RUNWAY_SETTING_TYPE_FILTERS> {
  static defaultProps = {
    codeLength: 10,
  };
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
        .subscribe((response: RunwaySettingsTypeModel[]) => (this.data = response));
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
          next: (response: RunwaySettingsTypeModel) => this._updateTableItem(rowIndex, response),
          error: (error: AxiosError) => this.showAlert(error.message, 'upsertRunwaySetting'),
        });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        ignoreNumber: true,
        rules: `required|string|between:1,${this.props.codeLength}`,
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
        const { id, code, name, description } = node.data as RunwaySettingsTypeModel;
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
      },
    };
  }

  private addNewType() {
    const runwaySurfaceType = new RunwaySettingsTypeModel({ id: 0 });
    this._addNewItems([ runwaySurfaceType ], { startEditing: true, colKey: 'code' });
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
        this.upsertSettings(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  private get rightContent(): ReactNode {
    const { type } = this.props;
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addNewType()}
      >
        Add Runway {type}
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

export default RunwaySettings;
