import React, { ReactNode } from 'react';
import {
  withRouter,
  Utilities,
  DATE_FORMAT,
  UIStore,
  ISelectOption,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { withTheme } from '@material-ui/core';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import { SystemMessageModel, SystemMessageStore, SYSTEM_MESSAGES_FILTERS } from '../Shared';
import { action } from 'mobx';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { forkJoin } from 'rxjs';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  BaseGrid,
  IActionMenuItem,
  AgGridActions,
  AgGridAutoComplete,
} from '@wings-shared/custom-ag-grid';

interface Props {
  systemMessageStore: SystemMessageStore;
}

const filtersSetup: IBaseGridFilterSetup<SYSTEM_MESSAGES_FILTERS> = {
  defaultPlaceHolder: 'Search by Type',
  filterTypesOptions: Object.values(SYSTEM_MESSAGES_FILTERS),
  defaultFilterType: SYSTEM_MESSAGES_FILTERS.TYPE,
};

@inject('systemMessageStore')
@observer
class SystemMessage extends BaseGrid<Props, SystemMessageModel, SYSTEM_MESSAGES_FILTERS> {
  private readonly alertMessageId: string = 'SystemMessageAlertMessage';

  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    const { systemMessageStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ systemMessageStore.getSystemMessages(), systemMessageStore.getSystemMessageTypes() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ systemMessages ]) => (this.data = systemMessages));
  }

  /* istanbul ignore next */
  private upsertSystemMessage(rowIndex: number): void {
    const data: SystemMessageModel = this._getTableItem(rowIndex);
    if (this.isAlreadyExists(data.id)) {
      return;
    }
    this.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    this.props.systemMessageStore
      .upsertSystemMessage(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: SystemMessageModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private removeSystemMessage(rowIndex: number): void {
    ModalStore.close();
    const systemMessage: SystemMessageModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.systemMessageStore
      .removeSystemMessage(systemMessage)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ systemMessage ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  // Check if category already exists
  private isAlreadyExists(id: number): boolean {
    if (this._isAlreadyExists([ 'type' ], id)) {
      this.showAlert('System Message Type is already exists.', this.alertMessageId);
      return true;
    }

    return false;
  }

  /* istanbul ignore next */
  private actionMenus(): IActionMenuItem[] {
    return [
      { title: 'Edit', action: GRID_ACTIONS.EDIT },
      { title: 'Delete', action: GRID_ACTIONS.DELETE },
    ];
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Type',
      field: 'type',
      minWidth: 200,
      editable: params => !params.data.id,
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Type',
        getAutoCompleteOptions: () => this.props.systemMessageStore.systemMessageTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Value',
      field: 'value',
      minWidth: 250,
      cellEditorParams: {
        ignoreNumber: true,
        isRequired: true,
        rules: 'required|string|between:1,1000',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      minWidth: 400,
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:1,500',
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
        actionMenus: () => this.actionMenus(),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  private get gridActionProps(): object {
    return {
      tooltip: 'System Message',
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
        const { id, type, createdOn } = node.data as SystemMessageModel;
        return (
          !id ||
          this._isFilterPass({
            [SYSTEM_MESSAGES_FILTERS.TYPE]: type.value,
            [SYSTEM_MESSAGES_FILTERS.CREATED_ON]: Utilities.getformattedDate(createdOn, DATE_FORMAT.GRID_DISPLAY),
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customAutoComplete: AgGridAutoComplete,
      },
    };
  }

  private get rightContent(): ReactNode {
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={this.isProcessing}
        onClick={() => this.addSystemMessage()}
      >
        Add System Message
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
        this.upsertSystemMessage(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveSystemMessage(rowIndex);
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
  public onDropDownChange(params: ICellEditorParams, value: ISelectOption): void {
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  @action
  private addSystemMessage(): void {
    this._addNewItems([ new SystemMessageModel({ id: 0 }) ], { startEditing: true, colKey: 'type' });
    this.hasError = true;
  }

  @action
  private confirmRemoveSystemMessage(rowIndex: number): void {
    const model: SystemMessageModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this System Message?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeSystemMessage(rowIndex)}
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as SYSTEM_MESSAGES_FILTERS)}
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

export default withRouter(withTheme(SystemMessage));
export { SystemMessage as PureSystemMessage };
