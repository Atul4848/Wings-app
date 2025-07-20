import React, { ChangeEvent, FC, ReactNode, useEffect, useRef, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Typography, Button, CardContent, Checkbox, FormControlLabel } from '@material-ui/core';
import {
  UserStore,
  UserModel,
  OracleUser,
  UserCacheModel,
  CSDUserModel,
  UserSessionModel,
  SessionStore,
  CSDProfileModel,
  UserFactsModel,
  UserProfileRolesModel,
  ServicesStore,
  AttributesModel,
  CustomersStore,
  CustomerModel,
  SiteModel,
  ApplicationsStore,
  IAPIUserV3Request,
  IAPIUvgoProfileRequest,
  SyncTroubleshootStore,
} from '../../../Shared';
import { fields } from './Fields';
import { observable } from 'mobx';
import { useStyles } from './UpsertUser.styles';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { forkJoin, of } from 'rxjs';
import classNames from 'classnames';
import {
  UIStore,
  DATE_FORMAT,
  IClasses,
  GRID_ACTIONS,
  IOptionValue,
  Utilities,
  regex,
  Loader,
  ViewPermission,
} from '@wings-shared/core';
import UsersSubTab from '../UsersSubTab/UsersSubTab';
import moment from 'moment';
import { GROUP_IDS, USER_STATUS } from '../../../Shared/Enums';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AxiosError } from 'axios';
import SessionsModal from '../SessionsModal/SessionsModal';
import { TemporaryPassword } from '../../../OktaUsers/Components';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { Dropdown, DROPDOWN_TRIGGER } from '@uvgo-shared/dropdown';
import { PrimaryButton } from '@uvgo-shared/buttons';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';
import {
  EDITOR_TYPES,
  ViewInputControl,
  DropdownItem,
  IGroupInputControls,
  IViewInputControl,
  AutoCompleteControl,
} from '@wings-shared/form-controls';
import { DetailsEditorWrapper, EditSaveButtons, ConfirmDialog } from '@wings-shared/layout';
import { HubConnectionStore, NOTIFICATIONS_EVENTS } from '@wings-shared/security';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Notification } from '@uvgo-shared/notifications';
import { Dialog } from '@uvgo-shared/dialog';
import AddRole from '../ManageRole/AddRole/AddRole';
import EditRole from '../ManageRole/EditRole/EditRole';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  userStore?: UserStore;
  sessionStore?: SessionStore;
  navigate?: NavigateFunction;
  serviceStore?: ServicesStore;
  customerStore?: CustomersStore;
  applicationStore?: ApplicationsStore;
  syncTroubleshootStore: SyncTroubleshootStore;
};

const UpsertUser: FC<Props> = ({ ...props }: Props) => {
  const [ user, setUser ] = useState(new UserModel({ id: '' }));
  const [ facts, setFacts ] = useState<UserFactsModel[]>([]);
  const localStates = observable({
    sendActivationEmail: false,
    generateTempPassword: false,
    isGridDataLoaded: false,
  });
  const [ oracleUsers, setOracleUsers ] = useState<OracleUser[]>([]);
  const [ selectedOracleUser, setSelectedOracleUser ] = useState<OracleUser>(new OracleUser());
  const [ assumeUsers, setAssumeUsers ] = useState<UserCacheModel[]>([]);
  const [ selectedAssumeUser, setSelectedAssumeUser ] = useState<UserCacheModel>(new UserCacheModel());
  const [ csdUsers, setCsdUsers ] = useState<CSDUserModel[]>([]);
  const [ selectedCSDUser, setSelectedCSDUser ] = useState<CSDUserModel | null>(new CSDUserModel());
  const [ userDetails, setUserDetails ] = useState<CSDUserModel>(new CSDUserModel());
  let csdUserId: number;
  let email: string = '';
  let username: string = '';
  let firstName: string = '';
  let lastName: string = '';
  const password: any = null;
  const preferences: any = null;
  const [ groupIds, setGroupIds ] = useState<string[]>([ 'wings', 'uvGO', 'serviceManagement', 'uplinkUI' ]);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const navigate = useNavigate();
  const env = new EnvironmentVarsStore();
  const isADProvider: boolean = user?.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
  const isFederation: boolean = user?.provider === 'FEDERATION';
  const progressLoader: Loader = new Loader(false);
  const [ showUVGOBox, setUVGOBox ] = useState(false);
  const [ editingGrids, setEditingGrids ] = useState<string[]>([]);
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const [ warnings, setWarnings ] = useState<string[]>([]);
  const _syncTroubleshootStore = props.syncTroubleshootStore as SyncTroubleshootStore;
  const overwrite = useRef<boolean>(true);
  const [ csdUsername, setCsdUsername ] = useState<string>('');

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadUserData();
    if ( params?.mode?.toUpperCase() === VIEW_MODE.EDIT){
      userAudit();
    }
    setTimeout(() => {
      subscribeToJobStatusNotifications();
    }, 2000);
    return () => {
      HubConnectionStore.connection?.off(NOTIFICATIONS_EVENTS.JOB_STATUS_NOTIFICATION);
      props.userStore?.setRolesField([]);
    };
  }, [ params.id ]);

  useEffect(() => {
    if (props.userStore?.updatedUserData) {
      setUserData(props.userStore?.updatedUserData);
    }
  }, [ props.userStore?.updatedUserData ])

  const subscribeToJobStatusNotifications = (): void => {
    HubConnectionStore.connection?.on(NOTIFICATIONS_EVENTS.JOB_STATUS_NOTIFICATION, notification => {
      if (notification?.data) {
        loadUserData();
      }
    });
  };

  const loadUserData = (): void => {
    if (!userId()) {
      useUpsert.setFormValues(user);
      return;
    }
    UIStore.setPageLoader(true);
    const { userStore } = props;
    userStore
      ?.getUser(userId())
      .pipe(
        switchMap(user => {
          setUserData(user);
          const isADProvider: boolean = user.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
          return forkJoin([
            user.csdUserId != null && user.csdUserId != 0
              ? userStore.loadCsdUsers(null, [ user.csdUserId ], true)
              : of(null),
            user.assumeIdentity ? userStore.getCsdUserProfile(user.assumeIdentity) : of(null),
            props.serviceStore?.getServices({}, isADProvider ? 'All' : 'External'),
            props.applicationStore.getApplications(),
            user?.activeCustomerId ? props.customerStore?.getCustomer(user?.activeCustomerId) : of(null),
          ]);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        ([ roles, csdUsers, assumedUser, _, activeCustomer ]: [
          CSDUserModel[],
          CSDUserModel,
          CSDUserModel,
          ApplicationsModel,
          CustomerModel
        ]) => {
          if (Boolean(roles)) {
            userStore.setUserDetail(roles[0]);
            localStates.isGridDataLoaded = true;
          }
          if (csdUsers != null && csdUsers[0]?.id) {
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
          if (Boolean(activeCustomer)) {
            props.userStore.setCustomer([ activeCustomer ]);
            props.userStore.setSelectedActiveCustomer(activeCustomer);
          }
        }
      );
  };

  const setUserData = (user: UserModel) => {
    if (!userId()) {
      useUpsert.setFormValues(user);
      return of(null);
    }
    setUser(new UserModel(user));
    props.userStore?.setOktaUserId(user.oktaUserId);
    props.userStore?.setUserGuid(user.id);
    props.userStore?.setRolesField(
      user.roles.map(role => {
        const customer = role.attributes?.find(x => x.type === 'Customer')?.value;
        const customerId = role.attributes?.find(x => x.type === 'CustomerId')?.value;
        const customerNumber = role.attributes?.find(x => x.type === 'CustomerNumber')?.value;
        const site = role.attributes?.find(x => x.type === 'Site')?.value;
        return new UserProfileRolesModel({
          ...role,
          customer: new CustomerModel({ id: customerId, customerId, number: customerNumber, name: customer }),
          site: new SiteModel({ number: site }),
        });
      })
    );
    useUpsert.form.reset();
    useUpsert.setFormValues(user);
    if (user?.csdUserId) {
      const csdUser = new CSDUserModel({
        id: user?.csdUserId,
        name: user.csdUsername,
        email: user.username,
      });
      setCsdUsers([ ...csdUsers, csdUser ]);
      setSelectedCSDUser(csdUser);
    }
    if (user?.oracleFNDUserId) {
      const oracleUser = new OracleUser({
        userId: user.oracleFNDUserId,
        username: user.oracleFNDUsername,
      });
      setOracleUsers([ ...oracleUsers, oracleUser ]);
      setSelectedOracleUser(oracleUser);
    }
  }

  const upsertUser = (): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.upsertUser(userId(), getUpsertUserSetting())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          loadUserData();
          props.userStore?.setRolesUpdate();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const getAttributes = (role: UserProfileRolesModel) => {
    const service = props.serviceStore?.services.find(x => x.roles.some(y => y.name === role.name));
    role.appServiceId = service?.id;
    role.applicationId = service?.applicationId;
    role.enabled = true;
    const customer = role.attributes.find(x => x.type === 'Customer')?.value;
    const customerId = role.attributes.find(x => x.type === 'id' || x.type === 'CustomerId')?.value;
    const customerNumber = role.attributes.find(x => x.type === 'CustomerNumber')?.value;
    const site = role.attributes.find(x => x.type === 'Site')?.value;
    const registry = role.attributes.find(x => x.type === 'Registry')?.value;
    return [
      (role.customer?.name || customer) &&
        new AttributesModel({ type: 'Customer', value: role.customer?.name || customer }),
      (role.customer?.customerId || customerId) &&
        new AttributesModel({ type: 'CustomerId', value: role.customer?.id?.toString() || customerId }),
      (role.customer?.number || customerNumber) &&
        new AttributesModel({ type: 'CustomerNumber', value: role.customer?.number?.toString() || customerNumber }),
      (role.site?.number || site) && new AttributesModel({ type: 'Site', value: role.site?.number || site }),
      (role.registry?.name || registry) &&
        new AttributesModel({ type: 'Registry', value: role.registry?.name || registry }),
    ].filter(Boolean); // Filter out null values
  };

  const getUpsertUserSetting = (): IAPIUserV3Request => {
    const { userStore } = props;
    const formValues: IAPIUserV3Request = useUpsert.form.values();
    const uvgoProfile: IAPIUvgoProfileRequest = {
      csdUserId: selectedCSDUser?.id,
      csdUsername: selectedCSDUser?.name,
      assumeIdentity: 
        selectedAssumeUser && selectedAssumeUser.csdUserId != user.csdUserId ? selectedAssumeUser.csdUserId : undefined,
      jobRole: user.jobRole?.value?.toString(),
      activeCustomerId: props.userStore.selectedActiveCustomer?.id ?? null,
      activeCustomerSite: props.userStore.selectedActiveCustomer === null ? null : user.activeCustomerSite,
      oracleFNDUserId: selectedOracleUser?.userId,
      oracleFNDUsername: selectedOracleUser?.username,
      preferences: userStore.preferences,
    };
    const userSetting: IAPIUserV3Request = {
      id: user.id,
      oktaUserId: user.oktaUserId,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      username: user.username,
      email: user.email,
      status: user.status,
      endDate: formValues.endDate
        ? moment(formValues.endDate)
          .set({ hour: 0, minute: 0, second: 0 })
          .format(DATE_FORMAT.API_DATE_FORMAT)
        : null,
      isEmailVerified: user.isEmailVerified,
      ciscoUsername: formValues.ciscoUsername,
      provider: user.provider,
      roles: props.userStore?.rolesField.map(role => {
        const apiRole: any = {
          userRoleId: role.userRoleId,
          roleId: role.roleId,
          attributes: getAttributes(role),
        }

        if (role.userRoleId) {
          apiRole.userRoleId = role.userRoleId;
        }

        if (role.isExternal) {
          apiRole.isTrial = role.isTrial;
        }

        if (role.validFrom) {
          apiRole.validFrom = role.validFrom;
        }

        if (role.validTo) {
          apiRole.validTo = role.validTo;
        }

        return apiRole;
      }),
      UVGOProfile: uvgoProfile
    };

    return userSetting;
  };

  const upsertRole = (role: any) => {
    const { userStore } = props;
    const userGuid: string = userStore?.userGuid;

    ModalStore.close();
    UIStore.setPageLoader(true);

    userStore
      .updateRoles({ userGuid, role })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false)),
      )
      .subscribe(() => {
        loadUserData();
        AlertStore.info('Roles updated successfully.');
      });
  }

  const deleteRoleField = (role: UserProfileRolesModel) => {
    const { userStore } = props;
    const userGuid = userStore?.userGuid;
    const { userRoleId } = role;

    ModalStore.close();
    UIStore.setPageLoader(true);
    userStore?.setRolesField(userStore?.rolesField.filter(field => !Utilities.isEqual(field.id, role.id)));

    userStore
      .deleteRole({ userRoleId, userGuid })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false)),
      )
      .subscribe(() => {
        AlertStore.info('Role deleted successfully.');
      });
  };

  const openRoleFieldDialog = (roleField: UserProfileRolesModel, viewMode: VIEW_MODE): void => {
    const rolesList: UserProfileRolesModel[] = props.userStore?.rolesField || [];

    switch (viewMode) {
      case VIEW_MODE.EDIT:
        ModalStore.open(
          <EditRole
            role={roleField}
            rolesList={rolesList}
            onSubmit={upsertRole}
          />
        );
        break;
      case VIEW_MODE.NEW:
      default:
        ModalStore.open(
          <AddRole
            rolesList={rolesList}
            onSubmit={upsertRole}
          />);
        break;
    }
  };

  const isHidden = (): boolean => {
    return useUpsert.viewMode === VIEW_MODE.NEW;
  };

  const createNewUser = (): void => {
    const _groupIds = Object.keys(fields).filter(key => useUpsert.getField(key).value && groupIds.includes(key));
    const idsFromEnv = getGroupIds(_groupIds);

    UIStore.setPageLoader(true);
    props.userStore
      ?.createNewUser(
        (csdUserId = [ ...csdUsers ][0]?.id),
        (email = useUpsert.form.values().email),
        (username = useUpsert.form.values().username),
        (firstName = useUpsert.form.values().firstName),
        (lastName = useUpsert.form.values().lastName),
        (localStates.sendActivationEmail = Boolean(useUpsert.form.values().sendActivationEmail)),
        (localStates.generateTempPassword = Boolean(useUpsert.form.values().generateTempPassword)),
        password,
        preferences,
        idsFromEnv
      )
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (result: any) => {
          if (localStates.generateTempPassword) {
            ModalStore.open(
              <TemporaryPassword
                title="Temporary Password"
                temporaryPassword={result.TempPassword}
                onClose={() => {
                  ModalStore.close();
                  navigateToUsers();
                }}
              />
            );
            AlertStore.info('User created successfully.');
          } else {
            navigateToUsers();
            AlertStore.info('Activation email has been sent successfully.');
          }
        },
        (error: AxiosError) => {
          if (error.response?.data.IsSuccess === false) {
            return AlertStore.critical(error.response?.data.Summary);
          } else AlertStore.critical(error.message);
        }
      );
  };

  const getGroupIds = (_groupIds: string[]): string[] => {
    const ids: string[] = [];
    _groupIds.forEach(group => {
      if (group === GROUP_IDS.WINGS) {
        ids.push(env.getVar(ENVIRONMENT_VARS.WINGS_GROUP_ID));
      }
      if (group === GROUP_IDS.UVGO) {
        ids.push(env.getVar(ENVIRONMENT_VARS.UVGO_GROUP_ID));
      }
      if (group === GROUP_IDS.SERVICE_MANAGEMENT) {
        ids.push(env.getVar(ENVIRONMENT_VARS.SM_GROUP_ID));
      }
      if (group === GROUP_IDS.UPLINK_UI) {
        ids.push(env.getVar(ENVIRONMENT_VARS.UPLINK_UI_GROUP_ID));
      }
    });
    return ids;
  };

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'Users',
      inputControls: [
        {
          fieldKey: 'csdUsername',
          type: EDITOR_TYPES.DROPDOWN,
          isHidden: !isHidden() || !showUVGOBox || !useUpsert.getField('uvGO').value,
        },
        {
          fieldKey: 'firstName',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !isFutureDate(),
          isHidden: useUpsert.viewMode === VIEW_MODE.NEW ? !showUVGOBox : false,
        },
        {
          fieldKey: 'lastName',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !isFutureDate(),
          isHidden: useUpsert.viewMode === VIEW_MODE.NEW ? !showUVGOBox : false,
        },
        {
          fieldKey: 'username',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: useUpsert.viewMode === VIEW_MODE.EDIT,
          isHidden: useUpsert.viewMode === VIEW_MODE.NEW ? !showUVGOBox : false,
        },
        {
          fieldKey: 'email',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: useUpsert.viewMode === VIEW_MODE.EDIT,
          isHidden: useUpsert.viewMode === VIEW_MODE.NEW ? !showUVGOBox : false,
        },
        {
          fieldKey: 'status',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
          isHidden: isHidden(),
        },
        {
          fieldKey: 'id',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
          isHidden: isHidden(),
        },
        {
          fieldKey: 'userId',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
          isHidden: isHidden(),
        },
        {
          fieldKey: 'endDate',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.API_DATE_FORMAT,
          minDate: moment().format(DATE_FORMAT.API_DATE_FORMAT),
          isHidden: isHidden(),
        },
        {
          fieldKey: 'provider',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
          isHidden: isHidden(),
        },
        {
          fieldKey: 'isEmailVerified',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: true,
          isHidden: isHidden(),
        },
        {
          fieldKey: 'sendActivationEmail',
          type: EDITOR_TYPES.CHECKBOX,
          isHidden: !isHidden() || !showUVGOBox,
        },
        {
          fieldKey: 'generateTempPassword',
          type: EDITOR_TYPES.CHECKBOX,
          isHidden: !isHidden() || !showUVGOBox,
        },
        {
          fieldKey: 'ciscoUsername',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: false,
          isHidden: isHidden(),
        }
      ],
    };
  };

  const applicationGroupsInputControls = (): IGroupInputControls => {
    return {
      title: 'ApplicationGroups',
      inputControls: [
        {
          fieldKey: 'wings',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'uvGO',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'serviceManagement',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'uplinkUI',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  };

  const userId = (): string => {
    const { id } = params;
    return id ?? '';
  };

  const onAction = (action: GRID_ACTIONS): void => {
    if (action === GRID_ACTIONS.CANCEL) {
      navigateToUsers();
      return;
    }
    upsertUser();
  };

  const navigateToUsers = (): void => {
    navigate('/user-management');
  };

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        {useUpsert.viewMode === VIEW_MODE.EDIT && (
          <div className={classes.flexRowSection}>
            <EditSaveButtons
              disabled={hasErrorEdit()}
              hasEditPermission={true}
              isEditing={Boolean(editingGrids.length)}
              isEditMode={useUpsert.isEditable}
              onAction={action => onAction(action)}
            />
          </div>
        )}
        {useUpsert.viewMode === VIEW_MODE.NEW && (
          <div className={classes.flexRowSection}>
            <EditSaveButtons
              disabled={hasError()}
              hasEditPermission={true}
              isEditMode={useUpsert.isEditable}
              onAction={() => createNewUser()}
            />
          </div>
        )}
      </>
    );
  };

  const hasErrorEdit = () => {
    if(props.userStore?.isRoleUpdate){
      return false;
    }
    if (Boolean(editingGrids.length)) {
      return true;
    }
    if (isDataUpdated) {
      return useUpsert.form.hasError || user.status === 'DEPROVISIONED' || user.status === 'DELETED'
    }
    return useUpsert.isActionDisabled;
  };

  const isFutureDate = () => {
    const endDate = useUpsert.form.values().endDate;
    if (!endDate) return true;
    if (moment(endDate).diff(moment.utc()) > 0) return true;
    return false;
  };

  const removeUser = (): void => {
    ModalStore.open(
      <ConfirmDialog
        defaultModal={true}
        title={`Remove ${user.username} user?`}
        message="Do you really want to remove this user? This process cannot be undone."
        yesButton="Remove"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => deleteOktaAndUpdateCSDProfile(user)}
      />
    );
  };

  const deleteOktaAndUpdateCSDProfile = (user: UserModel) => {
    ModalStore.close();
    UIStore.setPageLoader(true);
    props.userStore
      ?.deleteUser(user.oktaUserId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          if (user.csdUserId) {
            props.userStore?.updateCsdUserProfile(CSDProfileModel.obfuscate(user.csdUserId));
          }
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => {
          AlertStore.info('User deleted successfully!');
          navigateToUsers();
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  };

  const openRevokeTokenDialog = (): void => {
    ModalStore.open(
      <ConfirmDialog
        defaultModal={true}
        title="Revoke Token"
        message="Revoke token for user, this will invalidate their current login session."
        yesButton="Continue"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => revokeToken(user.oktaUserId)}
      />
    );
  };

  const revokeToken = (id: string): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.revokeToken(id)
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
  };

  const openUserSessionModal = (user: UserModel): void => {
    ModalStore.open(
      <SessionsModal
        user={user}
        sessionStore={props.sessionStore}
        openSessionDeleteConfirmation={(session: UserSessionModel, user: UserModel) =>
          deleteConfirmationForUserSession(session, user)
        }
      />
    );
  };

  const deleteConfirmationForUserSession = (session: UserSessionModel, user: UserModel): void => {
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
  };

  const deleteSession = (session: UserSessionModel, user: UserModel): void => {
    UIStore.setPageLoader(true);
    props.sessionStore
      ?.deleteSession(user.oktaUserId, session)
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
  };

  const expirePassword = (user: UserModel): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.expirePassword(user.oktaUserId)
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
  };

  /* istanbul ignore next */
  const openConfirmationResetPasswordDialog = (): void =>
    ModalStore.open(
      <Dialog
        key="Dialog"
        title={'Send Password Reset Email'}
        open={true}
        onClose={() => { ModalStore.close() }}
        dialogContent={() => {
          return (
            <>
              <div className={classes.titleBox}>
                Are you sure you want to send the password reset email?
              </div>
              <CardContent className={classes.cardRowBtn}>
                <div className={classes.btnContainer}>
                  <div className={classes.btnSection}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        ModalStore.close();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    className={classes.btnAlign}
                    onClick={() => resetPassword(user)}
                  >
                    Yes
                  </Button>
                </div>
              </CardContent>
            </>
          );
        }}
      />
    );

  const resetPassword = (user: UserModel): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.resetPassword(user.oktaUserId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          AlertStore.info(response.Response);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  };

  const getToggleActivationDialog = (title: string, message: string, yesButton: string) => {
    ModalStore.open(
      <ConfirmDialog
        title={title}
        message={message}
        yesButton={yesButton}
        onNoClick={() => ModalStore.close()}
        onYesClick={() => toggleActivation()}
      />
    );
  };

  const reactivateDialog = (title: string, message: string, yesButton: string) => {
    ModalStore.open(
      <ConfirmDialog
        title={title}
        message={message}
        yesButton={yesButton}
        onNoClick={() => ModalStore.close()}
        onYesClick={() => reactivateUser()}
      />
    );
  };

  const reactivateUser = (): void => {
    UIStore.setPageLoader(true);
    ModalStore.close();
    const { oktaUserId } = user;
    props.userStore
      ?.reactivate(oktaUserId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        () => AlertStore.info('Reactivated user successfully.'),
        (error: AxiosError) => AlertStore.info(error.message)
      );
  };

  const toggleActivation = () => {
    UIStore.setPageLoader(true);
    ModalStore.close();
    const { oktaUserId, status } = user;
    props.userStore
      ?.toggleActivation(oktaUserId, status)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          loadUserData();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const unlockUser = (user: UserModel): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.unlockUser(user.oktaUserId)
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
  };

  const dropdownOptionsList = () => {
    const env = new EnvironmentVarsStore();
    const isADProvider: boolean = user?.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
    return [
      {
        title: 'Unlock',
        isDisabled: user?.status !== USER_STATUS.LOCKED_OUT,
        onClick: () => {
          ModalStore.open(
            <ConfirmDialog
              title="Confirm Unlock"
              message="Are you sure you want to unlock this User?"
              yesButton="Unlock"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => unlockUser(user)}
            />
          );
        },
      },
      {
        title: 'Activate',
        isDisabled: user.status !== USER_STATUS.DEPROVISIONED || isADProvider,
        onClick: () => {
          const message = 'Are you sure you want to activate this User?';
          getToggleActivationDialog('Confirm Activation', message, 'Activate');
        },
      },
      {
        title: 'Delete',
        isDisabled: user?.status !== USER_STATUS.DEPROVISIONED,
        onClick: () => {
          const message = isADProvider
            ? 'Deleting a user sourced by Active Directory will result in them being disconnected.' +
              ' Are you sure you want to delete this User?'
            : 'Are you sure you want to delete this User?';
          ModalStore.open(
            <ConfirmDialog
              title="Confirm Unlock"
              message={message}
              yesButton="Delete"
              onNoClick={() => ModalStore.close()}
              onYesClick={() => removeUser()}
            />
          );
        },
      },
      {
        title: 'Deactivate',
        isDisabled: user.status === USER_STATUS.DEPROVISIONED || user.status === USER_STATUS.DELETED,
        onClick: () => {
          const message = isADProvider
            ? 'Deactivating a user sourced by Active Directory will result in them being disconnected.' +
              ' Are you sure you want to deactivate this User?'
            : 'Are you sure you want to deactivate this User?';
          getToggleActivationDialog('Confirm Deactivation', message, 'Deactivate');
        },
      },
      {
        title: 'Reactivate',
        isDisabled: user.status !== USER_STATUS.PROVISIONED && user.status !== USER_STATUS.RECOVERY,
        onClick: () => {
          const message = 'Are you sure you want to reactivate this User?';
          reactivateDialog('Confirm Reactivate', message, 'Reactivate');
        },
      },
      {
        title: 'Resync User',
        onClick: () => {
          ModalStore.open(
            <Dialog
              key="Dialog"
              title={'Resync User'}
              open={true}
              onClose={() => {
                ModalStore.close();
              }}
              dialogContent={() => {
                return (
                  <>
                    <div>
                      Resync this user from Okta (and CSD if available) to update their user data.
                    </div>
                    <CardContent className={classes.cardRowBtn}>
                      <div className={classes.btnContainer}>
                        <div className={classes.btnSection}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              ModalStore.close();
                            }}
                          >
                                  Cancel
                          </Button>
                        </div>
                        <Button
                          color="primary"
                          variant="contained"
                          size="small"
                          className={classes.btnAlign}
                          onClick={() => resyncUser()}
                        >
                                Yes
                        </Button>
                      </div>
                    </CardContent>
                  </>
                );
              }}
            />
          );
        },
      },
    ];
  };

  const dropdownOptions = (): ReactNode => {
    return (
      <React.Fragment>
        {dropdownOptionsList().map(({ title, onClick, isDisabled }) => (
          <DropdownItem key={title} isDisabled={isDisabled} onClick={onClick}>
            {title}
          </DropdownItem>
        ))}
      </React.Fragment>
    );
  };

  const dropdownOptionsResetPassword = () => {
    return [
      {
        title: 'Generate Temporary Password',
        isDisabled: user.status === USER_STATUS.DEPROVISIONED || isFederation || isADProvider,
        onClick: () => expirePassword(user),
      },
      {
        title: 'Send Password Reset Email',
        isDisabled: isADProvider,
        onClick: () => openConfirmationResetPasswordDialog(),
      },
    ];
  };

  const dropdownOptionsResetList = (): ReactNode => {
    return (
      <React.Fragment>
        {dropdownOptionsResetPassword().map(({ title, onClick, isDisabled }) => (
          <DropdownItem key={title} isDisabled={isDisabled} onClick={onClick}>
            {title}
          </DropdownItem>
        ))}
      </React.Fragment>
    );
  };

  const onValueChangeOption = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    if (fieldKey === 'uvGO' || fieldKey === 'wings' || fieldKey === 'serviceManagement' || fieldKey === 'uplinkUI') {
      if (
        useUpsert.getField('uvGO').value === true ||
        useUpsert.getField('wings').value === true ||
        useUpsert.getField('serviceManagement').value === true ||
        useUpsert.getField('uplinkUI').value === true
      ) {
        setUVGOBox(true);
      } else {
        setUVGOBox(value as boolean);
      }
    }
    if (fieldKey === 'uplinkUI') useUpsert.getField('username').set('rules', 'required');
    else useUpsert.getField('username').set('rules', `required|regex:${regex.email}`);
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const setSearchValue = (_selectedCSDUser: CSDUserModel): void => {
    if (!_selectedCSDUser) {
      setCsdUsers([]);
      setSelectedCSDUser(new CSDUserModel());
    }
    if (_selectedCSDUser == null) {
      useUpsert.getField('firstName').set('');
      useUpsert.getField('lastName').set('');
      useUpsert.getField('username').set('');
      useUpsert.getField('email').set('');
      return;
    }
    setSelectedCSDUser(_selectedCSDUser);
  };

  const loadCsdUsers = (searchValue: string): void => {
    if (searchValue.length <= 2) {
      return;
    }
    const { userStore } = props;
    progressLoader.showLoader();
    userStore
      ?.loadCsdUsers(searchValue)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(response => {
        const user = response[0];
        useUpsert.getField('firstName').set(user.firstName);
        useUpsert.getField('lastName').set(user.lastName);
        useUpsert.getField('username').set(user.email);
        useUpsert.getField('email').set(user.email);
        setCsdUsers(response);
      });
  };

  /* istanbul ignore next */
  const userAudit = (): void => {
    UIStore.setPageLoader(true);
    props.userStore.userAudit(userId())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          ModalStore.close();
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(
        (response: any) => {
          setWarnings(response.Response.Warnings);
        },
      );
  }

  const warningFormat = (): ReactNode => {
    return (
      <React.Fragment>
        {warnings?.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))} 
      </React.Fragment>
    );
  }

  const resyncUser = () => {
    UIStore.setPageLoader(true);
    _syncTroubleshootStore
      .resyncUser(csdUsername, user.username, overwrite.current)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe(
        (response: string) => {
          AlertStore.info(response);
        },
        (error: AxiosError) => AlertStore.critical(error.message)
      );
  }

  return (
    <>
      {useUpsert.viewMode === VIEW_MODE.EDIT && (
        <div className={classes.csdBtn}>
          <div className={classes.btnPosition}>
            <span className={classes.resetBtn}>
              <Dropdown popperContent={dropdownOptionsResetList()} trigger={DROPDOWN_TRIGGER.CLICK} autoclose={false}>
                <PrimaryButton variant="contained">
                  Reset Password
                  <ArrowDropDownOutlinedIcon />
                </PrimaryButton>
              </Dropdown>
            </span>            
            <Button onClick={() => openUserSessionModal(user)}>Sessions</Button>
            <Button onClick={() => openRevokeTokenDialog()}>Revoke Token</Button>
            <Dropdown popperContent={dropdownOptions()} trigger={DROPDOWN_TRIGGER.CLICK} autoclose={false}>
              <PrimaryButton variant="contained">
                More
                <ArrowDropDownOutlinedIcon />
              </PrimaryButton>
            </Dropdown>
          </div>
        </div>
      )}
      <div className={classes.scrollable}>
        <div className={classes.mainContainer}>
          <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
            <Typography variant="h6" className={classes.title}>
              {useUpsert.viewMode === VIEW_MODE.NEW ? 'Create New User' : 'User Profile'}
            </Typography>
            <ViewPermission hasPermission={warnings !== undefined && warnings.length > 0}> 
              <Notification type="warning" message={warningFormat()} />
            </ViewPermission>
            <div className={classes.flexRow}>
              <div className={classes.flexWrap}>
                {useUpsert.viewMode === VIEW_MODE.NEW && (
                  <div className={classes.groupContainer}>
                    <Typography variant="h6" className={classes.subTitle}>
                      Application Groups
                    </Typography>
                    <div className={classes.groupSection}>
                      {applicationGroupsInputControls()
                        .inputControls.filter(inputControl => !inputControl.isHidden)
                        .map((inputControl: IViewInputControl, index: number) => {
                          return (
                            <ViewInputControl
                              {...inputControl}
                              key={index}
                              isExists={inputControl.isExists}
                              classes={{
                                flexRow: classNames({
                                  [classes.inputControlGroup]: true,
                                }),
                              }}
                              field={useUpsert.getField(inputControl.fieldKey || '')}
                              isEditable={useUpsert.isEditable}
                              onValueChange={(option, fieldKey) =>
                                onValueChangeOption(option, inputControl.fieldKey || '')
                              }
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
                {groupInputControls()
                  .inputControls.filter(inputControl => !inputControl.isHidden)
                  .map((inputControl: IViewInputControl, index: number) => {
                    if (Utilities.isEqual(inputControl.fieldKey, 'csdUsername') && useUpsert.isEditable) {
                      return (
                        <>
                          <div className={classes.searchContainer}>
                            <Typography className={classes.titleHeading}>Legacy CSD User</Typography>
                            <AutoCompleteControl
                              placeHolder="Search CSD Users"
                              options={csdUsers.filter(x => Boolean(x.name) && Boolean(x.email) && Boolean(x.fullName))}
                              value={selectedCSDUser || { label: '', value: '' }}
                              filterOption={options =>
                                options.map(option => {
                                  return {
                                    ...option,
                                    label: (option as CsdUserModel).email,
                                  };
                                })
                              }
                              onDropDownChange={selectedOption => setSearchValue(selectedOption as CSDUserModel)}
                              onSearch={(searchValue: string) => loadCsdUsers(searchValue)}
                            />
                          </div>
                        </>
                      );
                    }
                    return (
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        isExists={inputControl.isExists}
                        classes={{
                          flexRow: classNames({
                            [classes.inputControl]: true,
                            [classes.passwordExpired]:
                              inputControl.fieldKey === 'status' &&
                              useUpsert.form.values().status === 'PASSWORD_EXPIRED',
                            [classes.active]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'ACTIVE',
                            [classes.deprovisioned]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'DEPROVISIONED',
                            [classes.lockedOut]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'LOCKED_OUT',
                            [classes.provisioned]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'PROVISIONED',
                            [classes.recovery]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'RECOVERY',
                            [classes.staged]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'STAGED',
                            [classes.suspended]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'SUSPENDED',
                            [classes.rolesField]: inputControl.fieldKey === 'roles',
                            [classes.deleted]:
                              inputControl.fieldKey === 'status' && useUpsert.form.values().status === 'DELETED',
                          }),
                        }}
                        field={useUpsert.getField(inputControl.fieldKey || '')}
                        isEditable={useUpsert.isEditable}
                        onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                      />
                    );
                  })}
              </div>
            </div>
          </DetailsEditorWrapper>
        </div>
      </div>
      {useUpsert.viewMode === VIEW_MODE.EDIT && (
        <UsersSubTab
          isGridDataLoaded={localStates.isGridDataLoaded}
          facts={facts}
          userId={user.userId}
          id={user.id}
          rolesField={props.userStore?.rolesField as UserProfileRolesModel[]}
          upsertRoleField={roles => props.userStore?.setRolesField([ roles ])}
          openRoleFieldDialog={(roleField, viewMode) => openRoleFieldDialog(roleField, viewMode)}
          deleteRoleField={(role: UserProfileRolesModel) => deleteRoleField(role)}
        />
      )}
    </>
  );
};

export default inject(
  'userStore',
  'sessionStore',
  'serviceStore',
  'customerStore',
  'applicationStore',
  'syncTroubleshootStore'
)(observer(UpsertUser));
