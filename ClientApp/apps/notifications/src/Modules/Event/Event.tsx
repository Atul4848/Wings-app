import { EventStore, EventModel, EVENT_FILTERS, EventTypeModel } from '../Shared';
import React, { ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { BaseGrid, CustomAgGridReact, AgGridActions } from '@wings-shared/custom-ag-grid';
import {
  withRouter,
  Utilities,
  DATE_FORMAT,
  UIStore,
  IClasses,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { finalize, takeUntil } from 'rxjs/operators';
import { action } from 'mobx';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { styles } from './Event.styles';
import { withStyles } from '@material-ui/core';
import { HubConnectionStore, NOTIFICATIONS_EVENTS } from '@wings-shared/security';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';

interface Props {
  classes?: IClasses;
  eventStore: EventStore;
}

const filtersSetup: IBaseGridFilterSetup<EVENT_FILTERS> = {
  defaultPlaceHolder: 'Search by Event Guid, Trigger Time or Status',
  filterTypesOptions: Object.values(EVENT_FILTERS),
  defaultFilterType: EVENT_FILTERS.EVENT_GUID,
};

@inject('eventStore')
@observer
class Event extends BaseGrid<Props, EventModel, EVENT_FILTERS> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
    this.subscribeToEvents();
  }

  componentWillUnmount() {
    HubConnectionStore.connection?.off(NOTIFICATIONS_EVENTS.EVENT_CREATED_LISTENER);
  }

  /* istanbul ignore next */
  private subscribeToEvents(): void {
    HubConnectionStore.connection?.on(NOTIFICATIONS_EVENTS.EVENT_CREATED_LISTENER, eventData => {
      if (eventData?.data) {
        this.flashOutRows(eventData.data.id as number, eventData.data.status as string);
      }
    });
  }

  /* istanbul ignore next */
  private loadInitialData() {
    UIStore.setPageLoader(true);
    this.props.eventStore
      .getEvents()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(events => (this.data = events));
  }

  /* istanbul ignore next */
  private flashOutRows(id: number, status: string): void {
    const rowNodes: RowNode[] = [];
    this.data = this.data.map((x, i) => {
      if (x.id === id) {
        x.status = status;
        rowNodes.push(this.gridApi.getDisplayedRowAtIndex(i) as RowNode );
        return x;
      }
      return x;
    });
    this.gridApi.redrawRows();
    this.gridApi.flashCells({ rowNodes });
  }

  /* istanbul ignore next */
  private removeEvent(rowIndex: number): void {
    ModalStore.close();
    const event: EventModel = this._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    this.props.eventStore
      .removeEvent(event)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._removeTableItems([ event ]);
            this.data = this._getAllTableRows();
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Event Guid',
      field: 'eventGuid',
    },
    {
      headerName: 'Trigger Time',
      field: 'triggerTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Event Type',
      field: 'eventType',
      minWidth: 150,
      comparator: (current: EventTypeModel, next: EventTypeModel) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Status',
      field: 'status',
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
        actionMenus: (node: RowNode) => [
          {
            title: 'Edit',
            isHidden: !Boolean(Utilities.isEqual(node.data.status, 'CREATED')),
            action: GRID_ACTIONS.EDIT,
            to: node =>
              node.data?.content
                ? `/notifications/events/${node.data?.id}/one-time/${VIEW_MODE.EDIT.toLowerCase()}`
                : `/notifications/events/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
          },
          {
            title: 'Execution Summary',
            isHidden: Boolean(Utilities.isEqual(node.data.status, 'CREATED')),
            action: GRID_ACTIONS.VIEW,
            to: node => `/notifications/events/${node.data.id}/execution-summary`,
          },
          {
            title: 'Delete',
            isHidden: false,
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
        const { id, triggerTime, eventGuid, status } = node.data as EventModel;
        return (
          !id ||
          this._isFilterPass({
            [EVENT_FILTERS.TRIGGER_TIME]: Utilities.getformattedDate(triggerTime, DATE_FORMAT.GRID_DISPLAY),
            [EVENT_FILTERS.STATUS]: status,
            [EVENT_FILTERS.EVENT_GUID]: eventGuid,
          })
        );
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
        enableCellChangeFlash: true,
      },
      cellFlashDelay: 3000,
      cellFadeDelay: 2000,
      frameworkComponents: {
        actionRenderer: AgGridActions,
      },
    };
  }

  @action
  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number): void {
    if (rowIndex === null) {
      return;
    }
    if (Utilities.isEqual(gridAction, GRID_ACTIONS.DELETE)) {
      this.confirmRemoveEvent(rowIndex);
    }
  }

  @action
  private confirmRemoveEvent(rowIndex: number): void {
    const model: EventModel = this._getTableItem(rowIndex);
    if (model.id === 0) {
      this._removeTableItems([ model ]);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Event?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.removeEvent(rowIndex)}
      />
    );
  }

  private get rightContent(): ReactNode {
    const classes  = this.props.classes as IClasses;
    return (
      <>
        <div className={classes.oneTimeEventBtn}>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={`one-time/${VIEW_MODE.NEW.toLowerCase()}`}
            title="One Time Event"
            disabled={this.isProcessing}
          />
        </div>
        <div>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={VIEW_MODE.NEW.toLowerCase()}
            title="Add Event"
            disabled={this.isProcessing}
          />
        </div>
      </>
    );
  }

  public render(): ReactNode {
    return (
      <>
        <SearchHeader
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as EVENT_FILTERS)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          rightContent={this.rightContent}
        />
        <CustomAgGridReact isRowEditing={this.isRowEditing} rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default withRouter(withStyles(styles)(Event));
export { Event as PureEvent };
