import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Theme } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import { styles } from './OktaUsers.styles';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { GroupStore, IAPIPagedUserRequest, SessionStore, UserResponseModel, UserStore } from '../Shared';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { USER_FILTER } from '../Shared/Enums';
import { AdvanceSearchHelp } from './Components';
import { AxiosError } from 'axios';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import { SearchHeader } from '@wings-shared/form-controls';
import {
  Utilities,
  UIStore,
  IClasses,
  SORTING_DIRECTION,
  GRID_ACTIONS,
  IBaseGridFilterSetup,
  cellStyle,
  IAPIGridRequest,
  GridPagination,
} from '@wings-shared/core';
import {
  AgGridCellEditor,
  AgGridActions,
  CustomAgGridReact,
  IActionMenuItem,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { AuthStore } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  params?: { [name: string]: string };
  classes?: IClasses;
  theme?: Theme;
  userStore?: UserStore;
  groupStore?: GroupStore;
  sessionStore?: SessionStore;
}



const OktaUsers: FC<Props> = ({ ...props }: Props) => {
  const searchValue = useRef<string>('');
  const [ selectedOption, setSelectedOption ] = useState<string>('');
  const classes: Record<string, string> = styles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<any, UserResponseModel>([], gridState);
  const _userStore = props.userStore as UserStore;
  const currentPageLastRecord = useRef<string>('');
  const prevoiusPageLastRecord = useRef<string>('');
  const secondPrevoiusPageLastRecord = useRef<string>('');

  const filterSetup: IBaseGridFilterSetup<USER_FILTER> = {
    defaultPlaceHolder: 'Search by Name',
    defaultFilterType: USER_FILTER.USERNAME,
    filterTypesOptions: [
      USER_FILTER.USERNAME,
      USER_FILTER.FIRST_NAME,
      USER_FILTER.LAST_NAME,
      USER_FILTER.CSD_USER_ID,
      USER_FILTER.STATUS,
      USER_FILTER.ADVANCED,
    ],
    apiFilterDictionary: [
      { columnId: 'username', apiPropertyName: 'username', uiFilterType: USER_FILTER.USERNAME },
      { columnId: 'firstName', apiPropertyName: 'firstName', uiFilterType: USER_FILTER.FIRST_NAME },
      { columnId: 'lastName', apiPropertyName: 'lastName', uiFilterType: USER_FILTER.LAST_NAME },
      { columnId: 'csdUserId', apiPropertyName: 'csdUserId', uiFilterType: USER_FILTER.CSD_USER_ID },
      { columnId: 'status', apiPropertyName: 'status', uiFilterType: USER_FILTER.STATUS },
      { columnId: 'advanced', apiPropertyName: 'advanced', uiFilterType: USER_FILTER.ADVANCED },
    ],
    defaultSortFilters: [{ sort: SORTING_DIRECTION.ASCENDING, colId: 'username' }],
  };

  useEffect(() => {
    setSelectedOption(USER_FILTER.USERNAME)
    getServerSideRows();
  }, []);

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]); 

  const _searchFilters = (): IAPIGridRequest => {
    const property = filterSetup?.apiFilterDictionary?.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as USER_FILTER, selectedOption)
    );
    if (!property || !searchValue.current) {
      return {};
    }

    return {
      searchCollection: JSON.stringify([
        (property.apiPropertyName == 'csdUserId') 
          ? { PropertyName: property.apiPropertyName, PropertyValue: searchValue.current, Comparison: 'eq' }
          : Utilities.getFilter(property.apiPropertyName, searchValue.current as string),
      ]),
    };
  };



  /* istanbul ignore next */
  const getServerSideRows = (pageRequest?: IAPIGridRequest): void => {
    const pageSize = pageRequest?.pageSize || 30;
    const pageNumber = pageRequest?.pageNumber || 1
    const request: IAPIPagedUserRequest = {
      ..._searchFilters(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      limit: pageSize
    };

    if (pageNumber > 1) {
      if (gridState.pagination.pageNumber > pageNumber) {
        request.after = secondPrevoiusPageLastRecord.current
      }
      else {
        request.after = currentPageLastRecord.current
      }
    }

    UIStore.setPageLoader(true);
    _userStore
      .loadUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        filter(response => Boolean(response.results)),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        ({ results, after }) => {
          let totalRecord = results.length * (pageNumber);

          if (results.length >= pageSize)
            totalRecord = totalRecord + 1; // to fetch next page

          gridState.setPagination(new GridPagination(
            {
              pageSize: pageSize,
              pageNumber: pageNumber,
              totalNumberOfRecords: totalRecord
            }));
          gridState.setGridData(results);
          agGrid.reloadColumnState();
          const selectedRows = gridState.gridApi.getSelectedNodes();
          if (selectedRows?.length) {
            gridState.gridApi.deselectNode(selectedRows[0]);
          }
          secondPrevoiusPageLastRecord.current = prevoiusPageLastRecord.current
          prevoiusPageLastRecord.current = currentPageLastRecord.current
          currentPageLastRecord.current = after;

        },
        (error: AxiosError) => {
          agGrid.showAlert(error.message, 'usersSearchId');
        }
      );
  }

  /* istanbul ignore next */
  const actionMenus = (user: UserResponseModel): IActionMenuItem[] => {
    return [
      {
        title: 'Edit',
        action: GRID_ACTIONS.PROFILE,
        isDisabled: !hasWritePermission,
        to: node => `/user-management/okta-users/${node?.data?.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.PROFILE,
        to: node => `/user-management/okta-users/${node?.data?.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
      },
    ];
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'UserName',
      field: 'username',
      sort: 'asc',
      cellRenderer: params => {
        if (params.value !== undefined) {
          return params.value;
        } else {
          return 'Loading...';
        }
      },
    },
    {
      headerName: 'LastName',
      field: 'lastName',
    },
    {
      headerName: 'FirstName',
      field: 'firstName',
    },
    {
      headerName: 'Internal',
      field: 'isInternal',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? 'Y' : 'N';
      },
    },
    {
      headerName: 'CsdUserId',
      field: 'csdUserId',
    },
    {
      headerName: 'Status',
      field: 'status',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      valueGetter: params => {
        return params.data || null;
      },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => actionMenus(node.data),
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode, title: string) => {
          gridActions(action, rowIndex, title);
        },
      },
    },
  ];

  /* istanbul ignore next */
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
      getRowNodeId: (item: UserResponseModel) => {
        return item.id;
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
      },
      onGridReady: (event: GridReadyEvent) => {
        event.api.setDatasource({ getRows: () => getServerSideRows() });
        gridState.gridApi = event.api;
        gridState.columnApi = event.columnApi;
      },
      rowSelection: 'single',
      pagination: false,

    };
  }

  /* istanbul ignore next */
  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number, title: string): void => {
    if (rowIndex === null) {
      return;
    }
  }

  const openAdvanceDialog = (): void => {
    ModalStore.open(<AdvanceSearchHelp />);
  }

  return (
    <>
      <div className={classes.mainContainer}>
        <SearchHeader
          classes={{
            searchInput: classes.searchInputControl,
            root: classes.rootControl,
          }}
          backButton={null}
          searchTypeValue={selectedOption}
          searchTypeOptions={agGridUtilities.
            createSelectOption(USER_FILTER, USER_FILTER.USERNAME, USER_FILTER.FIRST_NAME).selectOptions}
          ignoreCase={true}
          onSearchTypeChange={option => setSelectedOption(option as USER_FILTER)}
          onSearch={(value: string) => {
            currentPageLastRecord.current = '';
            searchValue.current = value;
            if (selectedOption === USER_FILTER.ADVANCED && value) {
              return;
            }
            getServerSideRows();
          }}
          onClear={() => {
            currentPageLastRecord.current = '';
            searchValue.current = '';
            getServerSideRows();
          }}
          onKeyUp={key => {
            if (selectedOption === USER_FILTER.ADVANCED && Utilities.isEqual(key, 'enter')) {
              getServerSideRows();
              return;
            }
          }}
          disableControls={Boolean(Array.from(gridState.columFilters).length)}
        />
        <div className={classes.advancedIcon}>
          {selectedOption === USER_FILTER.ADVANCED && (
            <ContactSupportIcon onClick={() => openAdvanceDialog()} />
          )}
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
            onPaginationChange={request => getServerSideRows(request)}
          />
        </div>
      </div>
    </>
  );
};

export default inject('userStore', 'groupStore', 'sessionStore')(observer(OktaUsers));
export { OktaUsers as PureCoreModule };

