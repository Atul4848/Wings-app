import { IconButton } from '@material-ui/core';
import { AllOutOutlined, CloudDownloadOutlined } from '@material-ui/icons';
import { useUnsubscribe } from '@wings-shared/hooks';
import { GridPagination } from '@wings-shared/core';
import {
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { GridOptions, MenuItemDef } from 'ag-grid-community';
import { observer, useLocalStore } from 'mobx-react';
import React, { FC, RefObject, useImperativeHandle } from 'react';
import { Fields } from '@react-awesome-query-builder/material';
import { finalize, takeUntil } from 'rxjs/operators';
import { IGqlStore, INoSqlAPIRequest } from '../../Interfaces';
import {
  GraphQLStore,
  generateColumns,
  flattenDataObject,
  generateFlatData,
} from '../../Tools';
import { utils, writeFile } from 'xlsx';
import { useStyles } from '../../GqlContainer.styles';

export type AgGridViewRef = {
  loadData: (params: INoSqlAPIRequest) => void;
  setColumnDefs: (fields: Fields) => void;
  resetGridData: () => void;
};

type Props = {
  store: IGqlStore;
  disableExport: boolean;
  ref?: RefObject<AgGridViewRef>; // Coming from HOC withState
};

const AgGridView = ({ ...props }, ref) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid([], gridState);

  // Local Observable State For Grid Params
  const gridParams = useLocalStore(() => ({ data: {} }));

  // Make functions assessable to the parent component
  useImperativeHandle(
    ref,
    () => ({
      loadData: (params) => {
        gridParams.data = params;
        loadData(params);
      },
      // Reset Grid Data On Collection Change
      resetGridData: () => {
        const { pageSize } = gridState.pagination;
        gridState.setPagination(new GridPagination({ pageSize }));
        gridState.setGridData([]);
      },
      setColumnDefs: (fields) => {
        gridState.gridApi.setColumnDefs([]);
        const fieldDefs = generateColumns(fields, '');
        gridState.gridApi.setColumnDefs(fieldDefs);
      },
    }),
    []
  );

  // Closing Params From State And Function Params
  const loadData = (params: INoSqlAPIRequest) => {
    props.store.showLoader();
    // Do not change this { ...gridParams.data, ...params }
    GraphQLStore.loadGqlData({
      pageSize: gridState.pagination.pageSize,
      pageNumber: gridState.pagination.pageNumber,
      ...gridParams.data,
      ...params,
      projections: JSON.stringify(props.store.projections),
    })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => props.store.hideLoader())
      )
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        const flatData = generateFlatData(response.results);
        gridState.setGridData(flatData);
      });
  };

  // Closing Params From State And Function Params
  const downloadExcel = () => {
    props.store.showLoader();
    GraphQLStore.loadGqlData({
      ...gridParams.data,
      pageSize: gridState.pagination.totalNumberOfRecords, // Get All records
      pageNumber: 1,
      projections: JSON.stringify(props.store.projections),
    })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => props.store.hideLoader())
      )
      .subscribe(response => {
        const flatData = generateFlatData(response.results);
        const data = flatData.map(x => flattenDataObject(x, ''));
        // Create a new workbook
        const workbook = utils.book_new();
        // Add a worksheet to the workbook
        const worksheet = utils.json_to_sheet(data);
        // Add the worksheet to the workbook
        utils.book_append_sheet(workbook, worksheet, 'Data');
        // Write the workbook to a file
        writeFile(workbook, 'data.xlsx');
      });
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: [],
    });
    return {
      ...baseOptions,
      groupHeaderHeight: 40,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      getContextMenuItems: (params) => {
        if (!Array.isArray(params.defaultItems)) {
          return params.defaultItems;
        }
        // Find the index of the export item
        const exportItems: (string | MenuItemDef)[] = params.defaultItems
          .slice()
          .filter((item) => item !== 'export');
        return exportItems.concat({
          // custom item
          name: 'Export To Excel',
          icon: '<span class="ag-icon ag-icon-excel" unselectable="on" role="presentation"></span>',
          action: () => downloadExcel(),
        });
      },
    };
  };

  return (
    <>
      <IconButton onClick={agGrid.autoSizeColumns}>
        <AllOutOutlined />
      </IconButton>
      <IconButton
        onClick={downloadExcel}
        disabled={!Boolean(gridState.data?.length) || props.disableExport}
      >
        <CloudDownloadOutlined />
      </IconButton>
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadData}
        classes={{ customHeight: classes.customHeight }}
      />
    </>
  );
};

export default observer(React.forwardRef(AgGridView)) as FC<Props>;
