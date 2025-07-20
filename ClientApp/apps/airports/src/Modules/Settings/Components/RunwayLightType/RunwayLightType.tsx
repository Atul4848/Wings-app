import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams } from 'ag-grid-community';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridCellEditor,
  AgGridActions,
  BaseGrid,
} from '@wings-shared/custom-ag-grid';
import { observer, inject } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, GRID_ACTIONS, cellStyle, IBaseGridFilterSetup, Utilities } from '@wings-shared/core';
import { SearchHeader } from '@wings-shared/form-controls';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AirportSettingsStore, RUNWAY_LIGHT_TYPE_FILTERS, RunwayLightTypeModel } from '../../../Shared';
import { AxiosError } from 'axios';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { action } from 'mobx';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const filtersSetup: IBaseGridFilterSetup<RUNWAY_LIGHT_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Code',
  filterTypesOptions: Object.values(RUNWAY_LIGHT_TYPE_FILTERS),
  defaultFilterType: RUNWAY_LIGHT_TYPE_FILTERS.CODE,
};

@inject('airportSettingsStore')
@observer
class RunwayLightType extends BaseGrid<Props, RunwayLightTypeModel, RUNWAY_LIGHT_TYPE_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  private get settingStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  private loadInitialData = () => {
    UIStore.setPageLoader(true);
    this.settingStore
      .loadRunwayLightTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: RunwayLightTypeModel[]) => (this.data = response));
  };

  /* istanbul ignore next */
  upsertRunwayLightType = (rowIndex: number): void => {
    this.gridApi.stopEditing();
    const model = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.settingStore
      .upsertRunwayLightType(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: RunwayLightTypeModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => this.showAlert(error.message, 'upsertRunwayLightType'),
      });
  };

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
        this.upsertRunwayLightType(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  private addRunwayLightType = () => {
    const lightType = new RunwayLightTypeModel({ id: 0 });
    this._addNewItems([ lightType ], { startEditing: true, colKey: 'code' });
    this.hasError = true;
  };

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
      headerName: 'FAA Code',
      field: 'faaCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:0,10',
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
        const { id, code, name, description, faaCode } = node.data as RunwayLightTypeModel;
        return (
          !id ||
          this._isFilterPass({
            [RUNWAY_LIGHT_TYPE_FILTERS.CODE]: code,
            [RUNWAY_LIGHT_TYPE_FILTERS.NAME]: name,
            [RUNWAY_LIGHT_TYPE_FILTERS.DESCRIPTION]: description,
            [RUNWAY_LIGHT_TYPE_FILTERS.FAA_CODE]: faaCode,
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

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addRunwayLightType()}
      >
        Add Runway Light Type
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as RUNWAY_LIGHT_TYPE_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
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

export default RunwayLightType;
export { RunwayLightType as PureRunwayLightType };
