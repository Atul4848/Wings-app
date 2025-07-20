import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridActionButton,
  AgGridGroupHeader,
  AgGridChipViewStatus,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { Button, Theme } from '@material-ui/core';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community';
import { CustomerModel, CustomersStore } from '../Shared';
import { LOGS_FILTERS } from '../Shared/Enums';
import {
  GridPagination,
  IAPIGridRequest,
  IClasses,
  UIStore,
  GRID_ACTIONS,
  cellStyle,
  Utilities,
  DATE_FORMAT,
  SearchStore,
} from '@wings-shared/core';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { AuthStore } from '@wings-shared/security';
import { useLocation } from 'react-router';
import { useStyles } from '../Customers/Customers.styles';
import { FilterIcon } from '@uvgo-shared/icons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import FilterCustomers from './Components/FilterCustomers/FilterCustomers';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  customerStore?: CustomersStore;
};

const Customers: FC<Props> = ({ customerStore }) => {
  const gridState = useGridState();
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, CustomerModel>([], gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const classes = useStyles();

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
  }, []);

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const _searchValue = searchHeaderRef.current?.searchValue;
    const request: IAPIGridRequest = {
      ...pageRequest,
      q: _searchValue,
      sort: 'name',
      status: customerStore.customerFilter,
    };
    UIStore.setPageLoader(true);
    customerStore?.getCustomers(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Customer Name',
      field: 'name',
    },
    {
      headerName: 'Customer Number',
      field: 'number',
      maxWidth: 400,
    },
    {
      headerName: 'Status',
      field: 'status',
      maxWidth: 250,
      minWidth: 200,
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
        isString: true,
      },
    },
    {
      headerName: 'EndDate',
      field: 'endDate',
      maxWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_API_FORMAT),
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      suppressSizeToFit: true,
      suppressNavigable: true,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isHidden: () => false,
        isDisabled: () => !hasWritePermission,
        to: node => `/user-management/customers/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
        edit: true,
        onAction: () => {
          if (searchHeaderRef.current) {
            SearchStore.saveSearchData(location.pathname, {
              ...searchHeaderRef.current.getFilters(),
              pagination: gridState.pagination,
            });
          }
        },
      },
    },
  ];

  const filterCustomers = (e: any) => {
    ModalStore.open(
      <FilterCustomers
        onSetClick={({ status }) => {
          loadInitialData();
          ModalStore.close();
        }}
        anchorEl={e.currentTarget}
      />
    );
  }

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: {},
        columnDefs,
        isEditable: true,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        agGridChipViewStatus: AgGridChipViewStatus,
        customHeader: AgGridGroupHeader,
        actionButtonRenderer: AgGridActionButton,
      },
      onGridReady: (event: GridReadyEvent) => {
        event.api.setDatasource({ getRows: () => loadInitialData() });
        gridState.setGridApi(event.api);
        gridState.setColumnApi(event.columnApi);
      },
    };
  };

  return (
    <>
      <div className={classes.userListContainer}>
        <div className={classes.searchContainer}>
          <div className={classes.headerContainer}>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[]}
              hasSelectInputsValues={false}
              onFilterChange={isInitEvent =>
                loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
              }
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.filterBtn}
              onClick={(e) => filterCustomers(e)}
              startIcon={<FilterIcon />}
            ></Button>
          </div>
        </div>
        <div className={classes.mainroot}>
          <div className={classes.mainContent}>
            <CustomAgGridReact
              gridOptions={gridOptions()}
              rowData={gridState.data}
              serverPagination={true}
              paginationData={gridState.pagination}
              customRowsPerPageLabel="Page Size"
              onPaginationChange={loadInitialData}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default inject('customerStore')(observer(Customers));
