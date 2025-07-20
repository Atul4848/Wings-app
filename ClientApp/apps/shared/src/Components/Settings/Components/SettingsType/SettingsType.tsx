import React, { ReactNode } from 'react';
import { ColDef, GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SettingsModuleSecurity } from '@wings-shared/security';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import {
  ISelectOption,
  regex,
  UIStore,
  Utilities,
  NAME_TYPE_FILTERS,
  IBaseGridFilterSetup,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  BaseGrid,
  AgGridAutoComplete,
  AgGridActions,
  CustomAgGridReact,
} from '@wings-shared/custom-ag-grid';

interface WithId {
  id: string | number;
}

interface Props<T> {
  rowData: T[];
  onGetNewModel: () => T;
  onUpsert: (rowIndex: number, model: T) => void;
  onDelete: (object: T) => Observable<string>;
  type: string;
  columnDefs?: ColDef[];
  isNameUnique?: boolean;
  isEditable?: boolean;
  hideAddNewButton?: boolean;
  maxLength?: number;
  regExp?: RegExp;
  isHideSearchSelectControl?: boolean;
  ignoreNumber?: boolean;
  headerName?: string;
  hasSuperPermission?: boolean;
  showDeleteButton?: boolean;
  frameworkComponents?: { [key: string]: any };
  onEditingStarted?: Function;
  isExactMatch?: boolean;
  sortColumn?: string;
}

const filtersSetup: IBaseGridFilterSetup<NAME_TYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(NAME_TYPE_FILTERS),
  defaultFilterType: NAME_TYPE_FILTERS.NAME,
};

@observer
export class SettingsType<T extends WithId = any> extends BaseGrid<Props<T>, T, NAME_TYPE_FILTERS> {
  static defaultProps = {
    ignoreNumber: false,
    isEditable: true,
    isNameUnique: true,
    maxLength: 100,
    isHideSearchSelectControl: true,
    showDeleteButton: false,
    onDelete: () => null,
    onEditingStarted: e => {},
    isExactMatch: false,
  };

  constructor(props) {
    super(props, filtersSetup);
    this.setData(props.rowData);
  }

  private getEditableState({ data }: RowNode): boolean {
    const { isEditable } = this.props;
    return isEditable ? isEditable : !Boolean(data.id);
  }

  private get regExpRule(): RegExp {
    return this.props.regExp || regex.alphabetsWithSpaces;
  }

  // used when a specific user has special permission
  private get hasEditPermission(): boolean {
    if (this.props.hasSuperPermission) {
      return true;
    }
    return SettingsModuleSecurity.isEditable;
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: this.props.headerName || 'Name',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: this.props.ignoreNumber,
        isRequired: true,
        rules: `required|string|between:1,${this.props.maxLength}|regex:${this.regExpRule}`,
      },
      editable: ({ node }) => this.getEditableState(node),
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      colId: 'actionRenderer',
      maxWidth: 130,
      sortable: false,
      filter: false,
      hide: !this.hasEditPermission || !this.props.isEditable,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.props.columnDefs ? [ ...this.props.columnDefs, this.columnDefs[1] ] : this.columnDefs,
      isEditable: this.hasEditPermission,
      gridActionProps: this.gridActionProps,
    });

    return {
      ...baseOptions,
      suppressClickEdit: !this.props.isEditable || !this.hasEditPermission,
      doesExternalFilterPass: node => {
        const { name, id } = node.data;
        return !id || this._isFilterPass({ [NAME_TYPE_FILTERS.NAME]: name }, this.props.isExactMatch);
      },
      onRowEditingStarted: e => {
        this._onRowEditingStarted(e);
        this.props.onEditingStarted(e);
      },
      onRowEditingStopped: () => {
        this._onRowEditingStopped();
        this._setColumnVisible('actionRenderer', this.props.isEditable);
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
        ...this.props.frameworkComponents,
      },
    };
  }

  public updateTableItem(rowIndex, response): void {
    this._updateTableItem(rowIndex, response);
    const { sortColumn } = this.props;
    if (sortColumn) {
      this._sortColumns(rowIndex, response, sortColumn);
    }
  }

  // calling from parent component using ref
  public setData(data: T[]) {
    this.data = data;
  }

  @action
  private addNewType(): void {
    this._setColumnVisible('actionRenderer', true);
    const model: T = this.props.onGetNewModel();
    this._addNewItems([ model ], { startEditing: true, colKey: 'name' });
    this.hasError = true;
  }

  /* istanbul ignore next */
  private get gridActionProps(): object {
    return {
      showDeleteButton: this.props.showDeleteButton,
      getTooltip: () => this.commonErrorMessage,
      getDisabledState: () => this.hasError,
      getEditableState: node => this.getEditableState(node),
      onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
    };
  }

  // Called from Ag Grid Component
  @action
  public onInputChange(params: ICellEditorParams, value: string): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
    this.commonErrorMessage = Utilities.getErrorMessages(this.gridApi).toString();
  }

  // Called from Ag Grid Component
  @action
  public onDropDownChange(params: ICellEditorParams, value: ISelectOption): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
    this.commonErrorMessage = Utilities.getErrorMessages(this.gridApi).toString();
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    const { type } = this.props;
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        this._startEditingCell(rowIndex, this.columnDefs[0].field);
        break;
      case GRID_ACTIONS.SAVE:
        const model: T = this._getTableItem(rowIndex);
        const isExists = this._isAlreadyExists([ 'name' ], Number(model.id), rowIndex);
        if (isExists && this.props.isNameUnique) {
          this.showAlert('Name should be unique.', 'NameSettingsUnique');
          return;
        }
        this.gridApi.stopEditing();
        this.props.onUpsert(rowIndex, model);
        break;
      case GRID_ACTIONS.DELETE:
        ModalStore.open(
          <ConfirmDialog
            title={`Delete ${type}`}
            message={`Are you sure you want to delete this ${type}?`}
            yesButton="Yes"
            onNoClick={() => ModalStore.close()}
            onYesClick={() => this.onDelete(rowIndex)}
          />
        );
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        this._cancelEditing(rowIndex);
        break;
    }
  }

  onDelete(rowIndex: number): void {
    const data: T = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    this.props
      .onDelete(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          this._removeTableItems([ data ]);
          this.data = this._getAllTableRows();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  private get rightContent(): ReactNode {
    const { type, hideAddNewButton } = this.props;

    if (hideAddNewButton || !this.hasEditPermission) {
      return null;
    }
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as NAME_TYPE_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
          isHideSearchSelectControl={this.props.isHideSearchSelectControl}
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
