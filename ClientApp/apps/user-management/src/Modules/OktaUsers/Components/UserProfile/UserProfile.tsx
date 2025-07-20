import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Typography } from '@material-ui/core';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  DATE_FORMAT,
  Utilities,
  UIStore,
  IClasses,
  IOptionValue,
  ISelectOption,
  ViewPermission,
  GRID_ACTIONS,
  Loader,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { useStyles } from './UserProfile.style';
import {
  UserStore,
  UserResponseModel,
  UserSessionModel,
  SessionStore,
  IAPIUpdateOktaProfileRequest,
  CSDUserModel,
  CSDProfileModel,
  UserCacheModel,
} from '../../../Shared';
import { finalize, switchMap, takeUntil, debounceTime } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dropdown, DROPDOWN_TRIGGER } from '@uvgo-shared/dropdown';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { fields } from './Fields';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import { USER_ROLES, USER_STATUS } from '../../../Shared/Enums';
import Sessions from '../../../Sessions/Sessions';
import UserServiceNProduct from '../UserServiceNProduct/UserServiceNProduct';
import { CsdUserModel } from '@wings/notifications/src/Modules';
import { forkJoin, of } from 'rxjs';
import TemporaryPassword from '../TemporaryPassword/TemporaryPassword';
import GroupEditor from '../GroupEditor/GroupEditor';
import { ArrowBack } from '@material-ui/icons';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import {
  AutoCompleteControl,
  EDITOR_TYPES,
  DropdownItem,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
} from '@wings-shared/form-controls';
import { CustomLinkButton, DetailsEditorWrapper, EditSaveButtons, ConfirmDialog } from '@wings-shared/layout';
import { AuthStore, useRoles } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  classes?: IClasses;
  viewMode?: VIEW_MODE;
  params?: { mode: VIEW_MODE; id: string };
  navigate?: NavigateFunction;
  userStore?: UserStore;
  sessionStore?: SessionStore;
  updateEndDate?: (selectedDate: string) => void;
}

const UserProfile: FC<Props> = ({ ...props }: Props) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const progressLoader: Loader = new Loader(false);
  const navigate = useNavigate();
  const userData = props.userStore?.userData;
  const [ userDetails, setUserDetails ] = useState(new CSDUserModel());
  const [ csdUsers, setCSDUsers ] = useState<CSDUserModel[]>([]);
  const [ assumeUsers, setAssumeUsers ] = useState<UserCacheModel[]>([]);
  const [ selectedCSDUser, setSelectedCSDUser ] = useState<CSDUserModel | null>(new CSDUserModel());
  const [ selectedAssumeUser, setSelectedAssumeUser ] = useState<UserCacheModel | null>(new UserCacheModel());

  const hasError = (): boolean => {
    return useUpsert.form.hasError;
  }

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadInitialData();
  }, []);

  const loadInitialData = (): void => {
    if (!userId()) {
      return;
    }
    UIStore.setPageLoader(true);
    props.userStore?.getUserData(userId())
      .pipe(
        switchMap( response => { 
          props.userStore?.setUserData(new UserResponseModel(response));
          useUpsert.setFormValues(props.userStore?.userData);
          return forkJoin([
            response.csdUserId != 0 ? props.userStore?.loadCsdUsers(null, [ response.csdUserId ], true) : of(null),
            response.assumedIdentity ? props.userStore?.getCsdUserProfile(response.assumedIdentity) : of(null),
          ]);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ csdUsers, assumedUser ]: [CSDUserModel[] , CSDUserModel]) => {
        if ( csdUsers != null && csdUsers[0]?.id) {
          setUserDetails(csdUsers[0]);
          setSelectedCSDUser(csdUsers[0]);
        }
        if (assumedUser?.id) {
          const userCache = new UserCacheModel({
            csdUserId: assumedUser.id,
            firstName: assumedUser.firstName,
            lastName: assumedUser.lastName,
            username: assumedUser.email,
          });
          setAssumeUsers([ ...assumeUsers, userCache ]);
          setSelectedAssumeUser(userCache);
        }
        loadUserGroups(props.userStore?.userData.id || '');
      });
  }

  const loadUserGroups = (id: string): void => {
    UIStore.setPageLoader(true);
    props.userStore?.loadUserGroups(id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }

  const upsertUserData = (): void => { 
    const formValues: UserResponseModel = useUpsert.form.values();
    const user = new UserResponseModel({ ...userData, ...formValues });
    const assumeIdenitiy =
      selectedAssumeUser 
      && selectedAssumeUser.csdUserId != user.csdUserId
        ? selectedAssumeUser.csdUserId
        : null;
    const request: IAPIUpdateOktaProfileRequest = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role.value.toString(),
      isInternal: user.isInternal,
      csdUserId: selectedCSDUser?.id || 0,
      status: user.status,
      endDate: user.endDate,
      assumedIdentity: assumeIdenitiy,
      
    };

    UIStore.setPageLoader(true);
    props.userStore?.upsertUserData(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          loadInitialData();
        },
        
        error: error => {
          AlertStore.critical(error.message);
          if (props.userStore?.userData.csdUserId) setSelectedCSDUser(userDetails);
        },
      });
  }

  const loadCsdUsers = (searchValue: string): void => {
    if (searchValue.length <= 2) {
      return;
    }
    
    progressLoader.showLoader();
    props.userStore?.loadCsdUsers(searchValue)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(response => {
        setCSDUsers(response);
      });
  }

  const searchAssumeUsers = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    props.userStore?.searchUsersCache(value)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(users => (setAssumeUsers(users)));
  }

  const userId = (): string => {
    const { id } = params;
    return id ?? '';
  }

  const onAction = (action: GRID_ACTIONS): void =>{
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertUserData();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  }

  const onCancel = (): void => {
    const viewMode = params.mode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(userData);
      return;
    }
    navigateToUserManagement();
  }

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  }

  const navigateToUserManagement = (): void => {
    navigate('/user-management/okta-users');
  }

  const revokeToken = (id: string): void => {
    UIStore.setPageLoader(true);
    props.userStore?.revokeToken(id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: string) => {
          AlertStore.info(result);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const openUserSessionModal = (user: UserResponseModel) =>{
    ModalStore.open(
      <Sessions
        user={user}
        sessionStore={props.sessionStore}
        openSessionDeleteConfirmation={(session: UserSessionModel, user: UserResponseModel) =>
          deleteConfirmationForUserSession(session, user)
        }
      />
    );
  }

  const deleteConfirmationForUserSession = (session: UserSessionModel, user: UserResponseModel): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to delete this session?"
        yesButton="Yes"
        onNoClick={() => openUserSessionModal(user)}
        onCloseClick={() => openUserSessionModal(user)}
        onYesClick={() => deleteSession(session, user)}
      />
    );
  }

  const deleteSession = (session: UserSessionModel, user: UserResponseModel): void => {
    UIStore.setPageLoader(true);
    props.sessionStore?.deleteSession(user.oktaUserId, session)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          openUserSessionModal(user);
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => AlertStore.info('Session deleted successfully'),
        (error: AxiosError) => AlertStore.info(error.message)
      );
  }

  const getToggleActivationDialog = (title: string, message: string, yesButton: string) =>{
    ModalStore.open(
      <ConfirmDialog
        title={title}
        message={message}
        yesButton={yesButton}
        onNoClick={() => ModalStore.close()}
        onYesClick={() => toggleActivation()}
      />
    );
  }

  const toggleActivation = () => {
    UIStore.setPageLoader(true);
    ModalStore.close();
    const { id, status } = userData;
    props.userStore?.toggleActivation(id, status)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response.Data) {
            const updatedStatus = status === USER_STATUS.ACTIVE ? USER_STATUS.DEPROVISIONED : USER_STATUS.PROVISIONED;
            props.userStore?.setUserData(new UserResponseModel({ ...userData, status: updatedStatus }));
            useUpsert.setFormValues(userData);
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  }

  const expirePassword = (user: UserResponseModel): void =>{
    UIStore.setPageLoader(true);
    props.userStore?.expirePassword(user.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((temporaryPassword: string) => {
        ModalStore.close(); // closing the current dialog
        if (temporaryPassword) {
          ModalStore.open(<TemporaryPassword title="Temporary Password" temporaryPassword={temporaryPassword} />);
        }
      });
  }

  const deleteOktaAndUpdateCSDProfile = (user: UserResponseModel) =>{
    ModalStore.close();
    UIStore.setPageLoader(true);
    props.userStore?.deleteUser(user.userId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          if(user.csdUserId){
            props.userStore?.updateCsdUserProfile(CSDProfileModel.obfuscate(user.csdUserId));
          }
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => {
          AlertStore.info('User deleted successfully!');
          navigateToUserManagement();
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  const unlockUser = (user: UserResponseModel): void => {
    UIStore.setPageLoader(true);
    props.userStore?.unlockUser(user.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((isUnlocked: boolean) => {
        if (isUnlocked) {
          AlertStore.info('User is unlocked successfully!!');
        }
      });
  }

  const groupInputControls = (): IGroupInputControls[] => {
    const isDisabled = props.viewMode !== VIEW_MODE.NEW;
    const env = new EnvironmentVarsStore();
    const isADProvider: boolean = userData?.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
    return [
      {
        title: 'UserProfile',
        inputControls: [
          {
            fieldKey: 'firstName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isADProvider,
          },
          {
            fieldKey: 'lastName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isADProvider,
          },
          {
            fieldKey: 'email',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled,
          },
          {
            fieldKey: 'username',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.API_DATE_FORMAT,
            allowKeyboardInput: false,
            minDate: moment().format(DATE_FORMAT.API_DATE_FORMAT),
          },
          {
            fieldKey: 'isInternal',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: isDisabled,
          },
          {
            fieldKey: 'csdUserId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled,
          },
          {
            fieldKey: 'userGuid',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
          },
          {
            fieldKey: 'role',
            type: EDITOR_TYPES.DROPDOWN,
            options: getUserRoles(),
          },
          {
            fieldKey: 'assumedIdentity',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled,
          },
        ],
      },
    ];
  }

  const getUserRoles = (): ISelectOption[] => {
    return Object.keys(USER_ROLES).map(key => ({ label: key, value: USER_ROLES[key] }));
  }

  const dropdownOptionsList = () => {
    const env = new EnvironmentVarsStore();
    const isADProvider: boolean = userData?.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
    const isInternal: boolean = !userData?.isInternal;
    const isOktaProvider: boolean = userData?.provider === 'OKTA';
    return [
      {
        title: 'Unlock',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title="Confirm Unlock"
              message="Are you sure you want to unlock this User?"
              yesButton="Unlock"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => unlockUser(userData)}
            />
          );
        },
        isDisabled: userData?.status !== USER_STATUS.LOCKED_OUT,
      },
      {
        title: 'Revoke Token',
        onClick: () =>
          ModalStore.open(
            <ConfirmDialog
              title="Revoke Token"
              message="Revoke token for user, this will invalidate their current login session."
              yesButton="Continue"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => revokeToken(userId())}
            />
          ),
      },
      {
        title: 'Session',
        onClick: () => openUserSessionModal(userData),
      },
      {
        title: 'Activate',
        onClick: () => {
          const message = 'Are you sure you want to activate this User?';
          getToggleActivationDialog('Confirm Activation', message, 'Activate');
        },
        isDisabled: props.userStore?.userData.status !== USER_STATUS.DEPROVISIONED || isADProvider,
      },
      {
        title: 'Deactivate',
        onClick: () => {
          const message = isADProvider 
            ? 'Deactivating a user sourced by Active Directory will result in them being disconnected.'+
        ' Are you sure you want to deactivate this User?' 
            :'Are you sure you want to deactivate this User?';
          getToggleActivationDialog('Confirm Deactivation', message, 'Deactivate');
        },
        isDisabled:
          userData?.status == USER_STATUS.DEPROVISIONED
      },
      {
        title: 'Temporary Password',
        onClick: () => {
          expirePassword(userData);
        },
        isDisabled: props.userStore?.userData.status === USER_STATUS.DEPROVISIONED || !isOktaProvider || isADProvider,
      },
      {
        title: 'Delete',
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title={`Remove ${userData.username} user?`}
              message="Do you really want to remove this user? This process cannot be undone."
              yesButton="Continue"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => deleteOktaAndUpdateCSDProfile(userData)}
            />
          );
        },
        isDisabled:
          userData?.status !== USER_STATUS.DEPROVISIONED
      },
    ];
  }

  const setSearchValue = (_selectedCSDUser: CSDUserModel): void => {
    if (!_selectedCSDUser) {
      setCSDUsers([]);
      setSelectedCSDUser(null);
      return;
    }
    setSelectedCSDUser(_selectedCSDUser);
  }

  const setSearchAssumeValue = (_selectedUser: UserCacheModel): void => {
    if (!_selectedUser) {
      setAssumeUsers([]);
      setSelectedAssumeUser(null);
      return;
    }
    setSelectedAssumeUser(_selectedUser);
  }

  const dropdownOptions = (): ReactNode => {
    return (
      <React.Fragment>
        {dropdownOptionsList()
          .map(({ title, onClick, isDisabled }) => (
            <DropdownItem key={title} isDisabled={isDisabled} onClick={onClick}>
              {title}
            </DropdownItem>
          ))}
      </React.Fragment>
    );
  }

  const hasWritePermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  const headerActions = (): ReactNode => {
    return (
      <>
        <div></div>
        <div className={classes.flexWrap}>
          <div className={classes.spaceSection}>
            <ViewPermission hasPermission={!useUpsert.isEditable}>
              <Dropdown popperContent={dropdownOptions()} trigger={DROPDOWN_TRIGGER.CLICK} autoclose={false}>
                <PrimaryButton disabled={!hasWritePermission} variant="contained">
                More
                  <ArrowDropDownOutlinedIcon className={classes.dropdown} />
                </PrimaryButton>
              </Dropdown>
            </ViewPermission>
          </div>
          <EditSaveButtons
            disabled={hasError() || UIStore.pageLoading}
            hasEditPermission={hasWritePermission}
            isEditMode={useUpsert.isEditable}
            onAction={action => onAction(action)}
          />
        </div>
      </>
    );
  }

  const csdUserInputControls = (): IGroupInputControls => {
    return {
      title: '',
      inputControls: [
        {
          fieldKey: 'fullName',
          label: 'Full Name',
        },
        {
          fieldKey: 'name',
          label: 'User Name',
        },
        {
          fieldKey: 'email',
          label: 'Email',
        },
        {
          fieldKey: 'customerNumber',
          label: 'Customer Number',
        },
      ],
    };
  }

  const csdUserDetails = (): ReactNode => {
    return (
      <>
        <div className={classes.boxSection}>
          <Typography variant="h6" className={classes.title}>
            CSD PROFILE
          </Typography>
          <div className={classes.flexWrap}>
            {csdUserInputControls().inputControls.map((field, index) => (
              <ViewInputControl
                key={field.fieldKey}
                type={EDITOR_TYPES.TEXT_FIELD}
                classes={{
                  flexRow: classNames({
                    [classes.inputControl]: true,
                  }),
                }}
                field={{ value: userDetails[field.fieldKey], label: field.label }}
                isEditable={false}
              />
            ))}
          </div>
        </div>
        <div className={classes.boxGroup}>
          {userDetails.servicesNProducts.length > 0 && (
            <UserServiceNProduct servicesNProducts={userDetails.servicesNProducts} />
          )}
        </div>
      </>
    );
  }

  const getStatusClasses = fieldKey => {
    if (fieldKey !== 'status') {
      return '';
    }
    const { status } = useUpsert.form.values();
    switch (status) {
      case 'ACTIVE':
        return classes.active
      case 'RECOVERY':
        return classes.recovery
      case 'PASSWORD_EXPIRED':
      case 'DELETED':
      case 'LOCKED_OUT':
        return classes.inactiveStatus
      case 'DEPROVISIONED':
      case 'SUSPENDED':
        return classes.deprovisionedsuspended
      case 'PROVISIONED':
      case 'STAGED':
        return classes.stagedProvisioned
      default:
        break;
    }
  };

  return (
    <div className={classes.mainWrapper}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <div className={classes.btnSection}>
          <CustomLinkButton
            to="/user-management/okta-users"
            title='Back To Users'
            startIcon={<ArrowBack />}
          />
        </div>
        <div className={classes.mainSection}>
          <div className={classes.boxSection}>
            <Typography variant="h6" className={classes.title}>
              OKTA PROFILE
            </Typography>
            {groupInputControls().map(groupInputControl => {
              return (
                <div key={userId()} className={classes.flexWrap}>
                  {groupInputControl.inputControls
                    .filter(inputControl => !inputControl.isHidden)
                    .map((inputControl: IViewInputControl, index: number) => {
                      if (Utilities.isEqual(inputControl.fieldKey, 'csdUserId') && useUpsert.isEditable) {
                        return (
                          <>
                            <div className={classes.searchContainer}>
                              <Typography className={classes.titleHeading}>Mapped CSD User</Typography>
                              <AutoCompleteControl
                                placeHolder="Search CSD Users"
                                options={csdUsers.filter(
                                  x => Boolean(x.name) && Boolean(x.email) && Boolean(x.fullName)
                                )}
                                value={selectedCSDUser}
                                filterOption={options =>
                                  options.map(option => {
                                    return {
                                      ...option,
                                      label: (option as CsdUserModel).email,
                                    };
                                  })
                                }
                                onDropDownChange={selectedOption =>
                                  setSearchValue(selectedOption as CSDUserModel)
                                }
                                onSearch={(searchValue: string) => loadCsdUsers(searchValue)}
                              />
                            </div>
                          </>
                        );
                      }
                      if (Utilities.isEqual(inputControl.fieldKey, 'assumedIdentity') && useUpsert.isEditable) {
                        return (
                          <>
                            <div key={userId()} className={classes.searchContainer}>
                              <Typography className={classes.titleHeading}>Assume Identity</Typography>
                              <AutoCompleteControl
                                placeHolder="Search Users"
                                options={assumeUsers}
                                value={selectedAssumeUser}
                                onDropDownChange={selectedOption =>
                                  setSearchAssumeValue(selectedOption as UserCacheModel)
                                }
                                onSearch={(searchValue: string) => searchAssumeUsers(searchValue)}
                              />
                            </div>
                          </>
                        );
                      }
                      return (
                        <ViewInputControl
                          {...inputControl}
                          key={inputControl.fieldKey}
                          customErrorMessage={inputControl.customErrorMessage}
                          field={useUpsert.getField(inputControl.fieldKey)}
                          isEditable={useUpsert.isEditable}
                          isExists={inputControl.isExists}
                          classes={{
                            flexRow: classNames({
                              [classes.inputControl]: true,
                              [getStatusClasses(inputControl.fieldKey)]:true
                            }),
                          }}
                          onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey)}
                        />
                      );
                    })}
                </div>
              );
            })}
          </div>
          <div className={classes.boxSection}>
            <GroupEditor key={selectedCSDUser?.id} selectedUser={userData} />
          </div>
          {userData.csdUserId > 0 && <>{csdUserDetails()}</>}
        </div>
      </DetailsEditorWrapper>
    </div>
  );
}

export default inject('userStore', 'sessionStore')(observer(UserProfile));
