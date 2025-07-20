import React, { ReactNode } from 'react';
import {
  ColDef,
  GridOptions,
  FilterChangedEvent,
  SortChangedEvent,
  ICellEditorParams,
  RowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import { Checkbox, FormControlLabel, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ModelStatusOptions } from '@wings/shared';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { action, observable } from 'mobx';
import { AirportSettingsStore, ICAOCodeModel, ICAO_CODE_FILTER } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AxiosError } from 'axios';
import { icaoGridFilters } from './fields';
import ICAOAuditHistory from './ICAOAuditHistory/ICAOAuditHistory';
import {
  DATE_FORMAT,
  GridPagination,
  IAPIGridRequest,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  regex,
  ViewPermission,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
  IGridSortFilter,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridStatusBadge,
} from '@wings-shared/custom-ag-grid';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const filtersSetup: IBaseGridFilterSetup<ICAO_CODE_FILTER> = {
  defaultPlaceHolder: 'Search by icao',
  filterTypesOptions: Object.values(ICAO_CODE_FILTER),
  defaultFilterType: ICAO_CODE_FILTER.ICAO,
  apiFilterDictionary: icaoGridFilters,
};

@inject('airportSettingsStore')
@observer
class ICAOCode extends BaseGrid<Props, ICAOCodeModel, ICAO_CODE_FILTER> {
  @observable private active: boolean = false;
  @observable private inactive: boolean = false;

  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadICAOCodes();
  }

  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private get _statusFilter(): IAPIGridRequest | null {
    // in all no filter required
    if (this.active && this.inactive) {
      return null;
    }

    const filter = this.active ? 'Active' : this.inactive ? 'InActive' : '';
    // return if both unselected
    if (!filter) {
      return null;
    }

    return {
      filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', filter) ]),
    };
  }

  /* istanbul ignore next */
  @action
  private loadICAOCodes(pageRequest?: IAPIGridRequest) {
    UIStore.setPageLoader(true);

    const request: IAPIGridRequest = {
      pageSize: this.pagination.pageSize,
      ...pageRequest,
      ...this._searchFilters,
      ...this._sortFilters,
      ...this._statusFilter,
    };
    this.airportSettingsStore
      .loadICAOCodes(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        this.data = response.results;
        this.pagination = new GridPagination({ ...response });
      });
  }

  /* istanbul ignore next */
  @action
  private validateICAOCodes(model: ICAOCodeModel, searchValue: string) {
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageSize: 0,
      searchCollection: JSON.stringify([ Utilities.getFilter('Code', searchValue) ]),
    };
    return this.airportSettingsStore
      .loadICAOCodes(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ results }) => {
        this.hasError = results.some(item => item.id !== model.id && Utilities.isEqual(searchValue, item.code));
        this.getComponentInstance('code').setCustomError(this.hasError ? 'ICAO code should be unique' : '');
      });
  }

  private addNewType() {
    this._addNewItems([ new ICAOCodeModel() ], { startEditing: true, colKey: 'code' });
    this.hasError = true;
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
    this.getComponentInstance('code').setCustomError('');
    // search for duplicate ICAO
    if (value.length === 4) {
      this.validateICAOCodes(params.data, value);
      return;
    }
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
        const _model = this._getTableItem(rowIndex);
        this.gridApi.stopEditing();
        this.upsertICAOCode(_model, rowIndex);
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        this.updateIcaoStatus(rowIndex);
        break;
      case GRID_ACTIONS.AUDIT:
        const model: ICAOCodeModel = this._getTableItem(rowIndex);
        ModalStore.open(<ICAOAuditHistory icaoCode={model.code} airportSettingsStore={this.airportSettingsStore} />);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  /* istanbul ignore next */
  private upsertICAOCode(model: ICAOCodeModel, rowIndex: number): void {
    UIStore.setPageLoader(true);
    this.airportSettingsStore
      .upsertICAOCode(model)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ICAOCodeModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => this.showAlert(error.message, 'upsertIcao'),
      });
  }

  /* istanbul ignore next */
  private updateIcaoStatus(rowIndex: number): void {
    const _model = this._getTableItem(rowIndex);
    const status = Utilities.isEqual(_model.status?.name || '', 'Active') ? 'Deactivate' : 'Activate';

    ModalStore.open(
      <ConfirmDialog
        title={`Confirm ${status}`}
        message={`Are you sure you want to ${status} this ICAO?`}
        yesButton="Ok"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          const _status = ModelStatusOptions.find(x => !Utilities.isEqual(x.name, _model.status?.name || ''));
          _model.status = _status;
          this.upsertICAOCode(_model, rowIndex);
          ModalStore.close();
        }}
      />
    );
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
      field: 'code',
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|regex:${regex.alphaNumericWithoutSpaces}|size:4`,
      },
    },
    {
      headerName: 'Created By',
      field: 'createdBy',
      editable: false,
    },
    {
      headerName: 'Created On',
      field: 'createdOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Modified By',
      field: 'modifiedBy',
      editable: false,
    },
    {
      headerName: 'Modified On',
      field: 'modifiedOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: false,
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value?.name || '',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      suppressSizeToFit: true,
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
        isActionMenu: true,
        showDeleteButton: false,
        getDisabledState: () => this.hasError,
        getEditableState: ({ data }: RowNode) => !Boolean(data.id),
        getVisibleState: ({ data }: RowNode) =>
          Boolean(Utilities.isEqual(data.status?.name, 'InActive') || !data.airportId),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
        actionMenus: ({ data }: RowNode) => [
          {
            title: 'History',
            action: GRID_ACTIONS.AUDIT,
            isHidden: !Boolean(Utilities.isEqual(data.status?.name, 'InActive') && data.airportId),
          },
          {
            title: Boolean(Utilities.isEqual(data.status?.name, 'Active')) ? 'Deactivate' : 'Activate',
            action: GRID_ACTIONS.TOGGLE_STATUS,
            isHidden: Boolean(data.airportId),
          },
        ],
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => false,
      suppressClickEdit: !this.isRowEditing,
      onRowEditingStopped: () => this._onRowEditingStopped(),
      pagination: false,
      onFilterChanged: (filterChanged: FilterChangedEvent) => this.loadICAOCodes(),
      onSortChanged: ({ api }: SortChangedEvent) => {
        this.sortFilters = api.getSortModel() as IGridSortFilter[];
        this.loadICAOCodes();
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        statusRenderer: AgGridStatusBadge,
      },
    };
  }

  /* istanbul ignore next */
  private get rightContent(): ReactNode {
    return (
      <div>
        <FormControlLabel
          label="Active"
          control={
            <Checkbox
              name="icao-status"
              checked={this.active}
              disabled={this.isRowEditing}
              onChange={(e, checked: boolean) => {
                this.active = checked;
                this.inactive = false;
                this.gridApi?.onFilterChanged();
              }}
            />
          }
        />
        <FormControlLabel
          label="Inactive"
          control={
            <Checkbox
              name="icao-status"
              checked={this.inactive}
              disabled={this.isRowEditing}
              onChange={(e, checked: boolean) => {
                this.inactive = checked;
                this.active = false;
                this.gridApi?.onFilterChanged();
              }}
            />
          }
        />
        <ViewPermission hasPermission={SettingsModuleSecurity.isEditable}>
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            disabled={this.isProcessing}
            onClick={() => this.addNewType()}
          >
            Add Official ICAO Code
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          isHideSearchSelectControl={true}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as ICAO_CODE_FILTER)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={SettingsModuleSecurity.isEditable && this.rightContent}
          isDisabled={this.isRowEditing}
        />
        <CustomAgGridReact
          isRowEditing={this.isRowEditing}
          rowData={this.data}
          gridOptions={this.gridOptions}
          serverPagination={true}
          paginationData={this.pagination}
          onPaginationChange={request => this.loadICAOCodes(request)}
          disablePagination={this.isRowEditing}
        />
      </>
    );
  }
}

export default ICAOCode;
