import React, { FC, useEffect, useRef, RefObject, useState, useMemo } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridActionButton,
  AgGridChipViewStatus,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { IAPIPagedUserRequest, ApplicationsModel, ApplicationsStore } from '../Shared';
import { LOGS_FILTERS } from '../Shared/Enums';
import {
  GridPagination,
  IAPIGridRequest,
  UIStore,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
} from '@wings-shared/core';
import { CustomLinkButton } from '@wings-shared/layout';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { AuthStore, usePermissions, useRoles } from '@wings-shared/security';
import { styles } from './Applications.styles';
import { Palette } from '@material-ui/core/styles/createPalette';

interface Props {
  applicationStore?: ApplicationsStore;
}


const Applications: FC<Props> = ({ applicationStore }: Props) => {
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const agGrid = useAgGrid<LOGS_FILTERS, ApplicationsModel>([], gridState);
  const classes: Record<string, string> = styles();
  const _applicationStore = applicationStore as ApplicationsStore;
  const searchHeaderRef = useRef<ISearchHeaderRef>();

  useEffect(() => {
    loadInitialData();
  }, []);

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      ...pageRequest,
      q: searchHeaderRef.current?.searchValue,
      sort: 'name',
    };
    pagedUserRequest = {
      searchCollection: JSON.stringify([{ propertyName: 'name', propertyValue: searchHeaderRef.current?.searchValue }]),
    };
    UIStore.setPageLoader(true);
    _applicationStore
      .getApplications(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        agGrid.reloadColumnState();
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Application Name',
      field: 'name',
    },
    {
      headerName: 'Application Id',
      field: 'id',
    },
    {
      headerName: 'Okta Client Id',
      field: 'oktaClientId',
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
      },
      minWidth: 800,
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      maxWidth: 150,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isHidden: () => false,
        isDisabled: () => !hasWritePermission,
        to: node => `/user-management/applications/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
        edit: true,
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: () => { },
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => false,
      frameworkComponents: {
        agGridChipViewStatus: AgGridChipViewStatus,
        customHeader: AgGridGroupHeader,
        actionButtonRenderer: AgGridActionButton,
      },
      onGridReady: (event: GridReadyEvent) => {
        event.api.setDatasource({ getRows: () => loadInitialData() });
        gridState.gridApi = event.api;
        gridState.columnApi = event.columnApi;
      },
      pagination: false,
    };
  }

  return (
    <div className={classes.userListContainer}>
      <div className={classes.applicationsListContainer}>
        <div className={classes.headerContainer}>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[]}
            onResetFilterClick={() => {
              agGrid.cancelEditing(0);
              agGrid.filtersApi.resetColumnFilters();
            }}
            onFilterChange={isInitEvent =>
              loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
            }
            disableControls={Boolean(Array.from(gridState.columFilters).length)}
          />
          <div className={classes.flexSection}>
            <CustomLinkButton
              variant="contained"
              to={VIEW_MODE.NEW.toLowerCase()}
              title="Create New Application"
              disabled={!hasWritePermission}
            />
          </div>
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
            onPaginationChange={request => loadInitialData(request)}
          />
        </div>
      </div>
    </div>
  );
};

export default inject('applicationStore')(observer(Applications));
