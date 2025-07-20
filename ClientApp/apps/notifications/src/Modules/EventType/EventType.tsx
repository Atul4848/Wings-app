import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { BaseGrid, AgGridCheckBox, CustomAgGridReact, AgGridActions } from '@wings-shared/custom-ag-grid';
import {
  withRouter,
  Utilities,
  UIStore,
  ISelectOption,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { withTheme } from '@material-ui/core';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, takeUntil } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import { EventTypeModel, EventTypeStore, EVENTTYPE_FILTERS } from '../Shared';
import { action, observable } from 'mobx';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';

interface Props {
  eventTypeStore: EventTypeStore;
}

const filtersSetup: IBaseGridFilterSetup<EVENTTYPE_FILTERS> = {
  defaultPlaceHolder: 'Search by Name',
  filterTypesOptions: Object.values(EVENTTYPE_FILTERS),
  defaultFilterType: EVENTTYPE_FILTERS.NAME,
};

@inject('eventTypeStore')
@observer
class EventType extends BaseGrid<Props, EventTypeModel> {
  @observable filterEventTypes: EventTypeModel[] = [];
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    this.props.eventTypeStore
      .getEventTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(eventTypes => (this.data = eventTypes));
  }

  /* istanbul ignore next */
  private removeEventType(rowIndex: number): void {
    ModalStore.close();
    const eventType: EventTypeModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.eventTypeStore
      .removeEventType(eventType)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ eventType ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 250,
    },
    {
      headerName: 'Category',
      field: 'category',
      minWidth: 300,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Sub Category',
      field: 'subCategory',
      minWidth: 300,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Public Enabled',
      field: 'publicEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'System Enabled',
      field: 'systemEnabled',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      sortable: false,
      filter: false,
      maxWidth: 210,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => [
          {
            title: 'Edit',
            action: GRID_ACTIONS.EDIT,
            to: node => `/notifications/eventTypes/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Delete',
            isHidden: node.data.systemCreated,
            action: GRID_ACTIONS.DELETE,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => this.gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      doesExternalFilterPass: node => {
        const { name } = node.data as EventTypeModel;
        return (
          !name ||
          this._isFilterPass({
            [EVENTTYPE_FILTERS.NAME]: name,
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
        checkBoxRenderer: AgGridCheckBox,
      },
    };
  }

  private get rightContent(): ReactNode {
    return (
      <CustomLinkButton
        variant="contained"
        startIcon={<AddIcon />}
        to={VIEW_MODE.NEW.toLowerCase()}
        title="Add Event Type"
        disabled={this.isProcessing}
      />
    );
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    if (Utilities.isEqual(gridAction, GRID_ACTIONS.DELETE)) {
      this.confirmRemoveEventType(rowIndex);
    }
  }

  @action
  private confirmRemoveEventType(rowIndex: number): void {
    const model: EventTypeModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this EventType?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeEventType(rowIndex)}
      />
    );
  }

  render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as EVENTTYPE_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
          isHideSearchSelectControl={true}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default withRouter(withTheme(EventType));
export { EventType as PureEventType };
