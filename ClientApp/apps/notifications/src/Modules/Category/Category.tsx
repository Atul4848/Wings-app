import React, { ReactNode } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { withTheme } from '@material-ui/core';
import { ColDef, GridOptions, RowNode, ValueFormatterParams, RowEditingStartedEvent } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import { CategoryModel, CategoryStore, CATEGORY_FILTERS } from '../Shared';
import { action } from 'mobx';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  DATE_FORMAT,
  UIStore,
  Utilities,
  regex,
  withRouter,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  IActionMenuItem,
  AgGridActions,
  AgGridCheckBox,
} from '@wings-shared/custom-ag-grid';

interface Props {
  categoryStore: CategoryStore;
}

const filtersSetup: IBaseGridFilterSetup<CATEGORY_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(CATEGORY_FILTERS),
  defaultFilterType: CATEGORY_FILTERS.NAME,
};

@inject('categoryStore')
@observer
class Category extends BaseGrid<Props, CategoryModel, CATEGORY_FILTERS> {
  private readonly alertMessageId: string = 'CategoryAlertMessage';

  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    const { categoryStore } = this.props;
    UIStore.setPageLoader(true);
    categoryStore
      .getCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(categories => (this.data = categories));
  }

  /* istanbul ignore next */
  private upsertCategory(rowIndex: number): void {
    const data: CategoryModel = this._getTableItem(rowIndex);

    if (this.isAlreadyExists(data.id)) {
      return;
    }

    this.gridApi.stopEditing();
    const hasInvalidRowData: boolean = Utilities.hasInvalidRowData(this.gridApi);

    if (hasInvalidRowData) {
      AlertStore.info('Please fill all required fields');
      return;
    }

    UIStore.setPageLoader(true);
    this.props.categoryStore
      .upsertCategory(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: CategoryModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private removeCategory(rowIndex: number): void {
    ModalStore.close();
    const category: CategoryModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.categoryStore
      .removeCategory(category)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ category ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  // Check if category already exists
  private isAlreadyExists(id: number): boolean {
    if (this._isAlreadyExists([ 'name' ], id)) {
      this.showAlert('Category Name should be unique.', this.alertMessageId);
      return true;
    }

    return false;
  }

  /* istanbul ignore next */
  private actionMenus(category: CategoryModel): IActionMenuItem[] {
    return [
      { title: 'Edit', isHidden: false, action: GRID_ACTIONS.EDIT },
      { title: 'Delete', isHidden: category.isApplied, action: GRID_ACTIONS.DELETE },
    ];
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 250,
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|between:1,200|regex:${regex.alphaNumericWithUnderscore}`,
      },
    },
    {
      headerName: 'Display Name',
      field: 'displayName',
      minWidth: 250,
      cellEditorParams: {
        isRequired: true,
        ignoreNumber: true,
        rules: 'required|string|between:1,200',
      },
    },
    {
      headerName: 'Is Sub Category',
      field: 'isSubCategory',
      editable: params => !params.data.id,
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Created On',
      field: 'createdOn',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      minWidth: 150,
      maxWidth: 210,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => this.actionMenus(node.data),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  private get gridActionProps(): object {
    return {
      tooltip: 'Category',
      getDisabledState: () => this.hasError,
      onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
    };
  }

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: true,
      gridActionProps: this.gridActionProps,
    });

    return {
      ...baseOptions,
      doesExternalFilterPass: node => {
        const { id, name, displayName, createdOn } = node.data as CategoryModel;
        return (
          !id ||
          this._isFilterPass({
            [CATEGORY_FILTERS.NAME]: name,
            [CATEGORY_FILTERS.DISPLAY_NAME]: displayName,
            [CATEGORY_FILTERS.CREATED_ON]: Utilities.getformattedDate(createdOn, DATE_FORMAT.GRID_DISPLAY),
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        this._onRowEditingStarted(event);
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addCategory()}
      >
        Add Category
      </PrimaryButton>
    );
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
        this.upsertCategory(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveCategory(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        this._cancelEditing(rowIndex);
        break;
      default:
        this.gridApi.stopEditing(true);
        break;
    }
  }

  @action
  public onInputChange(): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  @action
  private addCategory(): void {
    this._addNewItems([ new CategoryModel({ id: 0 }) ], { startEditing: true, colKey: 'name' });
    this.hasError = true;
  }

  @action
  private confirmRemoveCategory(rowIndex: number): void {
    const model: CategoryModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Category?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeCategory(rowIndex)}
      />
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as CATEGORY_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
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

export default withRouter(withTheme(Category));
export { Category as PureCategory };
