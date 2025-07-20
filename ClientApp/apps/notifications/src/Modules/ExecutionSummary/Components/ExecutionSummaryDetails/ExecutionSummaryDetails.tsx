import React, { ReactNode } from 'react';
import { CustomAgGridReact, BaseGrid, AgGridGroupHeader, AgGridActions } from '@wings-shared/custom-ag-grid';
import { action } from 'mobx';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { styles } from './ExecutionSummaryDetails.style';
import { Theme, withStyles } from '@material-ui/core';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { ExecutionEntry, ExecutionSummaryStore, SubscriptionStore } from '../../../Shared';
import { ExecutionSummaryModel } from '@wings/notifications/src/Modules';
import { ArrowBack } from '@material-ui/icons';
import PreviewDialog from '../PreviewDialog/PreviewDialog';
import PreviewDetailsDialog from '../PreviewDialog/PreviewDetailsDialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IClasses, UIStore, withRouter, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  executionSummaryStore?: ExecutionSummaryStore;
  subscriptionStore: SubscriptionStore;
  params?: { id: number; eventId: number };
};

@inject('executionSummaryStore', 'subscriptionStore')
@observer
class ExecutionSummaryDetails extends BaseGrid<Props, ExecutionEntry> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadInitialData();
  }

  /* istanbul ignore next */
  @action
  private loadInitialData(): void {
    UIStore.setPageLoader(true);
    if (this.props.params?.id) {
      this.props.executionSummaryStore?.getExecutionSummaryByEventId(this.props.params?.id)
        .pipe(finalize(() => UIStore.setPageLoader(false)))
        .subscribe((data: ExecutionSummaryModel) => this.data = data.executionEntry)
      return;
    }
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Subscription Value',
      field: 'subscriptionValue',
    },
    {
      headerName: 'Delivery Type',
      field: 'deliveryType',
    },
    {
      headerName: 'Result',
      field: 'result',
    },
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      maxWidth: 130,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        getEditableState: () => false,
        showPreviewIcon: (node) => Boolean(node.data.deliveredContent),
        onAction: this.gridActions,
      },
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
            title: 'Subscription Details',
            action: GRID_ACTIONS.DETAILS,
          },
          {
            title: 'View Subscription',
            action: GRID_ACTIONS.VIEW,
            to: node => {
              return `/notifications/user-subscriptions?searchContact=${node.data.subscriptionValue}`;
            },
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
          onAction: (action: GRID_ACTIONS, rowIndex: number) => { },
        },
      }),
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
      pagination: true,
    };
  }

  private gridActions(gridAction: GRID_ACTIONS, rowIndex: number, node: any): void {
    if (rowIndex === null) {
      return;
    }
    if (gridAction === GRID_ACTIONS.PREVIEW) {
      ModalStore.open(
        <PreviewDialog executionEntry={node.data as ExecutionEntry} />
      );
    }
    if (gridAction === GRID_ACTIONS.DETAILS) {
      this.getSubscriptionDetails(node);
    }
  }

  /* istanbul ignore next */
  private getSubscriptionDetails(node: any) {
    this.props.subscriptionStore
      .getSubscriptionByIdentifier(node.data.subscriptionIdentifier)
      .subscribe(data => {
        ModalStore.open(<PreviewDetailsDialog details={data} title='Subscription Details' />);
      });
  }

  private navigateRoute(): string {
    const eventId = this.props.params?.eventId;
    if (!eventId) {
      return '/notifications/execution-summary';
    }
    return `/notifications/events/${eventId}/execution-summary`;
  }

  render(): ReactNode {
    const classes  = this.props.classes as IClasses;
    return (
      <>
        <div className={classes.headerContainer}>
          <CustomLinkButton
            to={this.navigateRoute()}
            title='Execution Summary'
            startIcon={<ArrowBack />}
          />
        </div>
        <CustomAgGridReact rowData={this.data} gridOptions={this.gridOptions}
        />
      </>
    )
  }
}

export default withRouter(withStyles(styles)(ExecutionSummaryDetails));
export { ExecutionSummaryDetails as PureExecutionSummary };
