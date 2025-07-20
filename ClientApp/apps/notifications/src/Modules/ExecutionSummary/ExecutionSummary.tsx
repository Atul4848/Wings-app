import React, { ReactNode } from 'react';
import { CustomAgGridReact, BaseGrid, AgGridActions, AgGridGroupHeader } from '@wings-shared/custom-ag-grid';
import {
  Utilities,
  DATE_FORMAT,
  withRouter,
  UIStore,
  IClasses,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { action } from 'mobx';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { Theme } from '@material-ui/core';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { EventStore, EXCUTION_SUMMARY, ExecutionSummaryStore } from '../Shared';
import { ExecutionSummaryModel } from '@wings/notifications/src/Modules';
import moment from 'moment';
import { ArrowBack } from '@material-ui/icons';
import { NavigateFunction } from 'react-router';
import PreviewDetailsDialog from './Components/PreviewDialog/PreviewDetailsDialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { CustomLinkButton } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  executionSummaryStore?: ExecutionSummaryStore;
  eventStore?: EventStore;
  params?: { eventId: number };
  navigate?: NavigateFunction;
};

const filtersSetup: IBaseGridFilterSetup<EXCUTION_SUMMARY> = {
  defaultPlaceHolder: 'Search by Event Guid',
  filterTypesOptions: Object.values(EXCUTION_SUMMARY),
  defaultFilterType: EXCUTION_SUMMARY.EVENT_GUID,
};

@inject('executionSummaryStore', 'eventStore')
@observer
class ExecutionSummary extends BaseGrid<Props, ExecutionSummaryModel> {
  constructor(props) {
    super(props, filtersSetup);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  @action
  private loadInitialData(): void {
    UIStore.setPageLoader(true);
    const eventId  = this.props.params?.eventId;
    if (eventId) {
      this.props.executionSummaryStore
        ?.getExecutionSummaryByEventId(eventId)
        .pipe(finalize(() => UIStore.setPageLoader(false)))
        .subscribe((data: ExecutionSummaryModel) => (this.data = [ data ]));
      return;
    }

    this.props.executionSummaryStore
      ?.getExecutionSummary()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: ExecutionSummaryModel[]) => (this.data = data));
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Created On',
      field: 'createdOn',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment
            .utc(value)
            .local()
            .format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
    {
      headerName: 'Event Type',
      field: 'eventType',
    },
    {
      headerName: 'Event Guid',
      field: 'eventGuid',
    },
    {
      headerName: 'Subscriptions Affected',
      field: 'subscriptionsAffected',
    },
    {
      headerName: 'Start Time',
      field: 'startTime',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment
            .utc(value)
            .local()
            .format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
    {
      headerName: 'End Time',
      field: 'endTime',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment
            .utc(value)
            .local()
            .format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
    {
      headerName: 'Message',
      field: 'message',
    },
    {
      headerName: 'Result',
      field: 'result',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          {
            title: 'Entry Summary',
            action: GRID_ACTIONS.VIEW,
            to: node => {
              const eventId = this.props.params?.eventId;
              const navigateRoute: string = eventId
                ? `/notifications/execution-summary/${node.data.eventId}/${eventId}`
                : `/notifications/execution-summary/${node.data.eventId}`;
              return navigateRoute;
            },
          },
          {
            title: 'Event Model',
            action: GRID_ACTIONS.PREVIEW,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          this.gridActions(action, rowIndex, node);
        },
      },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    return {
      ...this._gridOptionsBase({
        context: this,
        columnDefs: this.columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => this.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      doesExternalFilterPass: node => {
        const { executionSummaryId, eventGuid } = node.data as ExecutionSummaryModel;
        return (
          !executionSummaryId ||
          this._isFilterPass({
            [EXCUTION_SUMMARY.EVENT_GUID]: eventGuid,
          })
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
      pagination: true,
      onRowDoubleClicked: node => {
        const eventId = this.props.params?.eventId;
        const navigateRoute: string = eventId
          ? `/notifications/execution-summary/${node.data.eventId}/${eventId}`
          : `/notifications/execution-summary/${node.data.eventId}`;
        this.props.navigate && this.props.navigate(navigateRoute);
      },
    };
  }

  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number, node: any): void {
    if (rowIndex === null) {
      return;
    }

    if (gridAction === GRID_ACTIONS.PREVIEW) {
      this.getEventModel(node);
    }
  }

  /* istanbul ignore next */
  private getEventModel(node: any) {
    this.props.eventStore?.loadEventById(node.data.eventId).subscribe(
      data => {
        ModalStore.open(<PreviewDetailsDialog details={data.serialize()} title="Event Model" />);
      },
      err => AlertStore.critical(err.message)
    );
  }

  private get backButton(): ReactNode {
    const eventId = this.props.params?.eventId;
    if (!eventId) {
      return null;
    }
    return <CustomLinkButton to="/notifications/events" title="Events" startIcon={<ArrowBack />} />;
  }

  render(): ReactNode {
    return (
      <>
        <SearchHeader
          backButton={this.backButton}
          searchPlaceHolder={this.searchPlaceHolder}
          searchTypeValue={this.selectedOption}
          searchTypeOptions={this._selectOptions}
          onSearchTypeChange={selectedOption => this._setSelectedOption(selectedOption as EXCUTION_SUMMARY)}
          onSearch={(searchValue: string) => this._setSearchValue(searchValue)}
          isHideSearchSelectControl={true}
        />
        <CustomAgGridReact rowData={this.data} gridOptions={this.gridOptions} />
      </>
    );
  }
}

export default withRouter(ExecutionSummary);
export { ExecutionSummary as PureExecutionSummary };
