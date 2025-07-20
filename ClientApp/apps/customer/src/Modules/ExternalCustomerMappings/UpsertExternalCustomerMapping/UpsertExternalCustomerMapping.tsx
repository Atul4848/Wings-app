import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFilter,
  IOptionValue,
  IdNameCodeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { CustomerRefModel, ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';

import {
  CustomerMappingsStore,
  CustomerModel,
  customerSidebarOptions,
  CustomerStore,
  ExternalCustomerMappingModel,
  SettingsStore,
  updateCustomerSidebarOptions,
  useCustomerModuleSecurity,
} from '../../Shared';
import {
  defaultCustomerData,
  fields,
  isDisabled,
  isMultiSelect,
  mapEntity,
  mapToArray,
  mapToSignleObject,
} from './Fields';
import { useStyles } from './UpsertAccountMapping.styles';

interface Props {
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
  customerMappingsStore?: CustomerMappingsStore;
  sidebarStore?: typeof SidebarStore;
  isCustomerSpecific?: boolean;
  customerTitle?: string;
  backNavLink: string;
  // required auto fill customer data in case we are looking by a specific customer
  defaultCustomer?: CustomerModel;
}

const UpsertExternalCustomerMapping: FC<Props> = ({ defaultCustomer, backNavLink, ...props }) => {
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  // if id avaiable in props then we are looking for a specific customer
  const isCustomerSpecific = Boolean(defaultCustomer?.id);
  const _customerStore = props.customerStore as CustomerStore;
  const _customerMappingsStore = props.customerMappingsStore as CustomerMappingsStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  // used to store dropdown options data
  const [ customerAssociationsData, setCustomerAssociationsData ] = useState(defaultCustomerData);
  const customerModuleSecurity = useCustomerModuleSecurity();
  const [ customerMappingDetails, setCustomerMappingDetails ] = useState(new ExternalCustomerMappingModel());
  const useUpsert = useBaseUpsertComponent<ExternalCustomerMappingModel>(params, fields, baseEntitySearchFilters);
  const errorMessage = 'Combination of Mapping Level, Customer, and External API Key should be unique.';
  const _errorMessage = useUpsert.isAlreadyExistMap.get('account') ? errorMessage : '';
  const _navLink = isCustomerSpecific ? `${backNavLink}/external-customer-mappings` : backNavLink;

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCustomerSidebarOptions('External Customer Mappings'), 'customer');
    const _viewMode = (params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS;
    useUpsert.setViewMode(_viewMode);
    // load mappings
    getExternalCustomerMapping();

    return () => {
      _sidebarStore?.setNavLinks(customerSidebarOptions(false, true), backNavLink);
    };
  }, []);

  const _setCustomerData = customer => {
    setCustomerAssociationsData({
      id: customer.id,
      registries: mapEntity('associatedRegistries', customer.associatedRegistries),
      offices: mapEntity('associatedOffices', customer.associatedOffices),
      operators: mapEntity('associatedOperators', customer.associatedOperators),
    });
  };

  // setup form fileds on initial load and the upsert operations
  const setupFormFields = item => {
    useUpsert.form.reset();
    setCustomerMappingDetails(item);
    const { customerAssociatedRegistries, customerAssociatedOperators, ...rest } = item;
    useUpsert.setFormValues(rest);
    mapCustomer(item.customer);

    // 178691 Customer / Registry / Operator - single customer, single registry, single operator
    const level = item.externalCustomerMappingLevel.name || '';
    const _isMultiSelect = isMultiSelect(level);

    const registries = mapToSignleObject(customerAssociatedRegistries, _isMultiSelect);
    const operators = mapToSignleObject(customerAssociatedOperators, _isMultiSelect);
    useUpsert.getField('customerAssociatedRegistries').set(registries);
    useUpsert.getField('customerAssociatedOperators').set(operators);
  };

  // Make 'Registry', 'Operator', 'Office' required or not required based on the condition
  const setRequiredRule = () => {
    const associatedFields = [ 'Registry', 'Operator', 'Office' ];
    const level = useUpsert.getField('externalCustomerMappingLevel').value?.name || '';
    associatedFields.forEach(key => {
      const fieldKey = Utilities.isEqual(key, 'Registry') ? 'Registrie' : key;
      useUpsert.setFormRules(`customerAssociated${fieldKey}s`, level.toLowerCase().includes(key.toLowerCase()));
    });
    useUpsert.form.validate();
  };

  /* istanbul ignore next */
  const getExternalCustomerMapping = (): void => {
    // if customer speific then auto select customer
    if (!Boolean(params.externalCustomerMappingId)) {
      if (isCustomerSpecific) {
        customerMappingDetails.customer = new CustomerRefModel(defaultCustomer);
      }
      useUpsert.setFormValues(customerMappingDetails);
      return;
    }

    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        Utilities.getFilter('ExternalCustomerMappingId', params?.externalCustomerMappingId),
      ]),
    };
    UIStore.setPageLoader(true);
    _customerMappingsStore
      .getExternalCustomerMappings(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const item = response.results[0];
        if (!item) {
          AlertStore.important(`External Mapping not found with for Id ${params?.externalCustomerMappingId}`);
          return;
        }
        setupFormFields(item);
        setRequiredRule();
      });
  };

  const upsertExternalCustomerMapping = (): void => {
    const { customerAssociatedRegistries, customerAssociatedOperators, customer, ...rest } = useUpsert.form.values();
    const model = new ExternalCustomerMappingModel({
      ...customerMappingDetails,
      ...rest,
      customer: isCustomerSpecific ? defaultCustomer : customer,
      customerAssociatedRegistries: mapToArray(customerAssociatedRegistries),
      customerAssociatedOperators: mapToArray(customerAssociatedOperators),
    });

    UIStore.setPageLoader(true);
    _customerMappingsStore
      .upsertExternalCustomerMapping(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          setupFormFields(response);
        },
        error: error => useUpsert.showAlert(error.message, 'upsertExternalCustomerMapping'),
      });
  };

  const mapCustomer = customer => {
    if (isCustomerSpecific) {
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('PartyId', customer?.partyId) ]),
      specifiedFields: [ 'PartyId', 'Name', 'Number', 'StartDate', 'EndDate' ],
    };
    useUpsert.observeSearch(
      _customerStore
        .getCustomerNoSqlById(request)
        .pipe(tapWithAction(customer => useUpsert.getField('customer').set(new CustomerRefModel(customer))))
    );
  };

  // 178691 Unique Key: Customer + Level + API Key
  const validateCustomerMapping = (): void => {
    const { externalCustomerMappingLevel, customer, externalApiKey } = useUpsert.form.values();
    const _partyId = customer.partyId ? customer?.partyId : customer?.id;
    if (!Boolean(externalCustomerMappingLevel?.name) || !Boolean(customer?.name) || !Boolean(externalApiKey)) return;
    const filters: IAPISearchFilter[] = [
      Utilities.getFilter(
        'ExternalCustomerMappingLevel.ExternalCustomerMappingLevelId',
        externalCustomerMappingLevel.id
      ),
      Utilities.getFilter('Customer.PartyId', _partyId),
      Utilities.getFilter('ExternalApiKey', externalApiKey),
    ];
    const _filters = useUpsert.isAddNew
      ? filters
      : filters.concat(Utilities.getNotFilter('ExternalCustomerMappingId', params?.externalCustomerMappingId));
    UIStore.setPageLoader(true);
    _customerMappingsStore
      .getExternalCustomerMappings({
        pageSize: 0,
        filterCollection: JSON.stringify(_filters),
      })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        useUpsert.setIsAlreadyExistMap(
          new Map(useUpsert.isAlreadyExistMap.set('account', Boolean(response.results?.length)))
        );
      });
  };

  /* istanbul ignore next */
  const loadCustomerAssociations = () => {
    // if we are looking by a specific customer then no need to load data
    if (isCustomerSpecific) {
      _setCustomerData(defaultCustomer);
      return;
    }

    const _customer = useUpsert.getField('customer').value;
    const _partyId = _customer.partyId ? _customer.partyId : _customer.id;
    if (_partyId === customerAssociationsData?.id) {
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('PartyId', _partyId) ]),
      specifiedFields: [ 'PartyId', 'Number', 'AssociatedRegistries', 'AssociatedOffices', 'AssociatedOperators' ],
    };
    useUpsert.observeSearch(
      _customerStore.getCustomerNoSqlById(request).pipe(tapWithAction(customer => _setCustomerData(customer)))
    );
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertExternalCustomerMapping();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode, VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(customerMappingDetails);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(_navLink);
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);

    const clearAssociations = () => {
      useUpsert.clearFormFields([
        'customerAssociatedRegistries',
        'customerAssociatedOperators',
        'customerAssociatedOffices',
      ]);
    };

    switch (fieldKey) {
      case 'externalCustomerMappingLevel':
        clearAssociations();
        setCustomerAssociationsData(defaultCustomerData); // clear options data
        setRequiredRule();
        validateCustomerMapping();
        break;
      case 'customer':
        clearAssociations(); // reset Registries, Operators and Offices
        setCustomerAssociationsData(defaultCustomerData); // clear options data
        validateCustomerMapping();
        break;
      case 'externalApiKey':
        validateCustomerMapping();
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'customerAssociatedRegistries':
      case 'customerAssociatedOperators':
      case 'customerAssociatedOffices':
        loadCustomerAssociations();
        break;
      case 'externalCustomerMappingLevel':
        useUpsert.observeSearch(_settingsStore.getExternalCustomermappingLevels());
        break;
      case 'externalCustomerSource':
        useUpsert.observeSearch(_settingsStore.getExternalCustomerSources());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const onSearch = (searchValue, fieldKey): void => {
    if (fieldKey === 'customer') {
      if (!searchValue.length) {
        _customerStore.customerList = [];
        return;
      }
      const request = {
        filterCollection: JSON.stringify([ Utilities.getFilter('Status.Name', 'Active') ]),
        searchCollection: JSON.stringify([
          { propertyName: 'Name', propertyValue: searchValue },
          { propertyName: 'Number', propertyValue: searchValue, operator: 'or' },
        ]),
        specifiedFields: [ 'PartyId', 'Name', 'Number', 'StartDate', 'EndDate' ],
      };
      useUpsert.observeSearch(
        _customerStore
          .getCustomersNoSql(request)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .pipe(
            tapWithAction(response => {
              _customerStore.customerList = response.results.map(
                x => new IdNameCodeModel({ ...x, id: x.partyId, code: x.number })
              );
            })
          )
      );
    }
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    const customer = useUpsert.getField('customer').value;
    const level = useUpsert.getField('externalCustomerMappingLevel').value?.name || '';

    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'externalCustomerMappingLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.externalCustomermappingLevels,
            customErrorMessage: _errorMessage,
          },
          {
            fieldKey: 'customer',
            type: EDITOR_TYPES.DROPDOWN,
            options: _customerStore.customerList,
            isHalfFlex: true,
            isServerSideSearch: true,
            isDisabled: isCustomerSpecific || Boolean(params.externalCustomerMappingId) || !Boolean(level),
            isLoading: useUpsert.loader.isLoading,
            customErrorMessage: _errorMessage,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'customerAssociatedRegistries',
            type: EDITOR_TYPES.DROPDOWN,
            isLoading: useUpsert.loader.isLoading,
            multiple: isMultiSelect(level),
            options: customerAssociationsData.registries,
            isDisabled: isDisabled('registry', level, customer),
          },
          {
            fieldKey: 'customerAssociatedOperators',
            type: EDITOR_TYPES.DROPDOWN,
            isLoading: useUpsert.loader.isLoading,
            multiple: isMultiSelect(level),
            options: customerAssociationsData.operators,
            isDisabled: isDisabled('operator', level, customer),
          },

          {
            fieldKey: 'customerAssociatedOffices',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: customerAssociationsData.offices,
            isDisabled: isDisabled('office', level, customer),
          },
          {
            fieldKey: 'externalCustomerSource',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.externalCustomerSources,
          },
          {
            fieldKey: 'externalAccountId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'externalApiKey',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: _errorMessage,
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
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
        ],
      },
    ];
  };
  /* istanbul ignore next */
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={isCustomerSpecific ? props.customerTitle : ''}
        backNavLink={_navLink}
        backNavTitle="External Customer Mappings"
        disableActions={
          UIStore.pageLoading ||
          useUpsert.loader.isLoading ||
          useUpsert.form.hasError ||
          !useUpsert.form.changed ||
          _errorMessage
        }
        isEditMode={useUpsert.isEditable}
        hasEditPermission={customerModuleSecurity.isEditable}
        onAction={action => onAction(action)}
      />
    );
  };

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
          onValueChange={onValueChange}
          isLoading={useUpsert.loader.isLoading}
          onFocus={onFocus}
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
  'customerStore',
  'settingsStore',
  'customerMappingsStore',
  'sidebarStore'
)(observer(UpsertExternalCustomerMapping));
