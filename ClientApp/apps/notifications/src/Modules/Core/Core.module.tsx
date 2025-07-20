import React, { ReactNode } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { withTheme } from '@material-ui/core';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ICellEditorParams,
  RowNode,
  ICellEditor,
  RowEditingStartedEvent,
} from 'ag-grid-community';
import { AlertStore, ALERT_TYPES } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import {
  ChannelModel,
  ChannelStore,
  DeliveryTypeOptions,
  CHANNEL_FILTERS,
  ProviderModel,
  ProviderStore,
} from '../Shared';
import { action, observable } from 'mobx';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { forkJoin } from 'rxjs';
import {
  ISelectOption,
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
  AgGridCheckBox,
  IActionMenuItem,
  AgGridActions,
  AgGridAutoComplete,
} from '@wings-shared/custom-ag-grid';

interface Props {
  channelStore: ChannelStore;
  providerStore: ProviderStore;
}

const filtersSetup: IBaseGridFilterSetup<CHANNEL_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(CHANNEL_FILTERS),
  defaultFilterType: CHANNEL_FILTERS.NAME,
};

@inject('channelStore', 'providerStore')
@observer
class CoreModule extends BaseGrid<Props, ChannelModel, CHANNEL_FILTERS> {
  private readonly alertMessageId: string = 'ChannelAlertMessage';

  @observable private providers: ProviderModel[] = [];
  @observable private filteredProviders: ProviderModel[] = [];

  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    const { channelStore, providerStore } = this.props;
    UIStore.setPageLoader(true);
    forkJoin([ channelStore.getChannels(), providerStore.getProviders() ])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ channels, providers ]) => {
        this.data = channels;
        this.providers = providers;
      });
  }

  /* istanbul ignore next */
  private upsertChannel(rowIndex: number): void {
    const data: ChannelModel = this._getTableItem(rowIndex);

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
    this.props.channelStore
      .upsertChannel(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ChannelModel) => this._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private removeChannel(rowIndex: number): void {
    ModalStore.close();
    const channel: ChannelModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.channelStore
      .removeChannel(channel)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ channel ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  // Check if channel already exists
  private isAlreadyExists(id: number): boolean {
    if (this._isAlreadyExists([ 'name' ], id)) {
      this.showAlert('Channel Name should be unique.', this.alertMessageId);
      return true;
    }

    return false;
  }

  /* istanbul ignore next */
  private actionMenus(channel: ChannelModel): IActionMenuItem[] {
    return [
      { title: 'Edit', isHidden: false, action: GRID_ACTIONS.EDIT },
      { title: 'Delete', isHidden: channel.systemCreated, action: GRID_ACTIONS.DELETE },
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
      headerName: 'Delivery Type',
      field: 'type',
      minWidth: 200,
      cellEditor: 'customAutoComplete',
      editable: params => !Boolean(params.data.isUsedInTemplate),
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Type',
        getAutoCompleteOptions: () => DeliveryTypeOptions.filter(x => x.value !== 'ALL'),
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Provider',
      field: 'provider',
      minWidth: 200,
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Provider',
        getAutoCompleteOptions: () => this.filteredProviders,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Content Size',
      field: 'contentSize',
      cellEditorParams: {
        isRequired: true,
        rules: `required|numeric|between:1,9999|regex:${regex.numberOnly}`,
      },
    },
    {
      headerName: 'System Enabled',
      field: 'systemEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Public Enabled',
      field: 'publicEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
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
      tooltip: 'Channel',
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
        const { id, name, type, provider } = node.data as ChannelModel;
        return (
          !id ||
          this._isFilterPass({
            [CHANNEL_FILTERS.NAME]: name,
            [CHANNEL_FILTERS.TYPE]: type.value,
            [CHANNEL_FILTERS.PROVIDER]: provider.name,
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        this.filteredProviders = this.providers.filter(x => x.type.name == event.data.type?.name);
        if (Boolean(event.data.id) && event.data.isUsedInTemplate) {
          this.showAlert(
            'The channel you are about to edit is already being used in templates. Please be sure to make any changes.',
            'channelInUseId',
            ALERT_TYPES.IMPORTANT
          );
        }
        this._onRowEditingStarted(event);
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        checkBoxRenderer: AgGridCheckBox,
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
        onClick={() => this.addChannel()}
      >
        Add Channel
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
        this.upsertChannel(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        this.confirmRemoveChannel(rowIndex);
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

  // Called from Ag Grid Component
  @action
  public onDropDownChange(params: ICellEditorParams, value: ISelectOption): void {
    if (params.colDef.field === 'type') {
      const providerInstance: ICellEditor[] = this.gridApi.getCellEditorInstances({ columns: [ 'provider' ] });
      if (providerInstance?.length) {
        (providerInstance[0] as any).getFrameworkComponentInstance().setValue(null);
      }
      this.filteredProviders = this.providers.filter(x => x.type.name == value?.value);
    }
    this.hasError = Utilities.hasInvalidRowData(this.gridApi);
  }

  @action
  private addChannel(): void {
    this._addNewItems([ new ChannelModel({ id: 0 }) ], { startEditing: true, colKey: 'name' });
    this.hasError = true;
  }

  @action
  private confirmRemoveChannel(rowIndex: number): void {
    const model: ChannelModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Channel?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeChannel(rowIndex)}
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
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as CHANNEL_FILTERS)}
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

export default withRouter(withTheme(CoreModule));
export { CoreModule as PureCoreModule };
