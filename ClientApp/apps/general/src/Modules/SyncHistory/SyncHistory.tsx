import React, { FC, ReactNode, RefObject, useEffect, useRef } from 'react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { styles } from './SyncHistory.styles';
import { Typography } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { ColDef, ColGroupDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { SYNCHISTORY_FILTERS, SyncHistoryStore, SyncHistoryModel, SyncHistoryDataSyncModel } from '../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import SyncHistoryChanges from './Components/SyncHistory-Changes/SyncHistoryChanges';
import moment from 'moment';
import HistoryIcon from '@material-ui/icons/History';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { DATE_FORMAT, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import {
  AgGridCellEditor,
  AgGridViewRenderer,
  CustomAgGridReact, 
  useGridState, useAgGrid,
  agGridUtilities
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  syncHistoryStore?: SyncHistoryStore;
}

const SyncHistory: FC<Props> = ({ syncHistoryStore }: Props) => {
  const _syncHistoryStore = syncHistoryStore as SyncHistoryStore;
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<any, SyncHistoryModel>([], gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const classes: Record<string, string> = styles();

  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (): void => {
    UIStore.setPageLoader(true);
    _syncHistoryStore
      ?.getSyncHistory(100)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(syncHistoryStore => (gridState.setGridData(syncHistoryStore)));
  }

  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Trip Number',
      field: 'tripNumber',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'TripId',
      field: 'tripId',
    },
    {
      headerName: 'CreationDate',
      field: 'creationDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(moment.utc(value).format(DATE_FORMAT.API_FORMAT), DATE_FORMAT.SDT_DST_FORMAT),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {

    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => { },
      },
    });

    return {
      ...baseOptions,
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      doesExternalFilterPass: node => {
        const { tripId, tripNumber } = node.data as SyncHistoryModel;
        const searchHeader = searchHeaderRef.current;

        if (!searchHeader) {
          return false;
        }
        return agGrid.isFilterPass({
          [SYNCHISTORY_FILTERS.ALL]: [ tripNumber.toString(), tripId.toString() ],
          [SYNCHISTORY_FILTERS.TRIP_NUMBER]: tripNumber.toString(),
          [SYNCHISTORY_FILTERS.TRIP_ID]: tripId.toString(),
        },
        searchHeader.searchValue,
        searchHeader.selectedOption);
      },

      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: 'Job Id',
              field: 'jobId',
            },
            {
              headerName: 'DataSync Date',
              field: 'dataSyncDate',
              valueFormatter: ({ value }: ValueFormatterParams) =>
                Utilities.getformattedDate(
                  moment.utc(value).format(DATE_FORMAT.API_FORMAT),
                  DATE_FORMAT.SDT_DST_FORMAT
                ),
            },
            {
              headerName: 'Sync Type',
              field: 'syncType',
            },
            {
              headerName: 'Changes',
              field: 'action',
              cellRenderer: 'viewRenderer',
              filter: false,
              minWidth: 100,
              cellRendererParams: {
                getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data),
              },
            },
            {
              headerName: 'OnHold',
              field: 'isOnHold',
            },
            {
              headerName: 'Dbo Update',
              field: 'updatedInDbo',
            },
            {
              headerName: 'Dirty',
              field: 'isDirty',
            },
            {
              headerName: 'Locked',
              field: 'isLocked',
            },
            {
              headerName: 'Hash Expired',
              field: 'hashExpired',
            },
            {
              headerName: 'Hash Exists',
              field: 'hashExists',
            },
            {
              headerName: 'Hash Different',
              field: 'isHashDifferent',
            },
            {
              headerName: 'Dbo Exist',
              field: 'existOnDbo',
            },
            {
              headerName: 'Exist Cache',
              field: 'existOnCache',
            },
            {
              headerName: 'Username',
              field: 'username',
            },
          ],
          defaultColDef: { flex: 1 },
          frameworkComponents: {
            viewRenderer: AgGridViewRenderer,
          },
        },
        getDetailRowData: function (params) {
          params.successCallback(params.data.dataSyncs);
        },
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customCellEditor: AgGridCellEditor,
      },
    };
  }

  const viewRenderer = (rowData: SyncHistoryDataSyncModel): ReactNode => {
    return (
      <PrimaryButton variant="contained" color="primary" onClick={() => openFuelDialog(rowData)}>
        Change
      </PrimaryButton>
    );
  }

  /* istanbul ignore next */
  const openFuelDialog = (syncHistoryDataSync: SyncHistoryDataSyncModel): void => {
    ModalStore.open(<SyncHistoryChanges changes={syncHistoryDataSync.changes} />);
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <HistoryIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Sync History
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            onExpandCollapse={agGrid.autoSizeColumns}
            selectInputs={[
              agGridUtilities.createSelectOption(SYNCHISTORY_FILTERS, SYNCHISTORY_FILTERS.ALL),
            ]}
            onResetFilterClick={() => {
              agGrid.cancelEditing(0);
              agGrid.filtersApi.resetColumnFilters();
            }}
            onFilterChange={isInitEvent =>
              loadInitialData()
            }
            disableControls={Boolean(Array.from(gridState.columFilters).length)}
          />
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact
            rowData={gridState.data}
            gridOptions={gridOptions()}
            isRowEditing={gridState.isRowEditing} />
        </div>
      </div>
    </>
  );
};

export default inject('syncHistoryStore')(observer(SyncHistory));
