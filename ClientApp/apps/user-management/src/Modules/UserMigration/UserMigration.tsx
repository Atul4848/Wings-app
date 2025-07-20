import { Typography } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import {
  CustomAgGridReact,
  AgGridActions,
  AgGridGroupHeader,
  useAgGrid,
  useGridState
} from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertStore } from '@uvgo-shared/alert';
import InboxIcon from '@material-ui/icons/Inbox';
import { UserStore } from '../Shared/Stores';
import { styles } from './UserMigration.styles';
import { runInAction } from 'mobx';
import { finalize, takeUntil } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { IAPIResponse } from '../../../../airport-logistics/src/Modules/Shared';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { CSDUserModel, IAPICSDMappingRequest, LookupUserModel, UserResponseModel } from '../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { StagedEmail } from './Components';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/Check';
import classNames from 'classnames';
import ImportDialog from './Components/ImportDialog/ImportDialog';
import { AxiosError } from 'axios';
import { Utilities, UIStore, ViewPermission, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { ErrorIcon } from '@uvgo-shared/icons';
import {
  EDITOR_TYPES,
  ViewInputControl,
  SearchInputControl,
  IGroupInputControls,
  IViewInputControl,
  ExpandCollapseButton
} from '@wings-shared/form-controls';
import { ConfirmDialog } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuthStore, useRoles } from '@wings-shared/security';

interface Props {
  userStore?: UserStore;
}

const UserMigration: FC<Props> = ({ ...props }: Props) => {
  const classes: Record<string, string> = styles();
  const searchValueRef = useRef<string>('');
  const [ csdUsers, setCsdUsers ] = useState<CSDUserModel[]>([]);
  const selectedCsdUserRef = useRef<CSDUserModel>(new CSDUserModel());
  const [ lookupUser, setLookupUser ] = useState<LookupUserModel>(new LookupUserModel());
  const _userStore = props.userStore as UserStore;
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<any, CSDUserModel>([], gridState);

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const setSearchValue = (value) => {
    searchValueRef.current = value;
  };

  const searchValue = () => {
    return searchValueRef.current;
  };

  const setSelectedCsdUser = (value) => {
    selectedCsdUserRef.current = value;
  };
 
  const selectedCsdUser = () => {
    return selectedCsdUserRef.current as CSDUserModel;
  };

  const loadCsdUsers = (key: string): void => {
    if (!(Utilities.isEqual(key.toLowerCase(), 'enter') && searchValue().length > 2)) {
      return;
    }

    UIStore.setPageLoader(true);
    _userStore
      .loadCsdUsers(searchValue())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(csdUsers => {
        setCsdUsers(csdUsers);
      });
  }

  /* istanbul ignore next */
  const updateEmail = (userId: number, stagedEmail: string, setLoginEmail: string, resetEmails: string) => {
    UIStore.setPageLoader(true);
    _userStore
      .updateEmail(userId, stagedEmail, setLoginEmail, resetEmails)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (response: IAPIResponse<boolean>) => {
          if (response.Data) {
            if (Utilities.isEqual(setLoginEmail, 'true')) {
              setSelectedCsdUser(new CSDUserModel({ ...selectedCsdUser(), email: stagedEmail }));
              refresh();
              AlertStore.info('Email verification completed!');
              return;
            }
            setSelectedCsdUser(new CSDUserModel({ ...selectedCsdUser(), email: stagedEmail }));
            refresh();
            AlertStore.info('Staged Email has been updated!');
          }
        },
        error: (error: any) => AlertStore.critical(error.response.data.Errors[0].Message),
      });
  }

  /* istanbul ignore next */
  const setSelectedUser = (user: CSDUserModel) => {
    setSelectedCsdUser(user);
    UIStore.setPageLoader(true);
    _userStore
      .lookupUser(user.id, user.email)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(lookupUser => setLookupUser(lookupUser));
  }

  /* istanbul ignore next */
  const sendVerificationEmail = () => {
    UIStore.setPageLoader(true);
    _userStore
      .sendVerificationEmail(selectedCsdUser().stagedEmail)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: (response: IAPIResponse<string>) => AlertStore.info(response.Data),
        error: (error: any) => AlertStore.critical(error.response.data.Errors[0].Message),
      });
  }

  /* istanbul ignore next */
  const refresh = () => {
    const { id, email } = selectedCsdUser();
    UIStore.setPageLoader(true);
    forkJoin([ _userStore.lookupUser(id, email), _userStore.loadCsdUsers(searchValue()) ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ lookupUser, csdUsers ]: [ LookupUserModel, CSDUserModel[] ]) => {
        runInAction(() => {
          setLookupUser(lookupUser);
          setCsdUsers(csdUsers);
          setSelectedCsdUser(csdUsers.find(x => x.id === id) || new CSDUserModel());
        });
      });
  }

  const confirmSendEmailVerification = () => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Send"
        message={`Send verification code to staged email: ${selectedCsdUser().stagedEmail}`}
        yesButton="Send"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => sendVerificationEmail()}
      />
    );
  }

  const confirmVerification = () => {
    return ModalStore.open(
      <ConfirmDialog
        title="Confirm Verification"
        message={'Are you sure you want to proceed with verification?'}
        yesButton="Proceed"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => updateEmail(selectedCsdUser().id, selectedCsdUser().stagedEmail, 'true', 'false')}
      />
    );
  }

  const clearEmailsDialog = () => {
    return ModalStore.open(
      <ConfirmDialog
        title="Confirm to clear emails and mapping"
        message={'Are you sure you want to clear emails and mapping?'}
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => clearEmailsandMapping()}
      />
    );
  }

  const clearEmailsandMapping = () => {
    const request: IAPICSDMappingRequest = {
      OktaUserId: lookupUser.hasData ? lookupUser.users[0].id : '',
    };
    UIStore.setPageLoader(true);
    if (!selectedCsdUser().email || !selectedCsdUser().stagedEmail) {
      AlertStore.info('Staged and Login Emails has already been cleared!');
      return;
    }
    _userStore.updateEmail(selectedCsdUser().id, selectedCsdUser().email, 'false', 'true')
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          if (lookupUser.hasData) {
            _userStore.addRemoveCsduser(request).subscribe();
          }
          setSelectedCsdUser(new CSDUserModel({ ...selectedCsdUser(), stagedEmail: '', email: '' }));
          setSelectedUser(selectedCsdUser());
          refresh();
          ModalStore.close();
          AlertStore.info('Staged and Login Emails has been cleared!');
        },
        error: (error: AxiosError) => AlertStore.critical(error.response.data.Errors[0].Message),
      });
  }


  const onSearchValueChange = (value: string): void => {
    if (!value) {
      setCsdUsers([]);
      setSelectedCsdUser(new CSDUserModel());
      setLookupUser(new LookupUserModel());
    }
    setSearchValue(value);
  }

  const openUpdateStageEmailModal = (): void => {
    ModalStore.open(
      <StagedEmail
        selectedCsdUser={selectedCsdUser()}
        updateStagedEmail={(userId: number, email: string) => updateEmail(userId, email, 'false', 'false')}
      />
    );
  }

  /* istanbul ignore next */
  const groupLookupInputControls = (): IGroupInputControls => {
    return {
      title: 'LookupDetail',
      inputControls: [
        {
          fieldKey: 'fullName',
          label: 'Name',
        },
        {
          fieldKey: 'username',
          label: 'Username',
        },
        {
          fieldKey: 'provider',
          label: 'Provider',
        },
        {
          fieldKey: 'email',
          label: 'Email',
        },
      ],
    };
  }

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'User Id',
      field: 'id',
    },
    {
      headerName: 'Username',
      field: 'name',
    },
    {
      headerName: 'Staged Email',
      field: 'stagedEmail',
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
      headerName: 'Customer Number',
      field: 'customerNumber',
    },
    {
      headerName: 'Login Email',
      field: 'email',
    },
    {
      headerName: 'Okta Import Date',
      field: 'oktaImportDate',
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      minWidth: 160,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node) => [
          { title: 'Import', action: GRID_ACTIONS.IMPORT },
          {
            title: 'Set Stage Email',
            isDisabled: !hasWritePermission,
            action: GRID_ACTIONS.SETSTAGEEMAIL
          },
          {
            title: 'Send Verification Email',
            action: GRID_ACTIONS.SENDVERIFICATIONEMAIL,
            isDisabled: !hasWritePermission ||
              !Boolean(node.data.stagedEmail?.length) ||
              Utilities.isEqual(node.data.email, node.data.stagedEmail),
          },
          {
            title: 'Verify',
            action: GRID_ACTIONS.VERIFY,
            isDisabled: !hasWritePermission ||
              !Boolean(node.data.stagedEmail?.length) ||
              Utilities.isEqual(node.data.email, node.data.stagedEmail),
          },
          { title: 'Refresh', action: GRID_ACTIONS.REFRESH },
          {
            title: 'Clear Emails',
            action: GRID_ACTIONS.RESET,
            isDisabled: !hasWritePermission || !node.data.email || !node.data.stagedEmail,
          },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          gridActions(action, rowIndex);
        },
      },
    },
  ];

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    const userGroup = agGrid._getTableItem(rowIndex);
    if (gridAction === GRID_ACTIONS.REFRESH) {
      refresh();
    }

    if (gridAction === GRID_ACTIONS.IMPORT) {

      openImportDialog(VIEW_MODE.EDIT, userGroup);
    }

    if (gridAction === GRID_ACTIONS.SETSTAGEEMAIL) {
      openUpdateStageEmailModal();
    }

    if (gridAction === GRID_ACTIONS.SENDVERIFICATIONEMAIL) {
      confirmSendEmailVerification();
    }

    if (gridAction === GRID_ACTIONS.VERIFY) {
      confirmVerification();
    }

    if (gridAction === GRID_ACTIONS.RESET) {
      clearEmailsDialog();
    }

  }

  /* istanbul ignore next */
  const openImportDialog = (mode: VIEW_MODE, userGroup): void => {

    ModalStore.open(
      <ViewPermission hasPermission={Boolean(selectedCsdUser().id)}>
        <ViewPermission hasPermission={selectedCsdUser().id > 0}>
          <ImportDialog
            selectedUser={userGroup}
            userStore={_userStore}
          />
        </ViewPermission>
      </ViewPermission>
    );
  }

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => false,
      onCellClicked: (props) => setSelectedUser(props.data),
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customHeader: AgGridGroupHeader,
      },
      pagination: true,
    }
  }

  return (
    <>
      <div className={classes.userRow}>
        <div
          className={classes.contentContainer}
        >
          <div className={classes.cardContainer}>
            <SearchInputControl
              onSearch={(value: string) => onSearchValueChange(value)}
              onKeyUp={key => loadCsdUsers(key)}
              placeHolder="Search CSD Users"
            />
          </div>
          <div className={classes.mainroot}>
            <div className={classes.mainContent}>
              <CustomAgGridReact gridOptions={gridOptions()} rowData={csdUsers} />
            </div>
          </div>
        </div>
        <div className={classes.contentSubContainer}>
          <div className={classes.oktaContainerBox}>
            <>
              <ViewPermission hasPermission={!lookupUser.hasData}>
                <div className={classes.emptyBox}>
                  <div className={classes.emptyBoxContainer}>
                    <ErrorIcon size="x-large" />
                  </div>
                  <label className={classes.noData}>No imported or okta user found.</label>
                </div>
              </ViewPermission>
              <ViewPermission hasPermission={lookupUser.hasData}>
                <>
                  <div className={classes.listCategory}>
                    <div className={classes.listCategoryBox}>
                      <label><b>Existing Okta User:</b></label>
                      <div className={classes.listCategoryBoxInner}>
                        {groupLookupInputControls().inputControls
                          .filter(inputControl => !inputControl.isHidden)
                          .map((inputControl: IViewInputControl, index: number) => (
                            <ViewInputControl
                              {...inputControl}
                              key={index}
                              type={EDITOR_TYPES.TEXT_FIELD}
                              field={{
                                value: lookupUser.users?.length
                                  ? lookupUser.users[0][inputControl.fieldKey]
                                  : '',
                                label: inputControl.label,
                              }}
                              isEditable={false}
                              classes={{
                                flexRow: classNames({
                                  [classes.inputControlField]: true,
                                }),
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className={classes.userMessagesContainer}>
                    {lookupUser.users?.map((x: UserResponseModel, index: number) => {
                      const isWarning: boolean = x.message.includes('Warning');
                      const message = classNames({
                        [classes.userWarningMessages]: isWarning,
                        [classes.userMessages]: !isWarning,
                      });
                      return (
                        <div className={message} key={index}>
                          {isWarning ? (
                            <WarningIcon className={classes.bulletIcon} />
                          ) : (
                            <CheckIcon className={classes.bulletIcon} />
                          )}
                          <Typography>{x.message}</Typography>
                        </div>
                      );
                    })}
                  </div>
                </>
              </ViewPermission>
            </>
          </div>
        </div>
      </div >
    </>
  );
};

export default inject('userStore')(observer(UserMigration));
export { UserMigration as PureUserMigration };
