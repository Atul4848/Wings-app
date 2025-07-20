import React, { FC, ReactNode, RefObject, useEffect, useRef } from 'react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './Sessions.styles';
import { Theme, Typography } from '@material-ui/core';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { LOGS_FILTERS, SESSION_FILTER } from '../Shared/Enums';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import moment from 'moment';
import PeopleIcon from '@material-ui/icons/People';
import { SessionStore, UserResponseModel, UserSessionModel } from '../Shared';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { DATE_FORMAT, IClasses, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  sessionStore?: SessionStore;
  user?: UserResponseModel;
  openSessionDeleteConfirmation?: (session: UserSessionModel, user: UserResponseModel) => void;
};

const Sessions: FC<Props> = ({ ...props }: Props) => {
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<LOGS_FILTERS, UserSessionModel>([], gridState);
  const searchHeaderRef = useRef<ISearchHeaderRef>();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    const { user, sessionStore } = props;
    sessionStore
      .loadSessionUsers(user.oktaUserId)
      .pipe(finalize(() => UIStore.setPageLoader(false)))
      .subscribe((data: UserSessionModel[]) => {
        gridState.setGridData(data);
      });
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Connection Id',
      field: 'connectionId',
    },
    {
      headerName: 'Client Name',
      field: 'clientName',
    },
    {
      headerName: 'Client Id',
      field: 'clientId',
    },
    {
      headerName: 'Connection Timestamp',
      field: 'timestamp',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(moment.utc(value).format(DATE_FORMAT.API_FORMAT), DATE_FORMAT.SDT_DST_FORMAT),
    },
    {
      headerName: 'IP Address',
      field: 'ipAddress',
    },
    {
      headerName: 'User Agent',
      field: 'userAgent',
    },
    {
      headerName: '',
      field: 'action',
      cellRenderer: 'viewRenderer',
      filter: false,
      minWidth: 100,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data),
      },
    },
  ];

  const viewRenderer = (rowData: UserSessionModel): ReactNode => {
    return (
      <PrimaryButton
        variant="contained"
        color="primary"
        onClick={() => props.openSessionDeleteConfirmation(rowData, props.user)}
      >
        Delete
      </PrimaryButton>
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
        const { clientName, ipAddress } = node.data as UserSessionModel;
        return agGrid.isFilterPass(
          {
            [SESSION_FILTER.ALL]: [ clientName.toString(), ipAddress.toString() ],
            [SESSION_FILTER.CLIENTNAME]: clientName.toString(),
            [SESSION_FILTER.IPADDRESS]: ipAddress.toString(),
          },
          searchHeader.searchValue,
          searchHeader.selectedOption
        );
      },
    };
  }

  const dialogContent = (): ReactNode => {
    const { user } = props;
    return (
      <>
        <div className={classes.subSection}>
          <PeopleIcon className={classes.icon} />
          <Typography component="h3" className={classes.heading}>
            Sessions : {user.email}
          </Typography>
        </div>
        <div className={classes.headerContainer}>
          <div>
            <SearchHeaderV2
              ref={searchHeaderRef as RefObject<ISearchHeaderRef>}
              selectInputs={[ agGridUtilities.createSelectOption(SESSION_FILTER, SESSION_FILTER.ALL) ]}
              onFilterChange={() => gridState.gridApi.onFilterChanged()}
              disableControls={gridState.isRowEditing}
              onExpandCollapse={agGrid.autoSizeColumns}
              hideSelectionDropdown={true}
            />
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

  return (
    <Dialog
      title=""
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('sessionStore')(observer(Sessions));
