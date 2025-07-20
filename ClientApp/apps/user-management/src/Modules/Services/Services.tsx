import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridActionButton,
  AgGridChipViewStatus,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useStyles } from './Services.styles';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { IAPIPagedUserRequest, ServicesModel, ServicesStore } from '../Shared';
import { LOGS_FILTERS } from '../Shared/Enums';
import {
  GridPagination,
  IAPIGridRequest,
  UIStore,
  GRID_ACTIONS,
  cellStyle,
  SearchStore,
} from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';
 
type Props = {
  serviceStore?: ServicesStore;
};
 
const Services: FC<Props> = ({ serviceStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, ServicesModel>([], gridState);
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
      sort: 'Name',
    };
    pagedUserRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: searchHeaderRef.current?.searchValue },
      ]),
    };
    UIStore.setPageLoader(true);
    serviceStore
      ?.getServices(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  };
 
  const columnDefs: ColDef[] = [
    {
      headerName: 'Service Name',
      field: 'name',
    },
    {
      headerName: 'Application Name',
      field: 'applicationName',
    },
    {
      headerName: 'Description',
      field: 'description',
    },
    {
      headerName: 'Display Name',
      field: 'displayName',
    },
    {
      headerName: 'Status',
      field: 'enabled',
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
        isServicesStatus: true,
      },
      valueFormatter: ({ value }) => (Boolean(value) ? 'Enabled' : 'Disabled'),
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
        to: node => `/user-management/app-services/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
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
        <div className={classes.servicesListContainer}>
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
            </div>
          </div>
          <div className={classes.flexSection}>
            <CustomLinkButton
              variant="contained"
              to={VIEW_MODE.NEW.toLowerCase()}
              title="Create New Service"
              disabled={!hasWritePermission}
            />
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
};
 
export default inject('serviceStore')(observer(Services));