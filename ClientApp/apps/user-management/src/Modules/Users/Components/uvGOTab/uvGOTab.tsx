import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Button, Typography } from '@material-ui/core';
import {
  UserStore,
  UserModel,
  OracleUser,
  UserCacheModel,
  CSDUserModel,
  LookupUserModel,
  CustomerModel,
  SiteModel,
  CustomersStore,
  IAPIUserV3Request,
  IAPIUvgoProfileRequest,
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './uvGOTab.styles';
import { NavigateFunction, useParams } from 'react-router';
import { finalize, takeUntil, switchMap, debounceTime } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import classNames from 'classnames';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import {
  IClasses,
  UIStore,
  Utilities,
  GRID_ACTIONS,
  DATE_FORMAT,
  Loader,
  IOptionValue,
  IAPIGridRequest,
  ISelectOption,
} from '@wings-shared/core';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
  AutoCompleteControl,
} from '@wings-shared/form-controls';
import { ConfirmDialog, DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import UVGOSubTab from '../UVGOSubTab/UVGOSubTab';
import { fields } from './Fields';
import moment from 'moment';
import { useUnsubscribe } from '@wings-shared/hooks';
import Preferences from '../Preferences/Preferences';
import Roles from '../Roles/Roles';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  params?: { mode: VIEW_MODE; id: string };
  userStore?: UserStore;
  customerStore?: CustomersStore;
  navigate?: NavigateFunction;
};

const UVGOTab: FC<Props> = ({ ...props }: Props) => {
  const [ user, setUser ] = useState(new UserModel({ id: '' }));
  const [ oracleUsers, setOracleUsers ] = useState<OracleUser[]>([]);
  const [ assumeUsers, setAssumeUsers ] = useState<UserCacheModel[]>([]);
  const _userDetails = props.userStore?.userDetails;
  const [ csdUsers, setCsdUsers ] = useState<CSDUserModel[]>([]);
  const [ selectedCSDUser, setSelectedCSDUser ] = useState<CSDUserModel | null>(new CSDUserModel());
  const [ selectedOracleUser, setSelectedOracleUser ] = useState<OracleUser | null>(new OracleUser());
  const [ selectedAssumeUser, setSelectedAssumeUser ] = useState<UserCacheModel | null>(new UserCacheModel());
  const [ lookupUser, setLookupUser ] = useState<LookupUserModel>(new LookupUserModel());
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const progressLoader: Loader = new Loader(false);
  const [ site, setSite ] = useState<SiteModel[]>([]);
  const [ selectedSite, setSelectedSite ] = useState<SiteModel | null>(new SiteModel());

  useEffect(() => {
    useUpsert.setViewMode((params?.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.NEW);
    loadUserData();
    return () => {
      props.userStore?.setCustomer([]);
      props.userStore?.setSelectedActiveCustomer(null);
    };
  }, []);

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
          if (!userId()) {
            useUpsert.setFormValues(user);
            return of(null);
          }
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

          if (user?.activeCustomerSite) {
            const activeCustomerSite = new SiteModel({
              number: user.activeCustomerSite,
              location: props.userStore?.selectedActiveCustomer?.sites.find(x => x.number == user.activeCustomerSite)
                ?.location,
            });
            setSite([ ...site, activeCustomerSite ]);
            setSelectedSite(activeCustomerSite);
          }
          if (user.roles) userStore?.setUserRoles(user.roles);

          setUser(new UserModel(user));
          useUpsert.setFormValues(user);

          return forkJoin([
            user.assumeIdentity ? userStore.getCsdUserProfile(user.assumeIdentity) : of(null),
          ]);
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        ([ assumedUser, customer ]: 
          [CSDUserModel, CustomerModel]) => {
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
          if (customer?.customerId) {
            props.userStore.setCustomer([ customer ]);
            props.userStore.setSelectedActiveCustomer(customer);
          }
        }
      );
  };

  const userId = (): string => {
    const { id } = params;
    return id ?? '';
  };

  const confirmVerification = () => {
    return ModalStore.open(
      <ConfirmDialog
        title="Confirm CSD Email Update"
        message={`Are you sure you wish to update the CSD email to: ${user?.email}?`}
        yesButton="Proceed"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => updateEmail(_userDetails.id, user?.email, 'true', 'false')}
      />
    );
  };

  const updateEmail = (userId: number, stagedEmail: string, setLoginEmail: string, resetEmails: string) => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.updateEmail(userId, stagedEmail, setLoginEmail, resetEmails)
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
              props.userStore?.setUserDetail(new CSDUserModel({ ..._userDetails, email: stagedEmail }));
              AlertStore.info('Email verification completed!');
              return;
            }
            props.userStore?.setUserDetail(new CSDUserModel({ ..._userDetails, stagedEmail }));
            AlertStore.info('Staged Email has been updated!');
          }
        },
        error: (error: any) => AlertStore.critical(error.response.data.Errors[0].Message),
      });
  };

  const setSelectedUser = (user: CSDUserModel) => {
    props.userStore?.setUserDetail(user);
    UIStore.setPageLoader(true);
    props.userStore
      ?.lookupUser(user.id, user.email)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(lookupUser => setLookupUser(lookupUser));
  };

  const csdUserInputControls = (): IGroupInputControls => {
    return {
      title: 'CSD Profile',
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
          fieldKey: 'id',
          label:'CSD User ID'
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
  };

  const groupInputControlsProfileReferences = (): IGroupInputControls => {
    return {
      title: 'Users',
      inputControls: [
        {
          fieldKey: 'csdUsername',
          type: EDITOR_TYPES.DROPDOWN,
        },
        {
          fieldKey: 'oracleUser',
          type: EDITOR_TYPES.DROPDOWN,
        },
        {
          fieldKey: 'assumeIdentity',
          type: EDITOR_TYPES.DROPDOWN,
        },
        {
          fieldKey: 'manualAssumedIdentity',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'activeCustomerId',
          type: EDITOR_TYPES.DROPDOWN,
          options: loadCustomers(),
        },
        {
          fieldKey: 'activeCustomerSite',
          type: EDITOR_TYPES.DROPDOWN,
        },
        {
          fieldKey: 'lastLogin',
          type: EDITOR_TYPES.DATE_TIME,
          isDisabled: true,
          dateTimeFormat: DATE_FORMAT.AIRPORT_HOURS_DATE_TIME,
        },
      ],
    };
  };

  const setSearchValue = (_selectedCSDUser: CSDUserModel): void => {
    if (!_selectedCSDUser) {
      setCsdUsers([]);
      setSelectedCSDUser(null);
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
        debounceTime(500),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(response => {
        setCsdUsers(response);
      });
  };

  const setOracleValue = (_selectedUser: OracleUser): void => {
    if (!_selectedUser) {
      setOracleUsers([]);
      setSelectedOracleUser(null);
      return;
    }
    setSelectedOracleUser(_selectedUser);
  };

  const searchOracleUsers = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const { userStore } = props;
    userStore
      ?.searchOracleUsers(value)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(users => setOracleUsers(users));
  };

  const setSearchAssumeValue = (_selectedUser: UserCacheModel): void => {
    if (!_selectedUser) {
      setAssumeUsers([]);
      setSelectedAssumeUser(null);
      return;
    }
    setSelectedAssumeUser(_selectedUser);
  };

  const searchAssumeUsers = (value: string): void => {
    if (value.length <= 2) {
      return;
    }
    const { userStore } = props;
    userStore
      ?.searchUsersCache(value)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(users => setAssumeUsers(users));
  };

  const searchCustomerUsers = (value: string, pageRequest?: IAPIGridRequest): void => {
    if (value.length <= 2) {
      return;
    }
    const { customerStore } = props;
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: value,
      status: 'ACTIVE'
    };
    UIStore.setPageLoader(true);
    customerStore
      ?.getCustomers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => {
        props.userStore.setCustomer(users.results);
      });
  };

  const setCustomerIdValue = (_selectedCustomer: CustomerModel): void => {
    if (!_selectedCustomer) {
      props.userStore.setCustomer([]);
      props.userStore.setSelectedActiveCustomer(null);
      return;
    }
    props.userStore.setSelectedActiveCustomer(_selectedCustomer);
  };

  const setSiteValue = (_selectedSite: SiteModel): void => {
    if (!_selectedSite) {
      return;
    }
    setSelectedSite(_selectedSite);
  };

  const loadCustomers = (): ISelectOption[] => {
    const { customerStore } = props;
    return customerStore?.customer;
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <div className={classes.flexRowSection}>
          <EditSaveButtons
            disabled={hasErrorEdit()}
            hasEditPermission={true}
            isEditMode={useUpsert.isEditable}
            onAction={action => onAction(action)}
          />
        </div>
      </>
    );
  };

  const hasErrorEdit = (): boolean => {
    return (
      useUpsert.form.hasError || UIStore.pageLoading || user.status === 'DEPROVISIONED' || user.status === 'DELETED'
    );
  };

  const onAction = (action: GRID_ACTIONS): void => {
    upsertUser();
  };

  const upsertUser = (): void => {
    UIStore.setPageLoader(true);
    props.userStore
      ?.upsertUser(userId(), getUpsertUserSetting())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => loadUserData(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const getUpsertUserSetting = (): IAPIUserV3Request => {
    const { userStore } = props;
    const uvgoProfile: IAPIUvgoProfileRequest = {
      csdUserId: selectedCSDUser?.id,
      csdUsername: selectedCSDUser?.name,
      assumeIdentity: 
        selectedAssumeUser && selectedAssumeUser.csdUserId != user.csdUserId ? selectedAssumeUser.csdUserId : undefined,
      jobRole: userStore?.jobRoles?.value?.toString(),
      activeCustomerId: props.userStore.selectedActiveCustomer?.id ?? null,
      activeCustomerSite: props.userStore.selectedActiveCustomer === null ? null : selectedSite?.number,
      oracleFNDUserId: selectedOracleUser?.userId,
      oracleFNDUsername: selectedOracleUser?.username,
      preferences: userStore.preferences,
    };
    const userSetting: IAPIUserV3Request = {
      id: user.id,
      oktaUserId: user.oktaUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      status: user.status,
      endDate: user.endDate
        ? moment(user.endDate)
          .set({ hour: 0, minute: 0, second: 0 })
          .format(DATE_FORMAT.API_DATE_FORMAT)
        : null,
      isEmailVerified: user.isEmailVerified,
      ciscoUsername: user.ciscoUsername,
      provider: user.provider,
      roles: userStore?.userRoles.map(role => ({
        userRoleId: role.userRoleId,
        roleId: role.roleId,
        attributes: role.attributes,
      })) ?? [],
      UVGOProfile: uvgoProfile
    };
    return userSetting;
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  return (
    <>
      <div className={classes.csdContainer}>
        <div className={classes.mainContainer}>
          {progressLoader.spinner}
          <div className={classes.csdBtn}>
            <div className={classes.btnPosition}>
              <Button
                disabled={!!_userDetails.email || !Boolean(user?.csdUserId)}
                onClick={() => confirmVerification()}
              >
                Set CSD Email
              </Button>
            </div>  
          </div>
          <Typography variant="h6" className={classes.title}>
            uvGO Profile
          </Typography>
          <div className={classes.uvgoSection}>
            <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
              <div className={classes.profileSection}>
                {groupInputControlsProfileReferences()
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
                              value={selectedCSDUser}
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
                    if (Utilities.isEqual(inputControl.fieldKey, 'oracleUser') && useUpsert.isEditable) {
                      return (
                        <div className={classes.oracleSection}>
                          <div key={userId()} className={classes.searchContainer}>
                            <Typography className={classes.titleHeading}>Legacy Oracle FND User</Typography>
                            <AutoCompleteControl
                              placeHolder="Search Users"
                              options={oracleUsers}
                              value={selectedOracleUser || { label: '', value: '' }}
                              onDropDownChange={selectedOption => setOracleValue(selectedOption as OracleUser)}
                              onSearch={(searchValue: string) => searchOracleUsers(searchValue)}
                            />
                          </div>
                        </div>
                      );
                    }
                    if (Utilities.isEqual(inputControl.fieldKey, 'assumeIdentity') && useUpsert.isEditable) {
                      return (
                        <div className={classes.oracleSection}>
                          <div key={userId()} className={classes.searchContainer}>
                            <Typography className={classes.titleHeading}>Assume Identity</Typography>
                            <AutoCompleteControl
                              placeHolder="Search Users"
                              options={assumeUsers}
                              value={selectedAssumeUser || { label: '', value: '' }}
                              onDropDownChange={selectedOption =>
                                setSearchAssumeValue(selectedOption as UserCacheModel)
                              }
                              onSearch={(searchValue: string) => searchAssumeUsers(searchValue)}
                            />
                          </div>
                        </div>
                      );
                    }

                    if (Utilities.isEqual(inputControl.fieldKey, 'activeCustomerId') && true) {
                      return (
                        <>
                          <div className={classes.searchContainer}>
                            <Typography className={classes.titleHeading}>Active Customer</Typography>
                            <AutoCompleteControl
                              useFitToContentWidth={true}
                              placeHolder="Search Customer"
                              options={props.userStore.customer}
                              value={props.userStore.selectedActiveCustomer}
                              filterOption={options =>
                                options.map(option => {
                                  return {
                                    ...option,
                                    label: (option as CustomerModel).name,
                                  };
                                })
                              }
                              onDropDownChange={selectedOption => setCustomerIdValue(selectedOption as CustomerModel)}
                              onSearch={(searchValue: string) => searchCustomerUsers(searchValue)}
                            />
                          </div>
                        </>
                      );
                    }
                    if (Utilities.isEqual(inputControl.fieldKey, 'activeCustomerSite') && true) {
                      return (
                        <>
                          <div className={classes.searchContainer}>
                            <Typography className={classes.titleHeading}>Active Site</Typography>
                            <AutoCompleteControl
                              field={useUpsert.getField(inputControl.fieldKey)}
                              placeHolder="Search Sites"
                              options={
                                props.userStore.customer
                                  .find(x => x.name === props.userStore.selectedActiveCustomer?.name)
                                  ?.sites.filter(x => x.endDate === null) || []
                              }
                              value={selectedSite || { label: '', value: '' }}
                              onDropDownChange={selectedOption => setSiteValue(selectedOption as SiteModel)}
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
                          }),
                        }}
                        field={useUpsert.getField(inputControl.fieldKey || '')}
                        isEditable={useUpsert.isEditable}
                        onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                      />
                    );
                  })}
                <div className={classes.searchContainer}>
                  <Roles />
                </div>
              </div>
            </DetailsEditorWrapper>
          </div>
          <Typography variant="h6" className={classes.preferencesTitle}>
            Preferences
          </Typography>
          <Preferences id={userId()} preferencesOfList={[]} userStore={props.userStore} />
          <Typography variant="h6" className={classes.title}>
            CSD Profile
          </Typography>
          <div className={classes.flexRow}>
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
                  field={{ value: _userDetails[field.fieldKey], label: field.label }}
                  isEditable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <UVGOSubTab id={userId()} />
    </>
  );
};

export default inject('userStore', 'customerStore')(observer(UVGOTab));
