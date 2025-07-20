import { Button, Typography } from '@material-ui/core';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { BaseCustomerStore, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useStyles } from './UserProfileRoleField.styles';
import { observer, inject } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  UserProfileRolesModel,
  ServicesStore,
  ServicesModel,
  RolesModel,
  CustomerModel,
  CustomersStore,
  SiteModel,
  UserModel,
  ApplicationsStore,
  ApplicationsModel,
  RegistryModel,
} from '../../../Shared';
import { fields } from './Fields';
import classNames from 'classnames';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IClasses,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
} from '@wings-shared/core';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
  AutoCompleteControl,
  SelectOption,
} from '@wings-shared/form-controls';
import { observable } from 'mobx';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';
import { useParams } from 'react-router-dom';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ROLE_ACCESS_TYPE } from '../../../Shared/Enums';

function getIsoStringWithTimeZone(date: Date): string {
  const timezoneOffset = new Date().getTimezoneOffset();
  date.setMinutes(date.getMinutes() - timezoneOffset);
  return date.toISOString();
}


type Props = {
  classes: IClasses;
  title: string;
  roleField?: UserProfileRolesModel;
  viewMode?: VIEW_MODE;
  rolesField?: UserProfileRolesModel[];
  upsertRoleField: (roleField: UserProfileRolesModel) => void;
  serviceStore?: ServicesStore;
  customerStore?: CustomersStore;
  applicationStore?: ApplicationsStore;
  registryStore?: BaseCustomerStore;
  user?: UserModel;
};

const UserProfileRoleField: FC<Props> = ({ ...props }: Props) => {
  const [ customers, setCustomers ] = useState<CustomerModel[]>([]);
  const [ selectedServices, setSelectedServices ] = useState<ServicesModel | null>(new ServicesModel());
  const [ selectedCustomer, setSelectedCustomer ] = useState<CustomerModel | null>(new CustomerModel());
  const [ selectedRole, setSelectedRole ] = useState<RolesModel | null>(new RolesModel());
  const [ selectedSite, setSelectedSite ] = useState<SiteModel | null>(new SiteModel());
  const localStates = observable({ showInlineError: false });
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const [ selectedApplication, setSelectedApplication ] = useState<ApplicationsModel | null>(new ApplicationsModel());
  const applicationStore = props.applicationStore as ApplicationsStore;
  const uvgoSelection = selectedServices?.roles.find(x => x.isUvgoAppRole);
  const [ registry, setRegistry ] = useState<RegistryModel[]>([]);
  const [ selectedRegistry, setSelectedRegistry ] = useState<RegistryModel | null>(new RegistryModel());

  useEffect(() => {
    const { roleField, viewMode } = props;

    if (viewMode === VIEW_MODE.EDIT && roleField.isExternal) {
      searchCustomerUsers(roleField?.customer?.name);
      fillCustomerAndSite();
    }
  }, []);

  useEffect(() => {
    const { roleField } = props;
    if(roleField?.id){
      const service = props.serviceStore?.services.find(x => x.roles.some(y => y.name === roleField?.name));

      setSelectedApplication(new ApplicationsModel({ id: service?.applicationId, name: service?.applicationName }));
      setSelectedServices(new ServicesModel({ ...service, roles: [ new RolesModel(roleField) ] }));
      setSelectedRole(new RolesModel(roleField));
      const site = new SiteModel({ number: roleField?.attributes.find(x => x.type === 'Site')?.value });
      setSelectedCustomer(new CustomerModel({
        name: roleField?.attributes.find(x => x.type === 'Customer')?.value,
        sites: [ site ],
      }));
      setSelectedSite(site);
      setSelectedRegistry(new RegistryModel({
        name: roleField?.attributes.find(x => x.type === 'Registry')?.value,
      }));
      useUpsert.setFormValues(roleField);
      useUpsert.getField('appService').set(selectedServices);
      useUpsert.getField('roles').set(selectedRole);
      useUpsert.getField('sites').set(selectedSite);
    }
  }, []);

  /**
   * To facilitate testing, the QA team should be able to assign uvx roles to users.
   * You can only assign uvx roles to users whose names belong to domains "universalweather.net" or "univ-wea.com".
   * NB! This must work ONLY for the DEV environment.
   */
  const isQADev = (): boolean => {
    const allowedDomains = [ 'universalweather.net', 'univ-wea.com' ];
    const domain: string = props.user?.username?.split('@')[1]?.toLowerCase() ?? '';
    const env = new EnvironmentVarsStore();
    const isDevEnvironment: boolean = env.getVar(ENVIRONMENT_VARS.HOST_ENVIRONMENT) === 'DEV';

    if (!isDevEnvironment || !domain) return false;

    return allowedDomains.includes(domain);
  }

  const loadAppServices = (): ISelectOption[] => {
    const env = new EnvironmentVarsStore();
    const { serviceStore, user } = props;
    const isInternal: boolean = user?.provider === env.getVar(ENVIRONMENT_VARS.UWA_AD_PROVIDER);
    const uvXAppServiceId: string = env.getVar(ENVIRONMENT_VARS.UVX_APP_SERVICE_ID);
    const services = serviceStore?.services.filter(
      ({ enabled, id }) => enabled && (isInternal || id !== uvXAppServiceId)
    );
    const servicesForQADev = serviceStore?.services.filter(
      x => x.enabled && x.applicationId === selectedApplication?.id
    );

    const filterServices = services.filter(x => x.applicationId === selectedApplication?.id);

    return isQADev() ? servicesForQADev : filterServices;
  }

  const loadCustomers = (): ISelectOption[] => {
    const { customerStore } = props;
    return customerStore?.customer.filter(x => x.status === 'ACTIVE');
  }

  const groupInputControls = (): IGroupInputControls => {
    const isHiddenField = (): boolean => {
      if (!selectedRole?.roleId) return true;
      return !uvgoSelection || selectedRole.isInternal;
    }

    const isHiddenDateField = () => {
      const accessType = useUpsert.getField('accessType').value;
      return isHiddenField() || accessType === ROLE_ACCESS_TYPE.STANDARD;
    }

    return {
      title: 'RoleField',
      inputControls: [
        {
          fieldKey: 'applicationName',
          type: EDITOR_TYPES.DROPDOWN,
          options: applicationStore?.applications,
        },
        {
          fieldKey: 'appService',
          type: EDITOR_TYPES.DROPDOWN,
          options: loadAppServices(),
          isHidden: !selectedApplication?.id,
        },
        {
          fieldKey: 'roles',
          type: EDITOR_TYPES.DROPDOWN,
          isExists: isExists(),
          isHidden: !selectedApplication?.id,
        },
        {
          fieldKey: 'customer',
          type: EDITOR_TYPES.DROPDOWN,
          options: loadCustomers(),
          isHidden: isHiddenField(),
        },
        {
          fieldKey: 'sites',
          type: EDITOR_TYPES.DROPDOWN,
          isHidden: isHiddenField(),
        },
        {
          fieldKey: 'registry',
          type: EDITOR_TYPES.DROPDOWN,
          isHidden: isHiddenField(),
        },
        {
          fieldKey: 'accessType',
          type: EDITOR_TYPES.RADIO,
          isHidden: isHiddenField(),
          selectControlOptions: [
            new SelectOption({ id: 1, name: 'Standard', value: ROLE_ACCESS_TYPE.STANDARD }),
            new SelectOption({ id: 2, name: 'Trial', value: ROLE_ACCESS_TYPE.TRIAL }),
            new SelectOption({ id: 3, name: 'Subscription', value: ROLE_ACCESS_TYPE.SUBSCRIPTION }),
          ],
        },
        {
          fieldKey: 'validFrom',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          is12HoursFormat: false,
          isHidden: isHiddenDateField(),
        },
        {
          fieldKey: 'validTo',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          is12HoursFormat: false,
          isHidden: isHiddenDateField(),
        },
      ],
    };
  }

  const canAddRole = () => {
    const { rolesField } = props;
    const existedRoles = rolesField?.filter(role => role.roleId === selectedRole?.roleId);

    if (!selectedRole?.roleId) {
      return true;
    }

    if (selectedRole?.isExternal && (!selectedCustomer?.id || !selectedSite?.number)) {
      return true;
    }

    if (selectedRole?.isInternal && existedRoles.length) {
      return false;
    }

    if (selectedRole?.isExternal && existedRoles.length) {
      const roleExists = existedRoles.some(role => {
        return role.customer?.customerId === selectedCustomer?.id && role.site?.number === selectedSite?.number;
      });

      return !roleExists;
    }

    return true;
  }

  const canEditRole = () => {
    const { roleField, rolesField } = props;

    if (roleField?.isInternal && (roleField?.roleId === selectedRole?.roleId)) {
      return true;
    }

    if (roleField.customer?.customerId === selectedCustomer?.id && roleField.site?.number === selectedSite?.number) {
      return true;
    }

    const existedRoles = rolesField?.filter(role => role.roleId === selectedRole?.roleId);

    if (selectedRole?.isInternal && existedRoles.length) {
      return false;
    }

    if (selectedRole?.isExternal && existedRoles.length) {
      const roleExists = existedRoles.some(role => {
        return role.customer?.customerId === selectedCustomer?.id && role.site?.number === selectedSite?.number;
      });

      return !roleExists;
    }

    return true;
  }

  const isExists = (): boolean => props.viewMode === VIEW_MODE.NEW ? !canAddRole() : !canEditRole();

  const isSelectionInvalid = (): boolean => {
    if (!selectedServices?.name || !selectedRole?.name) return true;

    if (selectedRole.isExternal && selectedRole.isUvgoAppRole) {
      return !(selectedCustomer?.name && selectedSite?.name);
    }

    return false;
  }

  const setServiceValue = (_selectedService: ServicesModel): void => {
    resetRolesFields();
    if (!_selectedService) {
      setSelectedServices(null);
      useUpsert.getField('appService').set(null);
      return;
    }
    setSelectedServices(_selectedService);
    useUpsert.getField('appService').set(_selectedService);
  }

  const setRolesValue = (_selectedRole: RolesModel): void => {
    if (!_selectedRole) {
      resetRolesFields();
      return;
    }
    setSelectedRole(_selectedRole);
    useUpsert.getField('roles').set(_selectedRole);
  }

  const setSiteValue = (_selectedSite: SiteModel): void => {
    if (!_selectedSite) {
      resetSitesFields();
      return;
    }
    setSelectedSite(_selectedSite);
  }

  const resetRolesFields = () => {
    setSelectedRole(null);
    useUpsert.getField('roles').set(null);
  }

  const resetSitesFields = () => {
    setSelectedSite(null);
    useUpsert.getField('sites').set(null);
  }

  const setCustomerValue = (_selectedCustomer: CustomerModel): void => {
    resetSitesFields()
    if (!_selectedCustomer) {
      setCustomers([]);
      setSelectedCustomer(null);
      useUpsert.getField('customer').set(null);
      return;
    }
    setSelectedCustomer(_selectedCustomer);
    useUpsert.getField('customer').set(_selectedCustomer);
  }

  const fillCustomerAndSite = () => {
    const { roleField, customerStore } = props;
    const siteNumber = roleField?.site?.number;
    const customerId = roleField?.customer?.customerId;

    if (!customerId) return;

    UIStore.setPageLoader(true);

    customerStore
      .getCustomer(customerId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false)),
      )
      .subscribe((customer: CustomerModel) => {
        const site: SiteModel = customer.sites.find((siteItem: SiteModel) => siteItem.number === siteNumber);

        setSelectedCustomer(customer);
        setSelectedSite(site);
        useUpsert.getField('customer').set(customer);
        useUpsert.getField('sites').set(site);
      });
  }

  const searchCustomerUsers = (value: string, pageRequest?: IAPIGridRequest): void => {
    if (value?.length <= 2) {
      return;
    }
    const { customerStore } = props;
    const request: IAPIGridRequest = {
      ...pageRequest,
      searchCollection: value,
      status: 'ACTIVE',
    };
    UIStore.setPageLoader(true);
    customerStore?.getCustomers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => {
        setCustomers(users.results);
      });
  }

  const setRegistryValue = (_selectedRegistry: RegistryModel): void => {
    if (!_selectedRegistry) {
      setRegistry([]);
      setSelectedRegistry(null);
      useUpsert.getField('registry').set(null);
      return;
    }
    setSelectedRegistry(_selectedRegistry);
    useUpsert.getField('registry').set(_selectedRegistry);
  }

  const searchRegistry = (value: string, pageRequest?: IAPIGridRequest): void => {
    if (value?.length <= 2) {
      return;
    }
    const { registryStore } = props;
    const request: IAPIGridRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: value },
      ]),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    registryStore?.getRegistriesNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(users => {
        setRegistry(users.results);
      });
  }

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const presetValidityDates = (accessType: string): void => {
    const validFromField = useUpsert.getField('validFrom');
    const validToField = useUpsert.getField('validTo');
    const today = new Date();

    switch(accessType as ROLE_ACCESS_TYPE) {
      case ROLE_ACCESS_TYPE.TRIAL:
        const inOneMonth = new Date();
        const timezoneOffset = new Date().getTimezoneOffset();
        inOneMonth.setMonth(today.getMonth() + 1);
        inOneMonth.setMinutes(inOneMonth.getMinutes() - timezoneOffset);

        validFromField.set(getIsoStringWithTimeZone(today));
        validToField.set(getIsoStringWithTimeZone(inOneMonth));
        break;
      case ROLE_ACCESS_TYPE.SUBSCRIPTION:
        const inOneYear = new Date();
        inOneYear.setFullYear(today.getFullYear() + 1);

        validFromField.set(getIsoStringWithTimeZone(today));
        validToField.set(getIsoStringWithTimeZone(inOneYear));
        break;
      case ROLE_ACCESS_TYPE.STANDARD:
        validFromField.set('');
        validToField.set('');
        break;
      default:
        break;
    }
  }

  const dialogContent = () => {
    const { upsertRoleField } = props;
    return (
      <div>
        <div className={classes.formatContainer}>
          {groupInputControls().inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
              if (Utilities.isEqual(inputControl.fieldKey, 'applicationName')) {
                return (
                  <>
                    <div className={classes.searchContainer}>
                      <Typography className={classes.titleHeading}>Application Name</Typography>
                      <AutoCompleteControl
                        placeHolder="Search Application Name"
                        options={applicationStore?.applications}
                        value={selectedApplication || { label: '', value: '' }}
                        onDropDownChange={option => {
                          setSelectedApplication(option as ApplicationsModel);
                        }}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'appService')) {
                return (
                  <>
                    <div className={classes.searchContainer}>
                      <Typography className={classes.titleHeading}>App Service</Typography>
                      <AutoCompleteControl
                        placeHolder="Search App Services"
                        options={loadAppServices()}
                        value={selectedServices || { label: '', value: '' }}
                        onDropDownChange={selectedOption => setServiceValue(selectedOption as ServicesModel)}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'roles')) {
                return (
                  <>
                    <div className={classes.searchContainerRole}>
                      <AutoCompleteControl
                        isExists={isExists()}
                        field={useUpsert.getField(inputControl.fieldKey)}
                        placeHolder="Search Role"
                        options={
                          props.serviceStore?.services.find(x => x.name === selectedServices?.name)
                            ?.roles.filter(y => y.enabled) || []
                        }
                        value={selectedRole || { label: '', value: '' }}
                        customRenderOption={(option: RolesModel) => {
                          return (
                            <>
                              <div className={classes.roleOptionHeader}>
                                <span className={classes.roleOptionName}>
                                  {option.name}
                                </span>
                                <span className={classes.roleOptionType}>
                                  {option.isExternal ? 'external' : 'internal'}
                                </span>
                              </div>
                              <div className={classes.roleOptionDescription}>
                                {option.description}
                              </div>
                            </>
                          );
                        }}
                        onDropDownChange={selectedOption =>
                          setRolesValue(selectedOption as RolesModel)
                        }
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'customer')) {
                return (
                  <>
                    <div className={classes.label}>Associations</div>
                    {localStates.showInlineError && (
                      <div className={classes.filledError}>uvGO Services require a customer and site association.</div>
                    )}
                    <div className={classes.searchContainer}>
                      <Typography className={classes.titleHeading}>Customer</Typography>
                      <AutoCompleteControl
                        useFitToContentWidth={true}
                        placeHolder="Search Customer"
                        options={customers}
                        value={selectedCustomer}
                        filterOption={options =>
                          options.map(option => {
                            return {
                              ...option,
                              label: (option as CustomerModel).name,
                            };
                          })
                        }
                        onDropDownChange={selectedOption => setCustomerValue(selectedOption as CustomerModel)}
                        onSearch={(searchValue: string) => searchCustomerUsers(searchValue)}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'sites')) {
                return (
                  <>
                    <div className={classes.searchContainerRole}>
                      <AutoCompleteControl
                        field={useUpsert.getField(inputControl.fieldKey)}
                        placeHolder="Search Sites"
                        options={
                          customers
                            .find(x => x.name === selectedCustomer?.name)
                            ?.sites.filter(x => x.endDate === null) || []
                        }
                        value={selectedSite || { label: '', value: '' }}
                        onDropDownChange={selectedOption => setSiteValue(selectedOption as SiteModel)}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'registry')) {
                return (
                  <>
                    <div className={classes.searchContainer}>
                      <Typography className={classes.titleHeading}>Registry</Typography>
                      <AutoCompleteControl
                        placeHolder="Search Registry"
                        options={registry}
                        value={selectedRegistry}
                        filterOption={options =>
                          options.map(option => {
                            return {
                              ...option,
                              label: (option as RegistryModel).name,
                            };
                          })
                        }
                        onDropDownChange={selectedOption => setRegistryValue(selectedOption as RegistryModel)}
                        onSearch={(searchValue: string) => searchRegistry(searchValue)}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'accessType')) {
                return (
                  <>
                    <div className={classes.trialTitle}>
                      Access Type
                    </div>
                    <ViewInputControl
                      {...inputControl}
                      key={index}
                      isExists={inputControl.isExists}
                      classes={{
                        flexRow: classNames({
                          [classes.inputControl]: true,
                          [classes.trialCheckbox]: true,
                        }),
                      }}
                      field={useUpsert.getField(inputControl.fieldKey)}
                      showLabel={false}
                      isEditable={true}
                      onValueChange={(option) => {
                        presetValidityDates(option);
                        onValueChange(option, inputControl.fieldKey);
                      }}
                    />
                  </>
                );
              }

              if (Utilities.isEqual(inputControl.fieldKey, 'validFrom')) {
                return (
                  <>
                    <div className={classes.validityTitle}>
                      Role validity period
                    </div>
                    <div className={classes.dateFromContainer}>
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        isExists={inputControl.isExists}
                        classes={{
                          flexRow: classNames({
                            [classes.inputControl]: true,
                          }),
                        }}
                        field={useUpsert.getField(inputControl.fieldKey)}
                        isEditable={true}
                        allowKeyboardInput={false}
                        onValueChange={(option) => onValueChange(option, inputControl.fieldKey)}
                        is12HoursFormat={false}
                      />
                    </div>
                  </>
                );
              }
              if (Utilities.isEqual(inputControl.fieldKey, 'validTo')) {
                return (
                  <>
                    <div className={classes.dateToContainer}>
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        isExists={inputControl.isExists}
                        classes={{
                          flexRow: classNames({
                            [classes.inputControl]: true,
                          }),
                        }}
                        field={useUpsert.getField(inputControl.fieldKey)}
                        isEditable={true}
                        allowKeyboardInput={false}
                        onValueChange={(option) => onValueChange(option, inputControl.fieldKey)}
                        is12HoursFormat={false}
                      />
                    </div>
                  </>
                );
              }

              return (
                <>
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    isExists={inputControl.isExists}
                    classes={{
                      flexRow: classNames({
                        [classes.inputControl]: true,
                      }),
                    }}
                    field={useUpsert.getField(inputControl.fieldKey)}
                    isEditable={true}
                    onValueChange={(option) => onValueChange(option, inputControl.fieldKey)}
                  />
                </>
              );
            })}
          <div className={classes.btnContainer}>
            <div className={classes.btnContainerCancel}>
              <Button color="primary" variant="contained" size="small" onClick={() => ModalStore.close()}>
                Cancel
              </Button>
            </div>
            <div className={classes.btnContainerSave}>
              <Button
                color="primary"
                variant="contained"
                size="small"
                disabled={useUpsert.form.hasError || isExists()}
                onClick={() => {
                  if(isSelectionInvalid()) {
                    localStates.showInlineError = true;
                    return;
                  }
                  localStates.showInlineError = false;

                  const { accessType, validFrom, validTo } = useUpsert.form.values();

                  if(selectedCustomer?.label) {
                    delete (selectedCustomer as any).label
                  }
                  const model = new UserProfileRolesModel({
                    ...selectedRole,
                    id: useUpsert.viewMode === VIEW_MODE.NEW ? 0 : props.roleField?.id,
                    customer: new CustomerModel(selectedCustomer),
                    site: selectedSite,
                    accessType: accessType,
                    validFrom: validFrom,
                    validTo: validTo,
                    registry: selectedRegistry,
                    userRoleId: useUpsert.viewMode === VIEW_MODE.NEW ? '' : props.roleField?.userRoleId,
                  });
                  upsertRoleField(model);
                }}
              >
                {props.viewMode === VIEW_MODE.NEW ? 'Save' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      title={props.title}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.dialogWidth,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent() as ReactNode}
    />
  );
}
export default inject(
  'serviceStore',
  'customerStore',
  'applicationStore',
  'registryStore'
)(observer(UserProfileRoleField));
