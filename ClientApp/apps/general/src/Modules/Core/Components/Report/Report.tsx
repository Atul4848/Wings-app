import React, { FC, useEffect } from 'react';
import { styles } from './Report.styles';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { ReportSummaryStore } from '../../../Shared';
import { ReportSummaryModel } from '@wings/general/src/Modules';
import moment from 'moment';
import { DATE_FORMAT, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import {
  AgGridViewRenderer,
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  reportSummaryStore?: ReportSummaryStore;
}

const Report: FC<Props> = ({ reportSummaryStore }: Props) => {
  const _reportSummaryStore = reportSummaryStore as ReportSummaryStore;
  const gridState = useGridState();
  const agGrid = useAgGrid<any, ReportSummaryModel>([], gridState);
  const classes: Record<string, string> = styles();

  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _reportSummaryStore
      ?.getReportSummary()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: ReportSummaryModel[]) => (gridState.setGridData(data)));
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'App Name',
      field: 'appName',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'NameSpace',
      field: 'nameSpace',
    },
    {
      headerName: 'Generated On',
      field: 'generatedOn',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment.utc(value).local().format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: {},
        columnDefs: columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: () => { },
        },
      }),

      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: 'Key Group',
              field: 'keyGroup',
            },
            {
              headerName: 'Controller Name',
              field: 'controllerName',
            },
            {
              headerName: 'Method Name',
              field: 'methodName',
            },
            {
              headerName: 'Route',
              field: 'route',
            },
          ],
          defaultColDef: { flex: 1 },
          frameworkComponents: {
            viewRenderer: AgGridViewRenderer,
          },
        },
        getDetailRowData: function (params) {
          params.successCallback(params.data.reports);
        },
      },

      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
    };
  }

  return (
    <div className={classes.mainroot}>
      <div className={classes.mainContent}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
      </div>
    </div>
  );
};

export default inject('reportSummaryStore')(observer(Report));
