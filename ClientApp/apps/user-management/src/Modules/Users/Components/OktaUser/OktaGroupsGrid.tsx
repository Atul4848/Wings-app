import React, { FC, useEffect, useMemo } from 'react';
import {
  CustomAgGridReact,
  BaseGrid,
  AgGridActions,
  AgGridChipView,
  AgGridFilterHeader,
  AgGridActionButton,
  useAgGrid,
  useGridState,
  AgGridChipViewStatus,
} from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { Typography, withStyles } from '@material-ui/core';
import { useStyles } from './OktaGroupsGrid.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { GroupStore, UserGroupModel, UserStore } from '../../../Shared';
import ManageGroups from '../ManageGroups/ManageGroups';
import { GRID_ACTIONS, IClasses, UIStore, cellStyle } from '@wings-shared/core';
import { ConfirmDialog } from '@wings-shared/layout';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { GROUP_NAME, LOGS_FILTERS } from '../../../Shared/Enums';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore } from '@wings-shared/security';

interface Props {
  classes?: IClasses;
  userStore?: UserStore;
  groupStore?: GroupStore;
  userId: string;
}

const OktaGroupsGrid: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, UserGroupModel>([], gridState);
  const classes = useStyles();

  const openGroupManagementDialog = (): void => {
    ModalStore.open(<ManageGroups userStore={props.userStore} groupStore={props.groupStore} userId={props.userId} />);
  };

  const hasUMAdminRole = useMemo(() => AuthStore.permissions.hasAnyRole([ 'um_admin' ]), [
    AuthStore.permissions,
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.loadUserGroups(props.userId)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe();
  };

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
      cellRenderer: 'actionButtonRenderer',
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isHidden: node => {
          return node?.data?.name === 'Everyone' || !hasUMAdminRole;
        },
        isDisabled: () => false,
        onClick: node => {
          onDelete(node.data);
        },
      },
    },
  ];

  const onDelete = (data: UserGroupModel) => {
    return ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to delete this group for selected User."
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => deleteGroup(props.userId, data)}
      />
    );
  };

  const deleteGroup = (id: string, userGroup: UserGroupModel): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.removeGroup(id, userGroup.id)
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
        },
        (error: AxiosError) => AlertStore.info(error.message)
      );
  };

  const gridActionProps = (): object => {
    return {
      showDeleteButton: true,
      getDisabledState: () => gridState.hasError,
      getEditableState: () => false,
    };
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
      gridActionProps,
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
        minWidth: 180,
        menuTabs: [ 'filterMenuTab' ],
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        agGridChipViewStatus: AgGridChipViewStatus,
        actionButtonRenderer: AgGridActionButton,
        agColumnHeader: AgGridFilterHeader,
      },
      pagination: false,
    };
  }

  return (
    <div className={classes.oktaContainer}>
      <div className={classes.containerFlex}>
        <div className={classes.searchContainer}>
          <Typography variant="h6" className={classes.title}>
            Active Current Groups
          </Typography>
        </div>
        <div className={classes.manageRoleBtn}>
          <PrimaryButton
            variant="contained"
            color="primary"
            disabled={!hasUMAdminRole}
            onClick={() => openGroupManagementDialog()}
          >
            Manage Groups
          </PrimaryButton>
        </div>
      </div>
      <div className={classes.mainroot}>
        <CustomAgGridReact rowData={props.userStore?.userGroups} gridOptions={gridOptions()} />
      </div>
    </div>
  );
};

export default inject('userStore', 'groupStore')(observer(OktaGroupsGrid));
