import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridActionButton,
  AgGridChipViewStatus,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { useStyles } from './Users.styles';
import { Box, Button, Theme, Typography } from '@material-ui/core';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { 
  CustomersStore, 
  IAPIPagedUserRequest, 
  ServicesModel, 
  ServicesStore, 
  SiteModel, 
  UserModel 
} from '../../../Shared';
import { ColDef, GridOptions, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import { LOGS_FILTERS } from '../../../Shared/Enums';
import {
  GridPagination,
  IAPIGridRequest,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  SearchStore,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { useLocation, useParams } from 'react-router-dom';
import { FilterIcon } from '@uvgo-shared/icons';
import FilterUsers from '../FilterUsers/FilterUsers';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import ManageRoles from '../ManageRoles/ManageRoles';

interface Props {
  classes?: IClasses;
  theme?: Theme;
  customerStore?: CustomersStore;
  serviceStore?: ServicesStore;
  params?: { mode: VIEW_MODE; id: string };
}

const Users: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, UserModel>([], gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const classes = useStyles();
  const params = useParams();
  const [ isManageRoles, setIsManageRoles ] = useState(false);
  const [ selectedUsers, setSelectedUsers ] = useState<UserModel[]>([]);

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
    return () => {
      props.customerStore?.setFilterValues({
        service: new ServicesModel(),
        sites: new SiteModel(),
        roles: []
      });
      props.customerStore?.setSiteFilter(new SiteModel());
      props.customerStore?.setRoleIdsFilter([]);
    }
  }, []);

  const manageRolesCloseHandler = (reload?: boolean) => {
    setIsManageRoles(false);
    if (reload) {
      setSelectedUsers([]);
      loadInitialData();
    }
  }

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const _searchValue = searchHeaderRef.current?.searchValue;
    const request: IAPIGridRequest = {
      ...pageRequest,
      q: _searchValue,
      roleIds: props.customerStore?.roleIds,
      sort: 'username',
    };
    pagedUserRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'username', propertyValue: searchHeaderRef.current?.searchValue },
      ]),
    };
    UIStore.setPageLoader(true);
    props.customerStore?.getCustomerUsers(customerId(), request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        if(!_searchValue.length){
          if (gridState.isAllRowsSelected) {
            setTimeout(() => {
              gridState.gridApi.selectAll();
            }, 200);
          }
        }
      });
  };

  const filterUsers = () => {
    ModalStore.open(
      <FilterUsers customerId={customerId()}
        onSetClick={({ sites, roleIds }) => {
          props.customerStore?.setSiteFilter(sites)
          props.customerStore?.setRoleIdsFilter(roleIds)
          loadInitialData();
          ModalStore.close();
        }}
      />
    );
  }

  const customerId = (): string => {
    const { id } = params;
    return id ?? '';
  }

  const columnDefs: ColDef[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      resizable: false,
      filter: false,
      sortable: false,
      minWidth: 40,
      maxWidth: 40,
      hide: false,
    },
    {
      headerName: 'Full Name',
      field: 'fullName',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      maxWidth: 200,
    },
    {
      headerName: 'Username',
      field: 'username',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      maxWidth: 250,
    },
    {
      headerName: 'Roles',
      field: 'rolesString',
      cellClass: classes.rolesCell,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
        isString: true,
      },
      maxWidth: 200,
      cellClass: classes.statusCell,
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      filter: false,
      sortable: false,
      suppressMenu: true,
      suppressSizeToFit: true,
      suppressNavigable: true,
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      cellClass: classes.actionCell,
      cellRendererParams: {
        isHidden: () => false,
        isDisabled: () => false,
        to: node => `/user-management/users/${node.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
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
        context: this,
        columnDefs,
        isEditable: false,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      suppressCellSelection: true,
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
      onSelectionChanged(event: SelectionChangedEvent) {
        const users: UserModel[] = event.api.getSelectedRows();
        setSelectedUsers(users);
        gridState.setIsAllRowsSelected(event.api.getSelectedNodes().length === event.api.getDisplayedRowCount());
      },
      getRowHeight: params => {
        return params.data.rolesString.length > 180 ? 85 : 60;
      },
    };
  }

  return (
    <>
      <div className={classes.userListContainer}>
        <div className={classes.searchContainer}>
          <div className={classes.headerContainer}>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[]}
              onClear={() => {
                if (gridState.isAllRowsSelected) {
                  setTimeout(() => {
                    gridState.gridApi.deselectAll();
                  }, 200);
                }
              }}
              hasSelectInputsValues={false}
              onFilterChange={isInitEvent =>
                loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 })
              }
            />
            <div>
              <Button
                variant="contained"
                color="primary"
                className={classes.filterBtn}
                onClick={() => filterUsers()}
                startIcon={<FilterIcon />}
              ></Button>
            </div>
          </div>
          <div>
            <PrimaryButton
              variant="contained"
              size="large"
              color="primary"
              onClick={() => setIsManageRoles(true)}
              disabled={!selectedUsers.length}
            >
              Manage Roles
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
              onPaginationChange={loadInitialData}
            />
          </div>
        </div>
        {
          isManageRoles && (
            <ManageRoles
              isAllRowsSelected={gridState.isAllRowsSelected}
              customerId={customerId()}
              users={selectedUsers}
              isOpen={isManageRoles}
              onClose={manageRolesCloseHandler}
            />
          )
        }
      </div>
    </>
  );
}

export default inject('customerStore', 'serviceStore')(observer(Users));
