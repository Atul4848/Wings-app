import React, { FC, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, GridReadyEvent, GridSizeChangedEvent } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './RoleFieldGrid.styles';
import { RolesModel } from '../../../Shared';
import { AuthStore, USER_GROUP } from '@wings-shared/security';
import { IClasses, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ChildGridWrapper, ConfirmDialog } from '@wings-shared/layout';
import { Dialog } from '@uvgo-shared/dialog';
import { Notification } from '@uvgo-shared/notifications';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridActionButton,
  AgGridChipViewStatus,
  AgGridFilterHeader,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { LOGS_FILTERS } from '../../../Shared/Enums';
import { PrimaryButton } from '@uvgo-shared/buttons';

interface Props {
  classes?: IClasses;
  rolesField: RolesModel[];
  openRoleFieldDialog: (rolesField: RolesModel, viewMode: VIEW_MODE) => void;
  upsertRoleField: (rolesField: RolesModel) => void;
  deleteRoleField: (id: number) => void;
}

const RoleFieldGrid: FC<Props> = ({ ...props }) => {
  const [ columnApi, setColumnApi ] = useState(null);
  const [ gridApi, setGridApi ] = useState(null);
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, RolesModel>([], gridState);

  useEffect(() => {
    if (!columnApi) return;

    const getLongerString = (...strings): string => strings.reduce((a, b) => a.length >= b.length ? a : b);
    const longestContents = {
      name: '',
      displayName: '',
    };

    props.rolesField.forEach((role: RolesModel) => {
      longestContents.name = getLongerString(longestContents.name, role.name);
      longestContents.displayName = getLongerString(longestContents.displayName, role.displayName);
    });

    columnApi.setColumnWidth('name', getContentWidth(longestContents.name));
    columnApi.setColumnWidth('displayName', getContentWidth(longestContents.displayName));

    gridApi.sizeColumnsToFit();
  }, [ props.rolesField, columnApi ]);

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

    return  Number.isFinite(contentWidth + cellPadding) ? contentWidth + cellPadding : 0;
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
  };

  const confirmRemoveRoleField = (roleId: number): void => {
    ModalStore.open(
      <Dialog
        title="Confirm Delete"
        open={true}
        onClose={() => ModalStore.close()}
        classes={{
          paperSize: classes.userMappedWidth,
        }}
        dialogContent={() => (
          <>
            <div className={classes.subTitle}>Are you sure you want to delete this role?</div>
            <Notification
              type="warning"
              message="Note: Deleting a role will remove this role from all users who currently have it assigned."
            />
          </>
        )}
        dialogActions={() => (
          <>
            <PrimaryButton variant="outlined" onClick={() => ModalStore.close()}>
              Close
            </PrimaryButton>
            <PrimaryButton variant="contained" onClick={() => props.deleteRoleField(roleId)}>
              Delete
            </PrimaryButton>
          </>
        )}
      />
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Role Name',
      field: 'name',
    },
    {
      headerName: 'Type',
      field: 'type',
      filter: false,
      sortable: true,
      suppressMenu: true,
      menuTabs: [],
      width: 100,
      maxWidth: 100,
      minWidth: 100,
    },
    {
      headerName: 'Display Name',
      field: 'displayName',
    },
    {
      headerName: 'Description',
      field: 'description',
      cellStyle: {
        lineHeight: '21px',
        minHeight: '40px',
        paddingTop: '8px',
        paddingBottom: '8px',
      },
      suppressSizeToFit: false,
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
      filter: false,
      suppressMenu: true,
      width: 160,
      maxWidth: 160,
      minWidth: 160,
    },
    {
      headerName: 'Permissions',
      field: 'permissions',
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
      },
      filter: false,
    },
    {
      headerName: 'Action',
      cellRenderer: 'actionButtonRenderer',
      minWidth: 100,
      width: 100,
      maxWidth: 100,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        onAction: node => {},
        isEditOrDelete: true,
        isDisabled: () => !AuthStore.permissions.hasAnyRole([ 'um_admin' ]),
        isHidden: node => !AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN),
        onClick: (node, isEditable) => {
          if (isEditable) return props.openRoleFieldDialog(node.data, VIEW_MODE.EDIT);
          return confirmRemoveRoleField(node.data.id);
        },
      },
    },
  ];

  /* istanbul ignore next */
  const gridActionProps = (): object => {
    return {
      showDeleteButton: true,
      getDisabledState: () => gridState.hasError,
      getEditableState: () => false,
      onAction: gridActions,
    };
  };

  /* istanbul ignore next */
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
      suppressHorizontalScroll: true,
      groupHeaderHeight: 0,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        suppressSizeToFit: true,
        autoHeight: true,
        filter: true,
        menuTabs: [ 'filterMenuTab' ],
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        agGridChipViewStatus: AgGridChipViewStatus,
        actionButtonRenderer: AgGridActionButton,
        agColumnHeader: AgGridFilterHeader,
      },
      pagination: false,
      onGridReady(event: GridReadyEvent) {
        setGridApi(event.api);
        setColumnApi(event.columnApi);
      },
      onGridSizeChanged(event: GridSizeChangedEvent) {
        event.api.sizeColumnsToFit();
      },
    };
  };

  return (
    <div className={classes.container}>
      <ChildGridWrapper
        onAdd={() => props.openRoleFieldDialog(new RolesModel(), VIEW_MODE.NEW)}
        hasAddPermission={true}
        disabled={gridState.isProcessing}
        title="Add Role"
      >
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.rolesField}
          gridOptions={gridOptions()}
        />
      </ChildGridWrapper>
    </div>
  );
};

export default observer(RoleFieldGrid);
