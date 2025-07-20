import React, { FC, RefObject, useEffect, useMemo, useRef } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './ManageGroupUsers.styles';
import { IconButton, Theme, Tooltip } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { GroupsUsersModel, GroupStore, UserResponseModel, UserStore, IAPIPagedUserRequest } from '../../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ArrowBack } from '@material-ui/icons';
import { GROUP_USER, LOGS_FILTERS } from '../../../Shared/Enums';
import AssignedUsers from '../AssignedUsers/AssignedUsers';
import { IClasses, UIStore, GRID_ACTIONS, cellStyle, SearchStore } from '@wings-shared/core';
import { CustomLinkButton, ConfirmDialog } from '@wings-shared/layout';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation, useParams } from 'react-router';
import { TrashIcon } from '@uvgo-shared/icons';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  groupStore?: GroupStore;
  userStore?: UserStore;
  params?: { id: string; name: string };
};

const ManageGroupsUsers: FC<Props> = ({ ...props }: Props) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  let pagedUserRequest: IAPIPagedUserRequest;
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, null);
  const location = useLocation();
  const agGrid = useAgGrid<LOGS_FILTERS, GroupsUsersModel>([], gridState);
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
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadInitialData();
  }, []);

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const hasUMAdminRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin' ]), [
    AuthStore.permissions,
  ]);

  const loadInitialData = (searchValue: string = ''): void => {
    UIStore.setPageLoader(true);
    props.groupStore?.loadGroupUsers(params?.id)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: GroupsUsersModel[]) => {
        gridState.setGridData(data);
      }
      );
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Username',
      field: 'username',
    },
    {
      headerName: 'First Name',
      field: 'firstName',
    },
    {
      headerName: 'Last Name',
      field: 'lastName',
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
              title="Remove User From Group"
              arrow
            >
              <IconButton
                disabled={!hasUMAdminRole}
                color="primary"
                onClick={() => gridActions(GRID_ACTIONS.DELETE, rowIndex)}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    },
  ];

  const assignUserToGroup = (userId: string): void => {
    UIStore.setPageLoader(true);
    props.userStore?.assignUserToGroup(params.id, userId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(response => {
        if (response) {
          loadInitialData();
        }
      });
  }

  const openAssignPeopleDialog = (mode: VIEW_MODE, userlist?: UserResponseModel): void => {
    ModalStore.open(
      <AssignedUsers userStore={props.userStore} onAssignUser={userId => assignUserToGroup(userId)} />
    );
  }

  const deleteUserFromGroup = (userId: string, userFromGroup: GroupsUsersModel): void => {
    UIStore.setPageLoader(true);
    props.userStore?.removeUserFromGroup(userId, params.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(() => {
        agGrid._removeTableItems([ userFromGroup ]);
      });
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    const userFromGroup = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.DELETE) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Remove"
          message="Are you sure you want to remove this user from the group?"
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => deleteUserFromGroup(userFromGroup.userId, userFromGroup)}
        />
      );
    }
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
        const { username, firstName, lastName } = node.data as GroupsUsersModel;
        return agGrid.isFilterPass(
          {
            [GROUP_USER.USER]: [ username, firstName, lastName ],
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
    };
  }

  return (
    <>
      <div className={classes.headerContainerTop}>
        <CustomLinkButton to="/user-management/groups" title="Back to Groups" startIcon={<ArrowBack />} />
        <div className={classes.headerContainerName}>
          <h2>{params?.name}</h2>
        </div>
      </div>
      <div className={classes.headerContainer}>
        <div className={classes.searchContainer}> 
          <SearchHeaderV2
            ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
            selectInputs={[ agGridUtilities.createSelectOption(GROUP_USER, GROUP_USER.USER) ]}
            onFilterChange={() => gridState.gridApi.onFilterChanged()}
            disableControls={gridState.isRowEditing}
            hideSelectionDropdown={true}
          />
        </div>
        <div>
          <PrimaryButton
            disabled={!hasWritePermission}
            variant="contained"
            color="primary"
            onClick={() => openAssignPeopleDialog(VIEW_MODE.NEW)}
          >
            Assign user
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

export default inject('groupStore', 'userStore')(observer(ManageGroupsUsers));
