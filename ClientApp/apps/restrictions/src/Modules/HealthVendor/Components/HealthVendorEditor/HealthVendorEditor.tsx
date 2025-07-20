import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  ENTITY_STATE,
  IAPIPageResponse,
  IAPIGridRequest,
  IdNameCodeModel,
  IOptionValue,
} from '@wings-shared/core';
import {
  Collapsable,
  CustomLinkButton,
  DetailsEditorWrapper,
  EditSaveButtons,
  SidebarStore,
} from '@wings-shared/layout';
import {
  AUTHORIZATION_LEVEL,
  HealthAuthStore,
  HealthVendorContactModel,
  HealthVendorModel,
  HealthVendorStore,
  SettingsStore,
  updateRestrictionSidebarOptions,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { ArrowBack } from '@material-ui/icons';
import { useStyles } from './HealthVendorEditor.style';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AirportModel,
  CountryModel,
  ModelStatusOptions,
  StateModel,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import { Observable, forkJoin } from 'rxjs';
import { AuthStore } from '@wings-shared/security';
import {
  AuditFields,
  EDITOR_TYPES,
  IGroupInputControls,
  IViewInputControl,
  ViewInputControl,
} from '@wings-shared/form-controls';
import HealthVendorTabs from '../HealthVendorTabs/HealthVendorTabs';
import { fields } from './Fields';

interface Props {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
  healthVendorStore?: HealthVendorStore;
  sidebarStore?: typeof SidebarStore;
}

const HealthVendorEditor: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const params = useParams();
  const navigate = useNavigate();
  const useUpsert = useBaseUpsertComponent<HealthVendorModel>(params, fields);
  const _healthVendorStore = props.healthVendorStore as HealthVendorStore;
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const [ healthVendor, setHealthVendor ] = useState(new HealthVendorModel());
  const [ healthVendorDetails, setHealthVendorDetails ] = useState(new HealthVendorModel());
  const [ isContactEditing, setIsContactEditing ] = useState(false);
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    props.sidebarStore?.setNavLinks(updateRestrictionSidebarOptions('Health Vendor'), 'restrictions');
    useUpsert.setViewMode((params.mode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    if (!healthVendorId()) {
      useUpsert.setFormValues(healthVendor);
      return;
    }
    UIStore.setPageLoader(true);
    forkJoin([ loadHealthVendorById(), _healthVendorStore.getHealthVendors() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ response ]) => {
        const _healthVendor = new HealthVendorModel(response.results[0]);
        _healthVendorStore.healthVendor = _healthVendor;
        setHealthVendor(_healthVendor);
        setHealthVendorDetails(new HealthVendorModel({ ..._healthVendor }));
        const { authorizationLevel } = _healthVendor;
        useUpsert.setFormRules('vendorLevelEntity', Boolean(authorizationLevel?.id), 'Vendor Level Entity');
        useUpsert.setFormValues(_healthVendor);
      });
    return () => {
      _healthVendorStore.healthVendor = new HealthVendorModel();
    };
  }, []);

  const hasError = (): boolean => {
    return useUpsert.form.hasError || isContactEditing;
  };

  const healthVendorId = (): number => {
    const id = params?.id;
    return Number(id) || 0;
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const healthAuthFilter = { propertyName: 'HealthVendorId', propertyValue: healthVendorId() };
    return {
      filterCollection: JSON.stringify([ healthAuthFilter ]),
    };
  };

  /* istanbul ignore next */
  const loadHealthVendorById = (): Observable<IAPIPageResponse<HealthVendorModel>> => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      ...filterCollection(),
    };
    return _healthVendorStore.getHealthVendorById(request).pipe(takeUntil(unsubscribe.destroy$));
  };

  const authorizationLevel = (): string => {
    return useUpsert.getField('authorizationLevel').value?.label;
  };

  const vendorLevelEntity = (): string => {
    return useUpsert.getField('vendorLevelEntity').value?.label;
  };

  const title = (): string => {
    const { name } = useUpsert.form.values();
    return [ name || 'Name', authorizationLevel() || 'Vendor Level', vendorLevelEntity() || 'Entity' ].join('-');
  };

  /* istanbul ignore next */
  const navigateToHealthVendor = (): void => {
    navigate('/restrictions/health-vendor');
  };

  /* istanbul ignore next */
  const isVendorLevelEntityExists = (old: HealthVendorModel, curr: HealthVendorModel): boolean => {
    if (Utilities.isEqual(authorizationLevel(), AUTHORIZATION_LEVEL.AIRPORT)) {
      return Utilities.isEqual(old.vendorLevelEntity?.label, curr.vendorLevelEntity?.label);
    }
    return Utilities.isEqual(old.vendorLevelEntity?.id, curr.vendorLevelEntity?.id);
  };

  /* istanbul ignore next */
  const isAlreadyExists = (healthVendor: HealthVendorModel): boolean => {
    return _healthVendorStore.healthVendors.some(
      x =>
        !Utilities.isEqual(x.id, healthVendor.id) &&
        Utilities.isEqual(x.authorizationLevel?.id, healthVendor.authorizationLevel?.id) &&
        Utilities.isEqual(x.name, healthVendor.name) &&
        isVendorLevelEntityExists(x, healthVendor)
    );
  };

  /* istanbul ignore next */
  const getVendorLevelEntityCode = (
    vendorLevelEntity: IdNameCodeModel | CountryModel | StateModel | AirportModel
  ): string => {
    let code = '';
    switch (authorizationLevel()) {
      case AUTHORIZATION_LEVEL.COUNTRY:
        code = (vendorLevelEntity as CountryModel)?.isO2Code;
        break;
      case AUTHORIZATION_LEVEL.AIRPORT:
        code = (vendorLevelEntity as AirportModel)?.label;
        break;
      case AUTHORIZATION_LEVEL.STATE:
        code = (vendorLevelEntity as StateModel)?.isoCode;
        break;
    }
    return code || (vendorLevelEntity as IdNameCodeModel)?.code;
  };

  const getUpdatedModel = (): HealthVendorModel => {
    const formValues: HealthVendorModel = useUpsert.form.values();
    const updatedModel = new HealthVendorModel({
      ..._healthVendorStore.healthVendor,
      ...formValues,
      vendorLevelEntityId: formValues.vendorLevelEntity?.id,
      vendorLevelEntityCode: getVendorLevelEntityCode(formValues.vendorLevelEntity),
    });
    return updatedModel;
  };

  /* istanbul ignore next */
  const upsertHealthVendor = (): void => {
    const healthVendor: HealthVendorModel = getUpdatedModel();
    const message = 'A record already exists with the combination selected. Please edit existing record.';
    if (isAlreadyExists(healthVendor)) {
      useUpsert.showAlert(message, 'healthVendorid');
      return;
    }
    UIStore.setPageLoader(true);
    _healthVendorStore
      .upsertHealthVendor(healthVendor)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => navigateToHealthVendor(),
        error: error => AlertStore.critical(error.message),
      });
  };

  const vendorLevelEntityOptions = (): IdNameCodeModel[] | CountryModel[] | StateModel[] | AirportModel[] => {
    switch (authorizationLevel()) {
      case AUTHORIZATION_LEVEL.STATE:
        return _healthAuthStore.states;
      case AUTHORIZATION_LEVEL.AIRPORT:
        return _healthAuthStore.wingsAirports;
      case AUTHORIZATION_LEVEL.COUNTRY:
        return _healthAuthStore.countries;
      default:
        return [];
    }
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'General',
      inputControls: [
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'authorizationLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.authorizationLevels,
          isLoading: true,
        },
        {
          fieldKey: 'vendorLevelEntity',
          type: EDITOR_TYPES.DROPDOWN,
          options: vendorLevelEntityOptions(),
          isLoading: true,
          isDisabled: !Boolean(authorizationLevel()),
        },
        {
          fieldKey: 'accessLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.accessLevels,
          isLoading: true,
        },
        {
          fieldKey: 'sourceType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.sourceTypes,
          isLoading: true,
        },
        {
          fieldKey: 'status',
          type: EDITOR_TYPES.DROPDOWN,
          options: ModelStatusOptions,
        },
      ],
    };
  };

  /* istanbul ignore next */
  const loadAccessLevels = (): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getAccessLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadSourceTypes = (): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getSourceTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadAuthorizationLevels = (): void => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      .getAuthorizationLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadCountries = (propertyValue?: string): void => {
    UIStore.setPageLoader(true);
    const searchCollection = [
      {
        propertyName: 'CommonName',
        operator: 'and',
        propertyValue,
      },
      {
        propertyName: 'ISO2Code',
        operator: 'or',
        propertyValue,
      },
    ];
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchCollection: propertyValue ? JSON.stringify(searchCollection) : null,
    };
    _healthAuthStore
      .getCountries(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadStates = (propertyValue?: string): void => {
    UIStore.setPageLoader(true);
    const searchCollection = [
      {
        propertyName: 'CommonName',
        operator: 'and',
        propertyValue,
      },
      {
        propertyName: 'ISOCode',
        operator: 'or',
        propertyValue,
      },
    ];
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: 10,
      searchCollection: propertyValue ? JSON.stringify(searchCollection) : null,
    };
    _healthAuthStore
      .getStates(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadAirports = (propertyValue?: string): void => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      .getWingsAirport(propertyValue || '')
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadVendorLevelEntityOptions = (): void => {
    switch (authorizationLevel()) {
      case AUTHORIZATION_LEVEL.AIRPORT:
        loadAirports();
        break;
      case AUTHORIZATION_LEVEL.STATE:
        loadStates();
        break;
      default:
        loadCountries();
    }
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'vendorLevelEntity':
        loadVendorLevelEntityOptions();
        break;
      case 'authorizationLevel':
        loadAuthorizationLevels();
        break;
      case 'sourceType':
        loadSourceTypes();
        break;
      case 'accessLevel':
        loadAccessLevels();
        break;
    }
  };

  const onSearch = (value: string, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'vendorLevelEntity'))
      switch (authorizationLevel()) {
        case AUTHORIZATION_LEVEL.AIRPORT:
          loadAirports(value);
          break;
        case AUTHORIZATION_LEVEL.STATE:
          loadStates(value);
          break;
        case AUTHORIZATION_LEVEL.COUNTRY:
          loadCountries(value);
          break;
      }
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    if (Utilities.isEqual('authorizationLevel', fieldKey)) {
      useUpsert.getField('vendorLevelEntity').set('');
      useUpsert.setFormRules('vendorLevelEntity', Boolean(value), 'Vendor Level Entity');
      useUpsert.getField(fieldKey).set(value);
      return;
    }
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const onCancel = (model: HealthVendorModel): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      setHealthVendor(new HealthVendorModel({ ...healthVendorDetails }));
      useUpsert.form.reset();
      useUpsert.setFormValues(model);
      return;
    }
    navigateToHealthVendor();
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertHealthVendor();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel(healthVendorDetails);
        break;
    }
  };

  const getUpdatedContacts = (
    contact: HealthVendorContactModel,
    removeContact: boolean
  ): HealthVendorContactModel[] => {
    const { healthVendorContacts } = _healthVendorStore.healthVendor;
    if (removeContact) {
      return healthVendorContacts.filter(a => !a.isSameData(contact));
    }
    if (!Boolean(contact.tempId || contact.id)) {
      contact.tempId = Utilities.getTempId(true);
      contact.entityState = ENTITY_STATE.MODIFIED;
      _healthVendorStore.healthVendor.healthVendorContacts = [ ...healthVendorContacts, ...[ contact ] ]
      return _healthVendorStore.healthVendor.healthVendorContacts;
    }
    const existingIndex: number = healthVendorContacts.findIndex(x => x.isSameData(contact));
    healthVendorContacts[existingIndex] = contact;
    return healthVendorContacts;
  };

  const updateHealthAuthContacts = (contact: HealthVendorContactModel, removeContact?: boolean): void => {
    const _healthVendor = new HealthVendorModel({
      ...healthVendor,
      healthVendorContacts: getUpdatedContacts(contact, removeContact as boolean),
    });
    setHealthVendor(_healthVendor);
  };

  const tabsLayout = (): ReactNode => {
    return (
      <HealthVendorTabs
        isEditable={useUpsert.isEditable}
        contacts={_healthVendorStore.healthVendor.healthVendorContacts}
        onUpdate={updateHealthAuthContacts}
        onContactEditing={isEditing => setIsContactEditing(isEditing)}
        getField={(fieldKey: string) => useUpsert.getField(fieldKey)}
        onChange={onValueChange}
      />
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        {!useUpsert.isEditable && (
          <CustomLinkButton to="/restrictions/health-vendor" title="Health Vendor" startIcon={<ArrowBack />} />
        )}
        <EditSaveButtons
          disabled={hasError() || UIStore.pageLoading}
          hasEditPermission={restrictionModuleSecurity.isQRGAdmin}
          isEditMode={useUpsert.isEditable}
          isEditing={isContactEditing}
          onAction={onAction}
        />
      </>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.flexRow}>
        <Collapsable title={title()}>
          <div className={classes.flexWrap}>
            {groupInputControls()
              .inputControls.filter(inputControl => !inputControl.isHidden)
              .map((inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  customErrorMessage={inputControl.customErrorMessage}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  isExists={inputControl.isExists}
                  classes={{
                    flexRow: classes.inputControl,
                  }}
                  onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                  onFocus={onFocus}
                  onSearch={onSearch}
                />
              ))}
          </div>
        </Collapsable>
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
        {tabsLayout()}
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject(
  'healthVendorStore',
  'healthAuthStore',
  'settingsStore',
  'sidebarStore'
)(observer(HealthVendorEditor));
