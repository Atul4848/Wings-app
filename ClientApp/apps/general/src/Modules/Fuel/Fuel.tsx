import React, { FC, ReactNode, RefObject, useEffect, useMemo, useRef } from 'react';
import { IAPIPagedUserRequest, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { action } from 'mobx';
import { useStyles } from './Fuel.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles, Typography, Theme } from '@material-ui/core';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, RowNode, ValueFormatterParams, GridReadyEvent } from 'ag-grid-community';
import { FuelModel } from '../Shared/Models/Fuel.model';
import { FUEL_FILTERS, FuelStore, IAPIUpsertFuelRequest } from '../Shared';
import UpsertFuel from './Components/UpsertFuel/UpsertFuel';
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
  fuelStore?: FuelStore;
};

const filtersSetup: IBaseGridFilterSetup<FUEL_FILTERS> = {
  defaultPlaceHolder: 'Search Fuel',
  filterTypesOptions: Object.values(FUEL_FILTERS),
  defaultFilterType: FUEL_FILTERS.ALL,
};

const Fuel: FC<Props> = ({ fuelStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<FUEL_FILTERS, FuelModel>([], gridState);
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

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: searchHeaderRef.current?.searchValue,
    };
    pagedUserRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'uwaCustomerId', propertyValue: searchHeaderRef.current?.searchValue },
      ]),
    };
    UIStore.setPageLoader(true);
    fuelStore?.getFuel(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'UWA Customer No',
      field: 'uwaCustomerId',
    },
    {
      headerName: 'WFC No',
      field: 'wfsCustomerId',
    },
    {
      headerName: 'Customer Name',
      field: 'customerName',
    },
    {
      headerName: 'Archived',
      field: 'archived',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? 'Yes' : 'No';
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
        actionMenus: node => [
          { title: 'Edit', action: GRID_ACTIONS.EDIT , isDisabled: !hasAnyPermission },
          { 
            title: 'Delete', 
            isDisabled: !node.data.unlocked && !hasAnyPermission,
            action: GRID_ACTIONS.DELETE 
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const deleteFuel = (fuel: FuelModel): void => {
    UIStore.setPageLoader(true);
    fuelStore
      ?.deleteFuel(fuel.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ fuel ]);
          AlertStore.info('Fuel deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const fuel = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openFuelDialog(VIEW_MODE.EDIT, fuel);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this fuel mapping?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteFuel(fuel)}
        />
      );
    }
  }

  const upsertFuel = (upsertFuelRequest: IAPIUpsertFuelRequest): void => {
    UIStore.setPageLoader(true);
    fuelStore
      ?.upsertFuel(upsertFuelRequest)
      .pipe(
        switchMap(() => fuelStore.getFuel()),
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

  const openFuelDialog = (mode: VIEW_MODE, fuel?: FuelModel): void => {
    ModalStore.open(
      <UpsertFuel
        fuelStore={fuelStore}
        viewMode={mode}
        fuel={fuel}
        upsertFuel={(upsertFuelRequest: IAPIUpsertFuelRequest) => upsertFuel(upsertFuelRequest)}
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
          <LocalGasStationIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Fuel Mappings
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
            onClick={() => openFuelDialog(VIEW_MODE.NEW, new FuelModel())}
            startIcon={<AddIcon />}
          >
            Add Fuel Mappings
          </PrimaryButton>  
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
    </>
  );
}

export default inject('fuelStore')(observer(Fuel));
