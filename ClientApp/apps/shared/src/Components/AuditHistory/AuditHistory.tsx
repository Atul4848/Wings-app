import React, { ReactNode } from 'react';
import { ColDef, GridOptions, RowGroupOpenedEvent } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { styles } from './AuditHistory.styles';
import { withStyles } from '@material-ui/styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuditHistoryModel, DATE_FORMAT, IClasses, Utilities } from '@wings-shared/core';
import { BaseStore } from '../../Stores';
import { action } from 'mobx';
import { AgGridCellEditor, AgGridViewRenderer, CustomAgGridReact, BaseGrid } from '@wings-shared/custom-ag-grid';

interface Props {
  title: string;
  entityId: number;
  entityType: string;
  baseUrl: string;
  schemaName?: string; // schema name is require to get data in filter collection
  headers?: any; //pass different module header and subscription key
  classes: IClasses;
}

@observer
class AuditHistory extends BaseGrid<Props, AuditHistoryModel> {
  private baseStore: BaseStore = new BaseStore();

  componentDidMount() {
    this.loadAuditHistory();
  }

  /* istanbul ignore next */
  @action
  private loadAuditHistory(): void {
    const { entityId, entityType, baseUrl, schemaName, headers } = this.props;
    this.loader.showLoader();
    this.baseStore
      .loadAuditHistory(entityId, entityType, baseUrl, schemaName, headers)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loader.hideLoader())
      )
      .subscribe(response => (this.data = response));
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'Changed Date',
      field: 'modifiedOn',
      minWidth: 160,
      maxWidth: 160,
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN),
    },
    {
      headerName: 'Changed By',
      field: 'modifiedBy',
      minWidth: 130,
    },
    {
      headerName: 'Changed Field',
      field: 'columnName',
      sortable: false,
      minWidth: 140,
      hide: true,
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      sortable: false,
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      sortable: false,
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    const baseOptions: Partial<GridOptions> = this._gridOptionsBase({
      context: this,
      columnDefs: this.columnDefs,
    });

    return {
      ...baseOptions,
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Event (Changed Field)',
        field: 'event',
        cellRenderer: 'agGroupCellRenderer',
        sortable: false,
        minWidth: 170,
        valueFormatter: ({ data }) => data?.event || data?.columnName || '',
        cellRendererParams: {
          suppressCount: true,
        },
      },
      defaultColDef: {
        filter: true,
        ...baseOptions.defaultColDef,
      },
      onRowGroupOpened: (param: RowGroupOpenedEvent) => {
        param.columnApi.autoSizeColumns([ 'modifiedBy', 'columnName' ]);
      },
      frameworkComponents: {
        customCellEditor: AgGridCellEditor,
        viewRenderer: AgGridViewRenderer,
      },
    };
  }

  private get dialogContent(): ReactNode {
    const { classes } = this.props;
    return (
      <CustomAgGridReact
        classes={{ gridContainer: classes.gridContainer }}
        rowData={this.data}
        gridOptions={this.gridOptions}
      />
    );
  }

  public render(): ReactNode {
    const { classes, title } = this.props;
    return (
      <Dialog
        title={`Audit History ${title && `(${title})`}`}
        open={true}
        isLoading={() => this.loader.isLoading}
        classes={{ paperSize: classes.paperSize }}
        onClose={() => ModalStore.close()}
        dialogActions={() => <></>}
        dialogContent={() => this.dialogContent}
      />
    );
  }
}
export default withStyles(styles)(AuditHistory);
