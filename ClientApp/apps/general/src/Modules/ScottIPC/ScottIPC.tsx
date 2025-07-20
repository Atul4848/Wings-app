import React, { FC, ReactNode, RefObject, useEffect, useMemo, useRef } from 'react';
import { IAPIPagedUserRequest, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { action } from 'mobx';
import { useStyles } from './ScottIPC.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles, Typography, Theme } from '@material-ui/core';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt'; //
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, RowNode, GridReadyEvent } from 'ag-grid-community';
import { ScottIPCModel } from '../Shared/Models/ScottIPC.model';
import { SCOTTIPC_FILTERS, ScottIPCStore, IAPIUpsertScottIPCRequest } from '../Shared';
import UpsertScottIPC from './Components/UpsertScottIPC/UpsertScottIPC';
import CappsPersons from './Components/CappsPersons/CappsPersons';
import {
  GridPagination,
  IAPIGridRequest,
  IClasses,
  UIStore,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
  SearchStore,
} from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeader, SearchHeaderV2 } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';
import { AuthStore } from '@wings-shared/security';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  scottIPCStore?: ScottIPCStore;
};

const filtersSetup: IBaseGridFilterSetup<SCOTTIPC_FILTERS> = {
  defaultPlaceHolder: 'Search Users',
  filterTypesOptions: Object.values(SCOTTIPC_FILTERS),
  defaultFilterType: SCOTTIPC_FILTERS.ALL,
};

const ScottIPC: FC<Props> = ({ scottIPCStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<SCOTTIPC_FILTERS, ScottIPCModel>([], gridState);
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

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: searchHeaderRef.current?.searchValue,
    };
    pagedUserRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'uwaAccountNumber', propertyValue: searchHeaderRef.current?.searchValue },
      ]),
    };
    UIStore.setPageLoader(true);
    scottIPCStore
      ?.getScottIpc(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'UWA Customer Number',
      field: 'uwaAccountNumber',
    },
    {
      headerName: 'Scott IPC User ID',
      field: 'sipcUserId',
    },
    {
      headerName: 'Scott IPC Name',
      field: 'sipcName',
    },
    {
      headerName: 'Captain Name',
      field: 'captainName',
    },
    {
      headerName: 'CAPPS Person ID',
      field: 'crewPaxId',
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
          { title: 'Edit', action: GRID_ACTIONS.EDIT, isDisabled: !hasAnyPermission },
          { title: 'Search CAPPS Person', action: GRID_ACTIONS.PREVIEW, isDisabled: !hasAnyPermission },
          { title: 'Delete', action: GRID_ACTIONS.DELETE, isDisabled: !hasAnyPermission },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const deleteScottIpc = (sipc: ScottIPCModel): void => {
    UIStore.setPageLoader(true);
    scottIPCStore
      ?.deleteScottIpc(sipc.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ sipc ]);
          AlertStore.info('Scott IPC user mapping deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const sipc = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openScottIpcDialog(VIEW_MODE.EDIT, sipc);
    }

    if (gridAction === GRID_ACTIONS.PREVIEW) {
      openCappsPersonsDialog(VIEW_MODE.PREVIEW, sipc);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this Scott IPC mapping?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteScottIpc(sipc)}
        />
      );
    }
  }

  const upsertScottIpc = (upsertScottIPCRequest: IAPIUpsertScottIPCRequest): void => {
    UIStore.setPageLoader(true);
    scottIPCStore
      ?.upsertScottIpc(upsertScottIPCRequest)
      .pipe(
        switchMap(() => scottIPCStore.getScottIpc()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.data = response.results),
        error: (error: AxiosError) => AlertStore.info(error.message),
      });
  }

  const openCappsPersonsDialog = (mode: VIEW_MODE, sipc?: ScottIPCModel): void => {
    ModalStore.open(
      <CappsPersons
        scottIPCStore={scottIPCStore}
        viewMode={mode}
        sipc={sipc}
        upsertScottIpc={(upsertScottIPCRequest: IAPIUpsertScottIPCRequest) =>
          upsertScottIpc(upsertScottIPCRequest)
        }
      />
    );
  }

  const openScottIpcDialog = (mode: VIEW_MODE, sipc?: ScottIPCModel): void => {
    ModalStore.open(
      <UpsertScottIPC
        scottIPCStore={scottIPCStore}
        viewMode={mode}
        sipc={sipc}
        upsertScottIpc={(upsertScottIPCRequest: IAPIUpsertScottIPCRequest) =>
          upsertScottIpc(upsertScottIPCRequest)
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
      isExternalFilterPresent: () => false,
      onGridReady: (event: GridReadyEvent) => {
        event.api.setDatasource({ getRows: () => loadInitialData() });
        gridState.setGridApi(event.api);
        gridState.setColumnApi(event.columnApi);
      },
    };
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.subSection}>
          <PeopleAltIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Scott IPC Mappings
          </Typography>
        </div>
        <div>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[]}
            hasSelectInputsValues={false}
            onFilterChange={isInitEvent =>
              loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
            }
            onExpandCollapse={agGrid.autoSizeColumns}
          />
        </div>
        <div>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasAnyPermission}
            onClick={() => openScottIpcDialog(VIEW_MODE.NEW, new ScottIPCModel())}
            startIcon={<AddIcon />}
          >
          Add Scott IPC Mappings
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainRoot}>
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
    </>
  );
}

export default inject('scottIPCStore')(observer(ScottIPC));
