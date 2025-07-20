import React, { Component, ChangeEvent, FC } from 'react';
import { AgGridReact as AgGridReactComponent, AgGridReactProps } from 'ag-grid-react';
import { withStyles } from '@material-ui/core';
import TablePagination from '@material-ui/core/TablePagination';
import { styles } from './AgGridReact.styles';
import classNames from 'classnames';
import 'ag-grid-enterprise';
import { GridApi, RowClickedEvent } from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import { GridPagination, IClasses } from '@wings-shared/core';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props extends AgGridReactProps {
  serverPagination?: boolean;
  paginationData?: GridPagination;
  classes?: IClasses;
  onPaginationChange?: (request: { pageNumber: number; pageSize: number }) => void;
  onRowClicked?: (event: RowClickedEvent) => void;
  isRowEditing?: boolean;
  hasFooterActions?: boolean;
  disablePagination?: boolean;
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  customRowsPerPageLabel?: string;
  hidePagination?: boolean;
}
@observer
class CustomAgGridReact extends Component<Props> {
  @observable private pageSize: number = 30;
  @observable private pageNumber: number = 0;
  @observable private gridApi: GridApi = null;
  @observable private totalNumberOfRecord: number = 0;

  static defaultProps = {
    serverPagination: false,
    hidePagination: false,
    rowsPerPageOptions: [ 10, 20, 30, 50, 100 ],
    onPaginationChange: (request: { pageNumber: number; pageSize: number }) => null,
    onRowClicked: (event: RowClickedEvent) => null,
    paginationData: {
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 0,
    },
    customRowsPerPageLabel: 'Rows per page',
  };

  /* istanbul ignore next */
  componentDidMount() {
    if (this.props.gridOptions?.api) {
      this.gridApi = this.props.gridOptions.api;
    }
    // Set the onFilterChanged event handler here
    if (!this.props.serverPagination && this.gridApi) {
      this.gridApi.addEventListener('filterChanged', this.handleFilterOrDataRendered.bind(this));
      this.gridApi.addEventListener('modelUpdated', this.handleFilterOrDataRendered.bind(this));
      this.gridApi.addEventListener('firstDataRendered', this.handleFilterOrDataRendered.bind(this));
    }
  }

  /* istanbul ignore next */
  componentWillUnmount() {
    if (this.gridApi) {
      this.gridApi.removeEventListener('filterChanged', this.handleFilterOrDataRendered.bind(this));
      this.gridApi.removeEventListener('modelUpdated', this.handleFilterOrDataRendered.bind(this));
      this.gridApi.removeEventListener('firstDataRendered', this.handleFilterOrDataRendered.bind(this));
    }
  }
  
  /* istanbul ignore next */
  private handleFilterOrDataRendered(event: any) {
    this.totalNumberOfRecord = event.api?.getModel()?.getRowCount() || 0;

    if (event.type === 'filterChanged') {
      this.pageNumber = 0;
      this.gridApi.paginationGoToPage(this.pageNumber);
    }
  }

  @action
  private onChangePage = (pageNumber: number, pageSize: number) => {
    if (this.props.serverPagination) {
      this.props.onPaginationChange({ pageNumber, pageSize });
    }
    this.pageSize = pageSize;
    this.pageNumber = pageNumber;

    if (!this.gridApi) return;
    this.gridApi.paginationSetPageSize(pageSize); //Setting Ag-Grid pagesize
    this.gridApi.paginationGoToPage(pageNumber); // Setting Ag-Grid page Number
  };

  render() {
    const {
      classes,
      rowData,
      disablePagination,
      onRowClicked,
      rowsPerPageOptions,
      customRowsPerPageLabel,
      serverPagination,
      paginationData,
      isRowEditing,
      hasFooterActions,
      gridOptions,
      hidePagination,
    } = this.props;

    // Calculate the total records based on whether it's server pagination or not
    const totalNumberOfRecords = serverPagination
      ? paginationData?.totalNumberOfRecords || 0
      : this.totalNumberOfRecord;
    const totalNumberOfPages = Math.ceil(totalNumberOfRecords / this.pageSize) || 0;
    const gridClass = classNames({
      'ag-theme-alpine': true,
      [classes.gridContainer]: true,
      [classes.rowEditing]: isRowEditing,
      [classes.footerActions]: hasFooterActions,
      [classes.disablePagination]: disablePagination,
      // This class will be passed from parent component
      [classes.customHeight]: true,
    });

    const { pageNumber } = paginationData;

    const disabledNextIcon = serverPagination
      ? pageNumber >= totalNumberOfPages
      : this.pageNumber >= totalNumberOfPages - 1;

    return (
      <div className={gridClass}>
        <AgGridReactComponent
          tooltipShowDelay={0}
          gridOptions={gridOptions}
          rowData={rowData}
          masterDetail={true}
          pagination={true}
          suppressPaginationPanel={true}
          onRowClicked={event => onRowClicked && onRowClicked(event)}
        />

        {!hidePagination && (
          <TablePagination
            component="div"
            className={classes.pagination}
            count={totalNumberOfRecords}
            rowsPerPage={this.pageSize}
            labelRowsPerPage={<>{customRowsPerPageLabel} :</>}
            labelDisplayedRows={({ count, page }) => (
              <div className={classes.labelDisplayedRows}>
                <div>Total Records: {count}</div>
                <div>
                  Page {page + 1} of {totalNumberOfPages}
                </div>
              </div>
            )}
            rowsPerPageOptions={rowsPerPageOptions}
            classes={{ root: classNames({ [classes.disablePagination]: disablePagination }) }}
            nextIconButtonProps={{
              disabled: disabledNextIcon,
            }}
            backIconButtonProps={{ disabled: !serverPagination ? this.pageNumber === 0 : pageNumber === 1 }}
            page={serverPagination ? pageNumber - 1 : this.pageNumber}
            onPageChange={(_, page) => {
              return this.onChangePage(serverPagination ? page + 1 : page, this.pageSize);
            }}
            onRowsPerPageChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              this.onChangePage(serverPagination ? 1 : 0, Number(target.value))
            }
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(CustomAgGridReact) as FC<Props>;
