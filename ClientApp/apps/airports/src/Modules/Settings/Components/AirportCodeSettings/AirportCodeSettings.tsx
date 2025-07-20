import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { action } from 'mobx';
import { AIRPORT_CODE_SETTING_FILTERS, AirportCodeSettingsModel } from '../../../Shared';
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
  codeLength?: number;
  getSettings?: () => Observable<AirportCodeSettingsModel[]>;
  upsertSettings?: (object: AirportCodeSettingsModel) => Observable<AirportCodeSettingsModel>;
}

const filtersSetup: IBaseGridFilterSetup<AIRPORT_CODE_SETTING_FILTERS> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(AIRPORT_CODE_SETTING_FILTERS),
  defaultFilterType: AIRPORT_CODE_SETTING_FILTERS.CODE,
};

@observer
class AirportCodeSettings extends BaseGrid<Props, AirportCodeSettingsModel, AIRPORT_CODE_SETTING_FILTERS> {
  static defaultProps = {
    codeLength: 3,
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
        .subscribe((response: AirportCodeSettingsModel[]) => (this.data = response));
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
          next: (response: AirportCodeSettingsModel) => this._updateTableItem(rowIndex, response),
          error: (error: AxiosError) => this.showAlert(error.message, 'upsertCodeSetting'),
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
        const { id, code } = node.data as AirportCodeSettingsModel;
        return (
          !id ||
          this._isFilterPass({
            [AIRPORT_CODE_SETTING_FILTERS.CODE]: code,
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
    const runwaySurfaceType = new AirportCodeSettingsModel({ id: 0 });
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
        Add {type}
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as AIRPORT_CODE_SETTING_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
          isDisabled={this.isRowEditing}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default AirportCodeSettings;
