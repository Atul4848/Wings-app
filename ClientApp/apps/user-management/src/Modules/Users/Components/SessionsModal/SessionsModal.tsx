import React, { FC, ReactNode, useEffect } from 'react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './SessionsModal.styles';
import { Theme, Button } from '@material-ui/core';
import { finalize } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import moment from 'moment';
import { SessionStore, UserModel, UserSessionModel } from '../../../Shared';
import { DATE_FORMAT, IClasses, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { SESSION_FILTER } from '../../../Shared/Enums';
import {
  CustomAgGridReact,
  useGridState,
  useAgGrid,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';

type Props = {
  classes?: IClasses;
  theme?: Theme;
  sessionStore?: SessionStore;
  user?: UserModel;
  openSessionDeleteConfirmation?: (session: UserSessionModel, user: UserModel) => void;
};

const SessionsModal: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, null);
  const agGrid = useAgGrid<SESSION_FILTER, UserSessionModel>([], gridState);

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
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
      headerName: 'Action',
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
      isExternalFilterPresent: () => false,
      doesExternalFilterPass: node => false,
    };
  }

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.sessionContainer}>
          <div className={classes.mainroot}>
            <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} />
          </div>
        </div>
        <Button
          color="primary"
          variant="contained"
          size="small"
          className={classes.btnAlign}
          onClick={() => ModalStore.close()}
        >
          Close
        </Button>
      </>
    );
  }

  return (
    <Dialog
      title={`Sessions : ${props.user?.username}`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('sessionStore')(observer(SessionsModal));
