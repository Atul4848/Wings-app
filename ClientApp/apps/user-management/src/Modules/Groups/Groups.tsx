import React, { FC, ReactNode, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
  agGridUtilities,
  AgGridActions,
  AgGridGroupHeader,
  AgGridActionButton,
  AgGridViewRenderer,
} from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './Groups.styles';
import { IconButton, Theme, Tooltip, Typography } from '@material-ui/core';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { UserGroupModel, GroupStore, IAPIUserGroupsRequest, IAPIPagedUserRequest } from '../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { GROUP_NAME, LOGS_FILTERS } from '../Shared/Enums';
import PeopleIcon from '@material-ui/icons/People';
import UpsertGroup from './Components/UpsertGroups/UpsertGroup';
import { IClasses, UIStore, GRID_ACTIONS, cellStyle, SearchStore } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router';
import { EditIcon } from '@uvgo-shared/icons';
import { Link } from 'react-router-dom';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  groupStore?: GroupStore;
};

const Groups: FC<Props> = ({ groupStore }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, UserGroupModel>([], gridState);
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

  const hasUMAdminRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin' ]), [
    AuthStore.permissions,
  ]);

  const hasUMAdminOrManagerRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin', 'um_manager' ]), [
    AuthStore.permissions,
  ]);

  const loadInitialData = (searchValue: string = '') => {
    UIStore.setPageLoader(true);
    groupStore?.loadGroups(searchValue)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: UserGroupModel[]) => {
        gridState.setGridData(data);
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'Description',
      field: 'description',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? value : '-';
      },
    },
    {
      headerName: 'Action',
      cellRenderer: 'viewRenderer',
      maxWidth: 100,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => (
          <>
            <Tooltip
              classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
              placement="top"
              title="Edit"
              arrow
            >
              <IconButton
                className={classes.infoManage}
                color="primary"
                disabled={!hasUMAdminRole}
                onClick={() => openGroupDialog(VIEW_MODE.EDIT, node.data)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              classes={{ tooltip: classes.customToolTip, arrow: classes.customArrow }}
              placement="top"
              title="Manage Groups Users"
              arrow
            >
              <Link to={`/user-management/groups/${node.data.id}/${node.data.name}`}>
                <IconButton
                  disabled={!hasUMAdminOrManagerRole}
                  color="primary"
                  className={classes.infoManage}
                  onClick={() => {}}
                >
                  <PeopleIcon />
                </IconButton>
              </Link>
            </Tooltip>
          </>
        ),
      },
    },
  ];

  const deleteGroup = (userGroup: UserGroupModel): void => {
    UIStore.setPageLoader(true);
    groupStore?.deleteGroup(userGroup.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => {
          agGrid._removeTableItems([ userGroup ]);
          AlertStore.info('Group deleted successfully');
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const userGroup = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.EDIT) {
      openGroupDialog(VIEW_MODE.EDIT, userGroup);
    }

    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this group, 
          all users in the group will be unassigned? This action cannot be undone."
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteGroup(userGroup.id, userGroup)}
        />
      );
    }
  }

  const upsertGroup = (upsertGroupRequest: IAPIUserGroupsRequest): void =>{
    UIStore.setPageLoader(true);
    groupStore?.upsertGroup(upsertGroupRequest)
      .pipe(
        switchMap(() => groupStore.loadGroups()),
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => (gridState.data = response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  const openGroupDialog = (mode: VIEW_MODE, userGroup?: UserGroupModel): void => {
    ModalStore.open(
      <UpsertGroup
        groupStore={groupStore}
        viewMode={mode}
        userGroup={userGroup}
        upsertGroup={(upsertGroupRequest: IAPIUserGroupsRequest) => upsertGroup(upsertGroupRequest)}
      />
    );
  }

  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({
        context: this,
        columnDefs,
        isEditable: true,
        gridActionProps: {
          showDeleteButton: false,
          getDisabledState: () => gridState.hasError,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {},
        },
      }),
      isExternalFilterPresent: () => searchHeaderRef.current?.hasSearchValue || false,
      doesExternalFilterPass: node => {
        const searchHeader = searchHeaderRef.current;
        if (!searchHeader) {
          return false;
        }
        const { name } = node.data as UserGroupModel;
        return agGrid.isFilterPass(
          {
            [GROUP_NAME.NAME]: [ name ],
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
    };
  }

  return (
    <>
      <div className={classes.headerContainer}>
        <div className={classes.searchContainer}>
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[ agGridUtilities.createSelectOption(GROUP_NAME, GROUP_NAME.NAME) ]}
            onFilterChange={() => gridState.gridApi.onFilterChanged()}
            disableControls={gridState.isRowEditing}
            hideSelectionDropdown={true}
          />
        </div>
        <div className={classes.flexSection}>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasUMAdminRole}
            onClick={() => openGroupDialog(VIEW_MODE.NEW, new UserGroupModel())}
          >
            Add Group
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainroot}>
        <div className={classes.mainContent}>
          <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} />
        </div>
      </div>
    </>
  );
}

export default inject('groupStore')(observer(Groups));
