import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFilter,
  IdNameCodeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  regex,
  tapWithAction,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { IBaseModuleProps, ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { customerFields, disableCustomer, disableOffice, disableSite, fields, selectContactOptions } from './fields';
import {
  CustomerStore,
  RegistryStore,
  SettingsStore,
  CustomerModel,
  OperatorStore,
  CUSTOMER_COMMS_FILTER_BY,
  CONTACT_OPTIONS,
  CustomerContactModel,
  CustomerCommunicationModel,
  CustomerCommunicationAssociatedSitesModel,
  CustomerSiteCommAssociationModel,
  customerCommunicationOptions,
  CONTACT_COMMUNICATION_LEVEL,
  CONTACT_METHOD,
  useCustomerModuleSecurity,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './ContactCommsGeneralInfo.style';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { mapEntity } from './MapOptions';

interface Props extends Partial<IBaseModuleProps> {
  registryStore?: RegistryStore;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
  operatorStore?: OperatorStore;
  isCommunicationView?: boolean;
}

const ContactCommsGeneralInfo: FC<Props> = ({
  registryStore,
  settingsStore,
  customerStore,
  operatorStore,
  sidebarStore,
  isCommunicationView,
}: Props) => {
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const navigate = useNavigate();
  const _registryStore = registryStore as RegistryStore;
  const _operatorStore = operatorStore as OperatorStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const [ customer, setCustomer ] = useState<CustomerModel>(new CustomerModel());
  const [ communications, setCommunications ] = useState<CustomerCommunicationModel[]>([]);
  const [ isUnique, setIsUnique ] = useState(true);
  const [ isCustomerUnique, setIsCustomerUnique ] = useState(true);
  const customerModuleSecurity = useCustomerModuleSecurity();
  const _associatedRegistries = useMemo(() => mapEntity('associatedRegistries', customer.associatedRegistries), [
    customer,
  ]);
  const _associatedOperators = useMemo(() => mapEntity('associatedOperators', customer.associatedOperators), [
    customer,
  ]);
  const _associatedOffices = useMemo(() => mapEntity('associatedOffices', customer.associatedOffices), [ customer ]);
  const _associatedSites = useMemo(() => mapEntity('associatedSites', customer.associatedSites), [ customer ]);
  const _registries = useMemo(() => mapEntity('registries', _registryStore.registryList), [
    _registryStore.registryList,
  ]);
  // eslint-disable-next-line max-len
  const _operators = useMemo(() => mapEntity('operators', _operatorStore.operatorList), [ _operatorStore.operatorList ]);

  /* istanbul ignore next */
  const contactBasePath = () => {
    return params?.communicationId && params?.contactId
      ? `customer/contacts/${params.contactId}/communication/${params.communicationId}/${params.viewMode}`
      : 'customer/contacts/new';
  };

  /* istanbul ignore next */
  const communicationBasePath = () => {
    return params?.communicationId && params?.contactId
      ? `customer/communications/${params.communicationId}/contact/${params.contactId}/${params.viewMode}`
      : 'customer/communications/new';
  };

  const basePath = isCommunicationView ? communicationBasePath() : contactBasePath();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(customerCommunicationOptions(!Boolean(params?.communicationId)), basePath);
    loadContact();

    return () => {
      clear();
    };
  }, []);

  const clear = () => {
    _customerStore.selectedContact = new CustomerContactModel();
    _customerStore.customerList = [];
    _customerStore.searchContacts = [];
    setCustomer(new CustomerModel());
  };

  /* istanbul ignore next */
  const setFormValues = () => {
    const { selectedContact } = _customerStore;
    const communication: CustomerCommunicationModel =
      selectedContact.communications?.find(x => x.id === Number(params.communicationId)) ||
      new CustomerCommunicationModel();
    setRules(formRules[communication.communicationLevel?.name]);
    useUpsert.setFormValues({
      ...selectedContact,
      contact: selectedContact?.contact,
      registry:
        communication?.communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.REGISTRY
          ? communication?.registryAssociations
          : communication?.registries,
      operator:
        communication?.communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.OPERATOR
          ? communication?.operatorAssociations
          : communication?.operators,
      communications: communication,
    });
  };

  const resetFields = () => {
    [
      'communications.customer',
      'registry',
      'operator',
      'communications.sites',
      'communications.offices',
      'communications.sequence',
    ].forEach(field => {
      useUpsert.getField(field).set('');
    });
  };

  const setRules = (rules: { [key: string]: boolean }) => {
    if (!rules) return;
    Object.entries(rules).forEach(([ key, ruleValue ]) => {
      useUpsert.setFormRules(key, ruleValue);
    });
  };

  const resetContactFields = () => {
    [ 'contact', 'contactMethod', 'contactName', 'contactExtension', 'contactType' ].forEach(field => {
      useUpsert.getField(field).set('');
    });
  };

  const contactRule = (rule: string) => {
    useUpsert.getField('contact').set('rules', rule);
  };

  const isPhoneContactMethod = (value: string) =>
    Boolean(value)
      ? Utilities.isEqual(value, CONTACT_METHOD.PHONE) || Utilities.isEqual(value, CONTACT_METHOD.FAX)
      : false;

  const setContactRules = value => {
    if (isPhoneContactMethod(value)) {
      if (!regex.phoneNumberWithSpaceAndDash.test(getContact())) {
        useUpsert.getField('contact').set('');
      }
      contactRule(`required|regex:${regex.phoneNumberWithSpaceAndDash}`);
      return;
    }
    if (Utilities.isEqual(value, CONTACT_METHOD.EMAIL)) {
      if (!regex.email.test(getContact())) {
        useUpsert.getField('contact').set('');
      }
      contactRule('required|email');
      return;
    }
    contactRule('required|string');
  };

  const validateContact = (): void => {
    const contactValue = getContactValue();
    const contactName = useUpsert.getField('contactName').value;
    const contactType = useUpsert.getField('contactType').value?.id;
    const contactMethod = useUpsert.getField('contactMethod').value?.id;
    const contactId = getContactId();

    if (!Boolean(contactValue?.length) || contactValue?.length < 4) {
      return;
    }
    const filters: IAPISearchFilter[] = [
      Utilities.getFilter('ContactValue', contactValue),
      { propertyName: 'ContactName', propertyValue: contactName || null },
      { propertyName: contactType ? 'ContactType.ContactTypeId' : 'ContactType', propertyValue: contactType || null },
      {
        propertyName: contactMethod ? 'ContactMethod.ContactMethodId' : 'ContactMethod',
        propertyValue: contactMethod || null,
      },
    ];
    _customerStore
      .getContactsNoSql({
        filterCollection: JSON.stringify(filters),
      })
      .pipe()
      .subscribe(({ results }) => {
        const filterExistingContact = results.filter(x => x.id !== Number(contactId));
        useUpsert.setIsAlreadyExistMap(
          new Map(useUpsert.isAlreadyExistMap.set('contact', Boolean(filterExistingContact?.length)))
        );
      });
  };

  const formRules: { [key: string]: { [key: string]: boolean } } = {
    [CUSTOMER_COMMS_FILTER_BY.CUSTOMER]: {
      'communications.customer': true,
      'communications.sites': false,
      'communications.offices': false,
      operator: false,
      registry: false,
    },
    [CUSTOMER_COMMS_FILTER_BY.REGISTRY]: {
      registry: true,
      operator: false,
      'communications.customer': false,
      'communications.sites': false,
      'communications.offices': false,
    },
    [CUSTOMER_COMMS_FILTER_BY.CUSTOMER_REGISTRY]: {
      registry: true,
      operator: false,
      'communications.customer': true,
      'communications.sites': false,
      'communications.offices': false,
    },
    [CUSTOMER_COMMS_FILTER_BY.OPERATOR]: {
      operator: true,
      'communications.customer': false,
      'communications.sites': false,
      'communications.offices': false,
      registry: false,
    },
    [CUSTOMER_COMMS_FILTER_BY.SITE]: {
      'communications.sites': true,
      'communications.customer': true,
      'communications.offices': false,
      operator: false,
      registry: false,
    },
    [CUSTOMER_COMMS_FILTER_BY.OFFICE]: {
      'communications.offices': true,
      'communications.customer': true,
      'communications.sites': false,
      operator: false,
      registry: false,
    },
    [CUSTOMER_COMMS_FILTER_BY.CUSTOMER_OFFICE]: {
      'communications.offices': true,
      'communications.customer': true,
      'communications.sites': false,
      operator: false,
      registry: false,
    },
  };

  const isCommunicationLevelExist = (): boolean => {
    const communicationLevel = useUpsert.getField('communications.communicationLevel').value;
    return communications?.some(
      x =>
        x.communicationLevel.id === communicationLevel?.id &&
        x.communicationLevel.id !== CONTACT_COMMUNICATION_LEVEL.CUSTOMER
    );
  };

  const onValueChange = (value, fieldKey): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'contactLinkType':
        resetContactFields();
        setCommunications([]);
        if (value?.label === CONTACT_OPTIONS.LINK_EXISTING_CONTACT) {
          contactRule('required');
        }
        break;
      case 'contactMethod':
        setContactRules(value?.label?.toLowerCase());
        validateContact();
        break;
      case 'contact':
        if (isExistingContact()) {
          if (!value) {
            resetContactFields();
            setCommunications([]);
          } else {
            useUpsert.setFormValues(value);
            setCommunications(value.communications);
          }
          useUpsert.getField(fieldKey).set(value);
        }
        validateContact();
        break;
      case 'contactType':
      case 'contactName':
        validateContact();
        break;
      case 'communications.communicationLevel':
        const rules =
          !isCommunicationLevelExist() && Boolean(value)
            ? formRules[value?.name]
            : {
              'communications.customer': false,
              'communications.sites': false,
              'communications.offices': false,
              operator: false,
              registry: false,
            };
        setRules(rules);
        resetFields();
        if (isCommunicationLevelExist()) {
          useUpsert.showAlert(
            `Customer Communication already exists for Communication Level - ${value?.name}`,
            'CustomerCommunicationAlert'
          );
        }
        break;
      case 'communications.customer':
        resetFields();
        setCustomer(new CustomerModel());
        setIsUnique(true);
        useUpsert.getField(fieldKey).set(value);
        const communicationLevel = useUpsert.getField('communications.communicationLevel').value;
        if (
          communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.OFFICE ||
          communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.CUSTOMER_OFFICE
        ) {
          validateSequence();
        }
        if (communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.CUSTOMER) {
          validateCustomer();
        }
        break;
      case 'communications.offices':
        if (!Boolean(value.length)) {
          useUpsert.getField('communications.sequence').set('');
        }
        break;
      case 'communications.sequence':
        validateSequence();
        break;
      default:
        break;
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const validateSequence = () => {
    const sequence = useUpsert.getField('communications.sequence').value;
    const customer = useUpsert.getField('communications.customer').value;
    const communicationLevel = useUpsert.getField('communications.communicationLevel').value;
    if (!sequence || !customer.value) return;
    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Communications.CommunicationLevel.Name',
          propertyValue: Utilities.isEqual(communicationLevel?.name, CUSTOMER_COMMS_FILTER_BY.OFFICE)
            ? 'Office'
            : 'CustomerOffice',
          operator: 'and',
        },
        {
          propertyName: 'Communications.Sequence',
          propertyValue: Number(sequence),
          operator: 'and',
        },
        {
          propertyName: 'Communications.Customer.PartyId',
          propertyValue: customer.value,
          operator: 'and',
        },
      ]),
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getContactsNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        unsubscribe.setHasLoaded(true);
        if (Boolean(response.results.length)) {
          const officeCommunications = response.results.flatMap(result =>
            result.communications.filter(communication =>
              Utilities.isEqual(communicationLevel?.name, CUSTOMER_COMMS_FILTER_BY.OFFICE)
                ? communication.communicationLevel.name === CUSTOMER_COMMS_FILTER_BY.OFFICE
                : communication.communicationLevel.name === CUSTOMER_COMMS_FILTER_BY.CUSTOMER_OFFICE &&
                  communication.id !== Number(params?.communicationId)
            )
          );
          if (Boolean(officeCommunications.length)) {
            setIsUnique(false);
            return;
          }
        }
        setIsUnique(true);
      });
  };

  const validateCustomer = () => {
    const customer = useUpsert.getField('communications.customer').value;
    if (!customer?.value) return;
    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Communications.CommunicationLevel.Name',
          propertyValue: 'Customer',
          operator: 'and',
        },
        {
          propertyName: 'ContactId',
          propertyValue: Number(getContactId()),
          operator: 'and',
        },
        {
          propertyName: 'Communications.Customer.PartyId',
          propertyValue: customer.value,
          operator: 'and',
        },
      ]),
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getContactsNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        unsubscribe.setHasLoaded(true);
        if (Boolean(response.results.length)) {
          const customerCommunications = response.results.flatMap(result =>
            result.communications.filter(communication => {
              return (
                communication.communicationLevel.name === CUSTOMER_COMMS_FILTER_BY.CUSTOMER &&
                communication.id !== Number(params?.communicationId)
              );
            })
          );
          const isCustomerExist = customerCommunications?.some(
            communication => communication.customer?.id === customer.id
          );
          if (isCustomerExist) {
            setIsCustomerUnique(false);
            return;
          }
        }
        setIsCustomerUnique(true);
      });
  };

  /* istanbul ignore next */
  const loadContact = (): void => {
    if (!params.contactId) {
      unsubscribe.setHasLoaded(true);
      useUpsert.setFormRules('contactLinkType', true);
      return;
    }
    UIStore.setPageLoader(true);
    _customerStore
      .getContactById(Number(params.contactId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _customerStore.selectedContact = response;
        setFormValues();
        unsubscribe.setHasLoaded(true);
      });
  };

  /* istanbul ignore next */
  const loadCustomerData = customerNumber => {
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'Number', propertyValue: customerNumber }]),
    };
    return _customerStore.getCustomerNoSqlById(request).pipe(
      tapWithAction(customer => {
        setCustomer(customer);
      })
    );
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'offices':
      case 'registry':
      case 'operator':
      case 'sites':
        const isCustomerlevel = customerFields.includes(
          useUpsert.getField('communications.communicationLevel').value?.name
        );
        const customerNumber = useUpsert.getField('communications.customer').value?.code;
        if (isCustomerlevel) {
          useUpsert.observeSearch(loadCustomerData(customerNumber));
        }
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'contactMethod':
        useUpsert.observeSearch(_settingsStore.getContactMethod());
        break;
      case 'contactType':
        useUpsert.observeSearch(_settingsStore.getContactType());
        break;
      case 'contactRole':
        useUpsert.observeSearch(_settingsStore.getContactRole());
        break;
      case 'communicationLevel':
        useUpsert.observeSearch(_settingsStore.getCommunicationLevel());
        break;
      case 'communicationCategories':
        useUpsert.observeSearch(_settingsStore.getCommunicationCategories());
        break;
      case 'priority':
        useUpsert.observeSearch(_settingsStore.getPriority());
        break;
    }
  };

  const getContact = () => useUpsert.getField('contact').value;

  const getContactLinkType = (): string => useUpsert.getField('contactLinkType').value?.label;

  const isExistingContact = () => getContactLinkType() === CONTACT_OPTIONS.LINK_EXISTING_CONTACT;

  const getContactId = () => (params.contactId ? params.contactId : isExistingContact() ? getContact()?.id : 0);

  const getContactValue = () => (isExistingContact() ? getContact()?.contactValue : getContact());

  /* istanbul ignore next */
  const upsertContact = (): void => {
    const { registry, operator, communications } = useUpsert.form.values();
    const { communicationLevel, offices, sites, customer } = communications;
    const communicationAssociatedSites = sites
      ? sites?.map(
          site =>
            new CustomerCommunicationAssociatedSitesModel({
              id: params.contactId ? site.id : 0,
              customerAssociatedSite: new CustomerSiteCommAssociationModel(site.customerAssociatedSite),
            })
        )
      : [];

    const request = new CustomerContactModel({
      ...useUpsert.form.values(),
      id: getContactId(),
      contact: getContactValue(),
      communications: [
        new CustomerCommunicationModel({
          id: params?.communicationId ? params?.communicationId : 0,
          ...communications,
          offices: offices || [],
          operators: operator || [],
          sites: communicationAssociatedSites,
          registries: registry || [],
          customer: customer,
          registryAssociations: communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.REGISTRY ? registry : [],
          operatorAssociations: communicationLevel?.id === CONTACT_COMMUNICATION_LEVEL.OPERATOR ? operator : [],
        }),
      ],
    });
    UIStore.setPageLoader(true);
    _customerStore
      .upsertContact(request, Number(params?.communicationId) || 0)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: CustomerContactModel) => {
          if (useUpsert.isAddNew) {
            const communicationLevelId = useUpsert.getField('communications.communicationLevel').value?.id;
            const _communication = response.communications.find(x => x.communicationLevel.id === communicationLevelId);
            if (isCommunicationView) {
              navigate(
                `/customer/communications/${_communication?.id}/contact/${response.id}/edit`,
                useUpsert.noBlocker
              );
              return;
            }
            navigate(`/customer/contacts/${response.id}/communication/${_communication?.id}/edit`, useUpsert.noBlocker);
            return;
          }
          useUpsert.form.reset();
          _customerStore.selectedContact = response;
          setFormValues();
          if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string): void => {
    const communicationLevel = useUpsert.getField('communications.communicationLevel').value?.name;
    const request = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: searchValue },
        { propertyName: 'Number', propertyValue: searchValue, operator: 'or' },
      ]),
    };
    switch (fieldKey) {
      case 'customer':
        UIStore.setPageLoader(true);
        _customerStore
          .getCustomersNoSql(request)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => {
            _customerStore.customerList = response.results
              .filter(({ status }: CustomerModel) => status?.name === 'Active')
              .map(item => new IdNameCodeModel({ id: item.partyId, name: item.name, code: item.number }));
          });
        break;
      case 'registry':
        if (communicationLevel === CUSTOMER_COMMS_FILTER_BY.REGISTRY) {
          UIStore.setPageLoader(true);
          _registryStore
            .getRegistriesNoSql(request)
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe(response => {
              _registryStore.registryList = response.results;
            });
        }
        break;
      case 'operator':
        if (communicationLevel === CUSTOMER_COMMS_FILTER_BY.OPERATOR) {
          UIStore.setPageLoader(true);
          _operatorStore
            .getOperatorsNoSql(request)
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe(response => {
              _operatorStore.operatorList = response.results;
            });
        }
        break;
      case 'contact':
        const contactRequest = {
          searchCollection: JSON.stringify([{ propertyName: 'ContactValue', propertyValue: searchValue }]),
        };
        UIStore.setPageLoader(true);
        _customerStore
          .getContactsNoSql(contactRequest)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => {
            _customerStore.searchContacts = response.results.filter(
              ({ status }: CustomerContactModel) => status?.name === 'Active'
            );
          });
        break;
      default:
        break;
    }
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertContact();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          setFormValues();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(`/customer/${isCommunicationView ? 'communications' : 'contacts'}`);
        break;
    }
  };

  const disabledContactExtension = () => {
    const contactMethod = useUpsert.getField('contactMethod').value?.label?.toLowerCase();
    return contactMethod ? !isPhoneContactMethod(contactMethod) : true;
  };

  const isRegistryDisabled = (communicationLevel: CUSTOMER_COMMS_FILTER_BY, hasCustomerValue: boolean) => {
    switch (communicationLevel) {
      case CUSTOMER_COMMS_FILTER_BY.REGISTRY:
        return isCommunicationLevelExist() && communicationLevel === CUSTOMER_COMMS_FILTER_BY.REGISTRY;
      case CUSTOMER_COMMS_FILTER_BY.CUSTOMER:
      case CUSTOMER_COMMS_FILTER_BY.CUSTOMER_REGISTRY:
        return !hasCustomerValue;
      default:
        return true;
    }
  };

  const isOperatorDisabled = (communicationLevel: CUSTOMER_COMMS_FILTER_BY, hasCustomerValue: boolean) => {
    switch (communicationLevel) {
      case CUSTOMER_COMMS_FILTER_BY.OPERATOR:
        return isCommunicationLevelExist() && communicationLevel === CUSTOMER_COMMS_FILTER_BY.OPERATOR;
      case CUSTOMER_COMMS_FILTER_BY.CUSTOMER:
        return !hasCustomerValue;
      default:
        return true;
    }
  };

  const isDisabled = (key: string) => {
    const communicationLevel = useUpsert.getField('communications.communicationLevel').value;
    const hasCustomerValue = Boolean(useUpsert.getField('communications.customer').value);
    switch (key) {
      case 'customer':
        return (
          !Boolean(communicationLevel) ||
          communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.OPERATOR ||
          communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.REGISTRY ||
          (isCommunicationLevelExist() &&
            (disableCustomer.includes(communicationLevel?.name) ||
              disableSite.includes(communicationLevel?.name) ||
              disableOffice.includes(communicationLevel?.name)))
        );
      case 'sites':
        return hasCustomerValue
          ? disableOffice.includes(communicationLevel?.name) ||
              communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.CUSTOMER_REGISTRY
          : true;
      case 'offices':
        return hasCustomerValue
          ? disableSite.includes(communicationLevel?.name) ||
              communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.CUSTOMER_REGISTRY
          : true;
      case 'sequence':
        return (
          !((communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.OFFICE ||
            communicationLevel?.name === CUSTOMER_COMMS_FILTER_BY.CUSTOMER_OFFICE) &&
          Boolean(useUpsert.getField('communications.offices').value.length))
        );
      case 'operator':
        return isOperatorDisabled(communicationLevel?.name, hasCustomerValue);
      case 'registry':
        return isRegistryDisabled(communicationLevel?.name, hasCustomerValue);
      default:
        return false;
    }
  };

  const displayCustomerErrorMsg = () => {
    if (!isUnique) {
      return 'Combination of Customer and Sequence should be unique at Office level';
    }
    if (!isCustomerUnique) {
      return 'Customer should be unique at Customer level';
    }
    return '';
  };

  const groupInputControls = (): IGroupInputControls[] => {
    const editorType = isExistingContact() ? EDITOR_TYPES.DROPDOWN : EDITOR_TYPES.TEXT_FIELD;
    // Make inputs disabled until contactLinkType is not selected
    const isContactLinkTypeSelected = Boolean(getContactLinkType());
    const contactValue = useUpsert.getField('contact').value;
    // if it's a new contact or we are linking existing then editing not allowed
    const disableContactInfo = !Boolean(getContactLinkType()) || (isExistingContact() && !contactValue);
    const communicationLevel = useUpsert.getField('communications.communicationLevel').value;

    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'contactLinkType',
            type: EDITOR_TYPES.DROPDOWN,
            options: selectContactOptions,
            isHidden: !useUpsert.isAddNew,
          },
          {
            fieldKey: 'contactMethod',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.contactMethod,
            isDisabled: (disableContactInfo && useUpsert.isAddNew) || isExistingContact(),
            customErrorMessage: useUpsert.isAlreadyExistMap.get('contact')
              ? 'Combination of Contact, Contact Name, Contact Type and Contact Method should be unique.'
              : '',
          },
          {
            fieldKey: 'contact',
            type: editorType,
            isDisabled: !isContactLinkTypeSelected && useUpsert.isAddNew,
            options: isExistingContact() ? _customerStore.searchContacts : [],
            customErrorMessage: useUpsert.isAlreadyExistMap.get('contact')
              ? 'Combination of Contact, Contact Name, Contact Type and Contact Method should be unique.'
              : '',
            isServerSideSearch: isExistingContact(),
          },
          {
            fieldKey: 'contactExtension',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: disabledContactExtension() || isExistingContact(),
          },
          {
            fieldKey: 'contactName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: (disableContactInfo && useUpsert.isAddNew) || isExistingContact(),
            customErrorMessage: useUpsert.isAlreadyExistMap.get('contact')
              ? 'Combination of Contact, Contact Name, Contact Type and Contact Method should be unique.'
              : '',
          },
          {
            fieldKey: 'contactType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.contactType,
            isDisabled: (disableContactInfo && useUpsert.isAddNew) || isExistingContact(),
            customErrorMessage: useUpsert.isAlreadyExistMap.get('contact')
              ? 'Combination of Contact, Contact Name, Contact Type and Contact Method should be unique.'
              : '',
          },
        ],
      },
      {
        title: 'Communications',
        inputControls: [
          {
            fieldKey: 'communications.communicationLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.communicationLevel,
            isDisabled: useUpsert.isAddNew ? !isContactLinkTypeSelected : !useUpsert.isAddNew,
          },
          {
            fieldKey: 'communications.customer',
            type: EDITOR_TYPES.DROPDOWN,
            options: _customerStore.customerList,
            isDisabled: isDisabled('customer'),
            useControlledValue: true,
            isServerSideSearch: true,
            useFitToContentWidth: true,
            customErrorMessage: displayCustomerErrorMsg(),
          },
          {
            fieldKey: 'communications.sites',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _associatedSites,
            isDisabled: isDisabled('sites'),
            useControlledValue: true,
          },
          {
            fieldKey: 'communications.offices',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _associatedOffices,
            isDisabled: isDisabled('offices'),
            useControlledValue: true,
          },
          {
            fieldKey: 'communications.sequence',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isDisabled('sequence'),
            customErrorMessage: !isUnique
              ? 'Combination of Customer and Sequence should be unique at Office level'
              : '',
          },
          {
            fieldKey: 'operator',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            useControlledValue: true,
            options: customerFields.includes(communicationLevel?.name) ? _associatedOperators : _operators,
            isDisabled: isDisabled('operator'),
            isServerSideSearch: !customerFields.includes(communicationLevel?.name),
          },
          {
            fieldKey: 'registry',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            useControlledValue: true,
            options: customerFields.includes(communicationLevel?.name) ? _associatedRegistries : _registries,
            isDisabled: isDisabled('registry'),
            isServerSideSearch: !customerFields.includes(communicationLevel?.name),
          },
          {
            fieldKey: 'communications.contactRole',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.contactRole,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params.communicationId),
          },
          {
            fieldKey: 'communications.communicationCategories',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            useControlledValue: true,
            options: _settingsStore.communicationCategories,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params.communicationId),
          },
          {
            fieldKey: 'communications.priority',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.priority,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params.communicationId),
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'communications.startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('communications.endDate').value,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params.communicationId),
          },
          {
            fieldKey: 'communications.endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('communications.startDate').value,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params?.communicationId),
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params?.communicationId),
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params?.communicationId),
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
            isDisabled: !isContactLinkTypeSelected && !Boolean(params?.communicationId),
          },
        ],
      },
    ];
  };

  const headerActions = (): ReactNode => (
    <DetailsEditorHeaderSection
      title={_customerStore.selectedContact.contactName}
      backNavTitle={`${isCommunicationView ? 'Communications' : 'Contacts'}`}
      backNavLink={`/customer${isCommunicationView ? '/communications' : '/contacts'}`}
      isEditMode={useUpsert.isEditable}
      hasEditPermission={customerModuleSecurity.isEditable}
      onAction={action => onAction(action)}
      disableActions={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
    />
  );

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onFocus={onFocus}
          onValueChange={onValueChange}
          onSearch={onSearch}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'registryStore',
  'settingsStore',
  'customerStore',
  'operatorStore',
  'sidebarStore'
)(observer(ContactCommsGeneralInfo));
