import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { useStyles } from './RetailData.style';
import { Typography, Theme } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { inject, observer } from 'mobx-react';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import UpsertRetailData from './Components/UpsertRetailData/UpsertRetailData';
import { IAPIRetailDataOptionsResponse, RetailDataModel, RetailDataOptions, RetailDataStore } from '../Shared';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import moment from 'moment';
import { DatabaseIcon } from '@uvgo-shared/icons';
import { DATE_FORMAT, UIStore, Utilities, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import {
  AgGridViewRenderer,
  CustomAgGridReact,
  AgGridActions,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  theme?: Theme;
  retailDataStore?: RetailDataStore;
};

const RetailData: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<RetailDataModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    props.retailDataStore
      ?.getRetailData()
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: RetailDataModel[]) => {
        gridState.setGridData(data);
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Job Id',
      field: 'id',
    },
    {
      headerName: 'User Name',
      field: 'username',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment.utc(value).local().format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
    {
      headerName: 'End Date',
      field: 'endDate',
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'viewRenderer',
      filter: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data),
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
        actionMenus: () => [{ title: 'Selections', action: GRID_ACTIONS.EDIT }],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    const retailData = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openRetailDataDialog(VIEW_MODE.EDIT, gridState.data.find(x => retailData.id == x.id)?.option);
    }
  }

  const upsertRetailData = (upsertRetailDataOptionsResponse: IAPIRetailDataOptionsResponse): void => {
    const { retailDataStore } = props;
    UIStore.setPageLoader(true);
    retailDataStore
      ?.upsertRetailData(upsertRetailDataOptionsResponse)
      .pipe(
        switchMap(() => retailDataStore.getRetailData()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.data = response),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  }

  const openRetailDataDialog = (mode: VIEW_MODE, retailData?: RetailDataOptions): void => {
    const { retailDataStore } = props;
    ModalStore.open(
      <UpsertRetailData
        retailDataStore={retailDataStore}
        viewMode={mode}
        retailData={retailData}
        upsertRetailData={(upsertRetailDataOptionsResponse: IAPIRetailDataOptionsResponse) =>
          upsertRetailData(upsertRetailDataOptionsResponse)
        }
      />
    );
  }

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: this,
        columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      frameworkComponents: {
        viewRenderer: AgGridViewRenderer,
        actionRenderer: AgGridActions,
      },
      pagination: true,
    };
  }

  const viewRenderer = (rowData: RetailDataModel): ReactNode => {
    let node: ReactNode;
    switch (rowData.status) {
      case 'ENQUEUED':
        node = <div className={classes.enqueued}>Enqueued</div>;
        break;
      case 'PROCESSING':
        node = <div className={classes.processing}>Processing</div>;
        break;
      case 'COMPLETED':
        node = <div className={classes.completed}>Completed</div>;
        break;
      default:
        node = <div className={classes.failed}>Failed</div>;
        break;
    }
    return node;
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <DatabaseIcon />
          <Typography component="h3" className={classes.heading}>
            Retail Data
          </Typography>
        </div>
        <div>
          <PrimaryButton
            variant="contained"
            color="primary"
            onClick={() => openRetailDataDialog(VIEW_MODE.NEW, new RetailDataOptions())}
          >
            Run Retail Data
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
        </div>
      </div>
    </>
  );
}

export default inject('retailDataStore')(observer(RetailData));
