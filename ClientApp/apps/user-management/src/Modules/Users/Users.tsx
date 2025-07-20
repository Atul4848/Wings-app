import React, { FC, RefObject, useEffect, useRef, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridGroupHeader,
  AgGridChipViewStatus,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { useStyles } from './Users.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Theme, Button } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { UserModel, UserStore } from '../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ColDef, GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { LOGS_FILTERS } from '../Shared/Enums';
import { FilterIcon, ExportUserIcon } from '@uvgo-shared/icons';
import FilterUsers from './Components/FilterUsers/FilterUsers';
import { CustomLinkButton } from '@wings-shared/layout';
import {
  GridPagination,
  IAPIGridRequest,
  IClasses,
  ISelectOption,
  UIStore,
  Utilities,
  SearchStore,
  cellStyle,
  Loader,
} from '@wings-shared/core';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@wings-shared/security';
import { gridFilters } from './fields';
import UsersActionRenderer from './Components/UsersActionRenderer/UsersActionRenderer';
import ExportUsers from './Components/ExportUsers/ExportUsers';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
};

const Users: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, UserModel>(gridFilters, gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const classes = useStyles();
  const { hasAnyPermission } = usePermissions([ 'write' ]);
  const [ users, setUserList ] = useState<UserModel[]>([]);
  const [ columnApi, setColumnApi ] = useState(null);
  const [ gridApi, setGridApi ] = useState(null);
  const progressLoader: Loader = new Loader(false);
  const unsubscribe = useUnsubscribe();

  useEffect(() => {
    if (!columnApi) return;

    const getLongerString = (...strings): string => {
      if (strings?.length) {
        return strings.reduce((a, b) => (a?.length >= b?.length ? a : b));
      }
      return '';
    };
    const longestContents = {
      fullName: '',
      username: '',
      csdUsername: '',
      customerNumber: '',
    };

    gridState.data.forEach((user: UserModel) => {
      longestContents.fullName = getLongerString(longestContents.fullName, user.fullName);
      longestContents.username = getLongerString(longestContents.username, user.username);
      longestContents.csdUsername = getLongerString(longestContents.csdUsername, user.csdUsername);
      longestContents.customerNumber = getLongerString(
        longestContents.customerNumber,
        user.customerNumber.join('_'.repeat(6))
      );
    });

    columnApi.setColumnWidth('fullName', getContentWidth(longestContents.fullName));
    columnApi.setColumnWidth('username', getContentWidth(longestContents.username));
    columnApi.setColumnWidth('csdUsername', getContentWidth(longestContents.csdUsername));
    columnApi.setColumnWidth('customerNumber', getContentWidth(longestContents.customerNumber));

    gridApi.sizeColumnsToFit();
  }, [ gridState.data, columnApi ]);

  const getContentWidth = (content: string): number => {
    const cellPadding = 34;
    const divElement = document.createElement('div');
    const spanElement = document.createElement('span');
    spanElement.innerText = content;

    Object.assign(spanElement.style, {
      fontSize: '14px!important',
      display: 'inline!important',
      whiteSpace: 'nowrap!important',
    });

    document.body.appendChild(divElement);
    divElement.appendChild(spanElement);
    const { width: contentWidth } = spanElement.getBoundingClientRect();
    divElement.remove();

    return Number.isFinite(contentWidth + cellPadding) ? contentWidth + cellPadding : 0;
  };

  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData?.searchValue) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
    loadSchema();
  }, []);

  useEffect(() => {
    if (props.userStore?.updatedUserData) {
      if (users.length) {
        const updatedUser = users.some(x => x.id == props.userStore?.updatedUserData.id);
        if (updatedUser) {
          const updatedUserIndex = users.findIndex(x => x.id == props.userStore?.updatedUserData.id);
          users[updatedUserIndex] = props.userStore?.updatedUserData;
          setUserList(users);
          gridState.setGridData(users);
        }
      }
    }
  }, [ props.userStore?.updatedUserData ]);

  const loadSchema = (): void => {
    progressLoader.showLoader();
    props.userStore
      ?.getSchema()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe((response: any) => {
        props.userStore?.setSchema(response);
      });
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest): void => {
    const _searchValue = searchHeaderRef.current?.searchValue;
    const request: IAPIGridRequest = {
      ...pageRequest,
      ...agGrid.filtersApi.gridSortFilters(),
      q: _searchValue,
      status: (props.userStore?.userFilter?.map(filter => filter.value) as string[]) || [],
      provider: props.userStore?.providerFilter,
    };

    UIStore.setPageLoader(true);
    props.userStore
      ?.getUsers(request)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        setUserList(response.results);
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'fullName',
      sort: 'asc',
    },
    {
      headerName: 'Username',
      field: 'username',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      cellStyle: {
        lineHeight: '21px',
        minHeight: '40px',
        paddingTop: '8px',
        paddingBottom: '8px',
      },
      suppressSizeToFit: false,
    },
    {
      headerName: 'CSD Username',
      field: 'csdUsername',
    },
    {
      headerName: 'CustomerNumber',
      field: 'fullCustomerSites',
      sortable: false,
      minWidth: 200,
      width: 200,
      maxWidth: 200,
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
      },
      cellClass: 'customerChip',
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 200,
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
        isString: true,
      },
    },
    {
      headerName: 'Oracle Username',
      field: 'oracleFNDUsername',
      hide: true,
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      sortable: false,
      minWidth: 100,
      width: 100,
      maxWidth: 100,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
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

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
    });
    return {
      ...baseOptions,
      suppressHorizontalScroll: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        suppressSizeToFit: true,
        comparator: () => 0,
        filter: true,
        menuTabs: [ 'filterMenuTab' ],
        sortingOrder:[ 'asc','desc' ],
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData();
      },
      frameworkComponents: {
        agGridChipViewStatus: AgGridChipViewStatus,
        customHeader: AgGridGroupHeader,
        actionButtonRenderer: UsersActionRenderer,
      },
      pagination: false,
      onGridSizeChanged(event: GridSizeChangedEvent) {
        event.api.sizeColumnsToFit();
      },
    };
  };

  const exportUsers = (): void => {
    const { userStore, classes } = props;
    const statusString =
      Array.isArray(userStore.userFilter) && userStore.userFilter.length
        ? userStore?.userFilter.map(filter => filter.value).join(',')
        : 'ALL';

    const searchRequest: IAPIGridRequest = {
      q: searchHeaderRef.current?.searchValue,
      sort: 'name',
      status: statusString,
      provider: userStore?.providerFilter,
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
    };

    ModalStore.open(<ExportUsers userStore={userStore} request={searchRequest} classes={classes} />);
  };

  const filterUsers = (): void => {
    ModalStore.open(
      <FilterUsers
        onSetClick={({ provider, status }) => {
          loadInitialData();
          ModalStore.close();
        }}
      />
    );
  };

  return (
    <>
      <div className={classes.userListContainer}>
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
            onClick={() => filterUsers()}
            startIcon={<FilterIcon />}
          ></Button>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={gridState.isProcessing}
            className={classes.filterBtn}
            onClick={() => exportUsers()}
            startIcon={<ExportUserIcon />}
          ></PrimaryButton>
          <span className={classes.newBtn}>
            <CustomLinkButton
              variant="contained"
              to={VIEW_MODE.NEW.toLowerCase()}
              title="Create New User"
              disabled={!hasAnyPermission}
            />
          </span>
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

export default inject('userStore')(observer(Users));
