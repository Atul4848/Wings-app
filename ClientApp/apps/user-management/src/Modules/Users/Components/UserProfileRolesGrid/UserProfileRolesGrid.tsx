import React, { FC, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, GridReadyEvent, GridSizeChangedEvent, ValueFormatterParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useStyles } from './UserProfileRolesGrid.style';
import { UserProfileRolesModel } from '../../../Shared';
import { AuthStore, USER_GROUP } from '@wings-shared/security';
import { IClasses, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ChildGridWrapper, ConfirmDialog } from '@wings-shared/layout';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridActionButton,
  AgGridChipViewStatus,
  AgGridFilterHeader,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { LOGS_FILTERS, ROLE_ACCESS_TYPE } from '../../../Shared/Enums';
import AccessTypeRenderer from './AccessType.renderer';

interface Props {
  classes?: IClasses;
  rolesField: UserProfileRolesModel[];
  openRoleFieldDialog: (rolesField: UserProfileRolesModel, viewMode: VIEW_MODE) => void;
  upsertRoleField: (rolesField: UserProfileRolesModel) => void;
  deleteRoleField: (role: UserProfileRolesModel) => void;
  userId: string;
}

const UserProfileRolesGrid: FC<Props> = ({ ...props }) => {
  const [ showAssociation, setShowAssociation ] = useState(true);
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, UserProfileRolesModel>([], gridState);
  const [ columnApi, setColumnApi ] = useState(null);
  const [ gridApi, setGridApi ] = useState(null);

  useEffect(() => {
    if (!columnApi) return;

    const getLongerString = (...strings): string => {
      if (strings?.length) {
        return strings.reduce((a, b) => (a?.length >= b?.length ? a : b));
      }
      return '';
    };
    const longestContents = {
      name: '',
      description: '',
      attributes: '',
      permissions: '',
    };

    gridState.data.forEach((role: UserProfileRolesModel) => {
      longestContents.name = getLongerString(longestContents.name, role.name);
      longestContents.description = getLongerString(longestContents.description, role.description);
      longestContents.attributes = getLongerString(longestContents.attributes, role.attributes);
      longestContents.permissions = getLongerString(
        longestContents.permissions,
        role.permissions.join('_'.repeat(8))
      );
    });

    columnApi.setColumnWidth('name', getContentWidth(longestContents.name));
    columnApi.setColumnWidth('description', getContentWidth(longestContents.description));
    columnApi.setColumnWidth('attributes', getContentWidth(longestContents.attributes));
    columnApi.setColumnWidth('permissions', getContentWidth(longestContents.permissions));

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

    return  Number.isFinite(contentWidth + cellPadding) ? contentWidth + cellPadding : 0;
  }

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
  }

  const confirmRemoveRoleField = (role: UserProfileRolesModel): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to delete this role?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => props.deleteRoleField(role)}
      />
    );
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Role',
      field: 'name',
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
      headerName: 'Access Type',
      field: 'accessType',
      cellRenderer: 'accessTypeRenderer',
      maxWidth: 175,
    },
    {
      headerName: 'Association',
      hide: !showAssociation,
      field: 'attributes',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        const customer = value?.find(x => x.type === 'Customer')?.value;
        const site = value?.find(x => x.type === 'Site')?.value;
        const registry = value?.find(x => x.type === 'Registry')?.value;
        return [ customer, site, registry ].filter(Boolean).join(' / ');
      },
    },
    {
      headerName: 'Permissions',
      field: 'permissions',
      cellRenderer: 'agGridChipViewStatus',
      cellRendererParams: {
        isPlainText: true,
      },
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
        isDisabled: () => false,
        isHidden: node => !AuthStore.userHasAccess(USER_GROUP.USER_MANAGEMENT_ADMIN),
        onClick: (node, isEditable) => {
          if (isEditable) return props.openRoleFieldDialog(node.data, VIEW_MODE.EDIT);
          return confirmRemoveRoleField(node.data);
        },
      },
    },
  ];

  const gridActionProps = (): object => {
    return {
      showDeleteButton: true,
      getDisabledState: () => gridState.hasError,
      getEditableState: () => false,
      onAction: gridActions,
    };
  }

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
        filter: true,
        menuTabs: [ 'filterMenuTab' ],
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        agGridChipViewStatus: AgGridChipViewStatus,
        actionButtonRenderer: AgGridActionButton,
        agColumnHeader: AgGridFilterHeader,
        accessTypeRenderer: AccessTypeRenderer,
      },
      pagination: false,
      paginationPageSize: 500,
      onGridReady(event: GridReadyEvent) {
        setGridApi(event.api);
        setColumnApi(event.columnApi);
      },
      onGridSizeChanged(event: GridSizeChangedEvent) {
        event.api.sizeColumnsToFit();
      },
      getRowHeight: params => {
        return params.data.accessType === ROLE_ACCESS_TYPE.STANDARD ? 50 : 80;
      },
    };
  };

  const showAssociations = (value: boolean) => {
    setShowAssociation(value);
    columnApi.setColumnVisible('attributes', value);
  }

  return (
    <>
      <div className={classes.checkBoxSection}>
        <div className={classes.checkBox}>
          <FormControlLabel
            control={
              <Checkbox onChange={e => showAssociations(e.target.checked)} checked={showAssociation} />
            }
            label="Show Association"
          />
        </div>
      </div>
      <div className={classes.container}>
        <ChildGridWrapper
          onAdd={() => props.openRoleFieldDialog(new UserProfileRolesModel(), VIEW_MODE.NEW)}
          hasAddPermission={true}
          disabled={gridState.isProcessing}
          title="Add Role"
        >
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={props.rolesField}
            gridOptions={gridOptions()}
            hidePagination={true}
          />
        </ChildGridWrapper>
      </div>
    </>
  );
}

export default observer(UserProfileRolesGrid);
