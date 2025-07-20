import React, { useEffect, useState } from 'react';
import {
  VIEW_MODE,
  CountryModel,
  StateModel,
  ModelStatusOptions,
  AirportModel,
  useBaseUpsertComponent,
} from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { fields } from './Fields';
import {
  AFFECTED_TYPE,
  AUTHORIZATION_LEVEL,
  HealthAuthModel,
  HealthAuthorizationOverviewModel,
  HealthAuthStore,
  SettingsStore,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmDialog } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

export interface BaseProps {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
  viewMode?: VIEW_MODE;
}

const useHealthAuthorizationGeneralBase = ({ ...props }) => {
  const suspendNotificationMessage: string = `This will uncheck the Suspend Automated Email Creation Checkbox,
  allowing surveys to be sent. Do you want to proceed?`;
  const params = useParams();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields);
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const [ isExistsFieldKey, setIsExistsFieldKey ] = useState<string>('');

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  const customErrorMessage = (): string => {
    if (Boolean(isExistsFieldKey)) {
      return 'A record already exists with the combination selected. Please edit existing record.';
    }
    return '';
  };

  const healthAuthorization = (): HealthAuthModel => {
    return new HealthAuthModel(_healthAuthStore?.selectedHealthAuth);
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const healthAuthFilter = { propertyName: 'HealthAuthorizationId', propertyValue: healthAuthId() };
    return {
      filterCollection: JSON.stringify([ healthAuthFilter ]),
    };
  };

  const setToDetailMode = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setFormValues(healthAuthorization());
    setAffectedTypeRules(healthAuthorization().affectedType, 'affectedType');
  };

  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched) {
        return _useConfirmDialog.confirmAction(
          () => {
            ModalStore.close(), setToDetailMode();
          },
          {
            onNo: () => ModalStore.close(),
            title: 'Confirm Cancellation',
            onClose: () => ModalStore.close(),
          }
        );
      }
      setToDetailMode();
      return;
    }
    if (viewMode === VIEW_MODE.NEW) {
      _healthAuthStore.selectedHealthAuth = new HealthAuthModel();
    }
    navigateToRestrictions();
  };

  /* istanbul ignore next */
  const navigateToRestrictions = (): void => {
    navigate('/restrictions');
  };

  const healthAuthId = (): number => {
    return Number(params?.id) || 0;
  };

  const isTravelHistory = (): boolean => {
    return useUpsert.getField('affectedType').value?.label === 'Travel History';
  };

  const authorizationLevel = (): string => {
    return useUpsert.getField('authorizationLevel').value?.label;
  };

  const isNationalityAll = (): boolean => {
    const nationalities: CountryModel[] = useUpsert.getField('healthAuthNationalities').value;
    if (!nationalities?.length) {
      return false;
    }
    return nationalities?.some(x => x.label === 'All');
  };

  const hasNationalitiesExcluded = (): boolean => {
    const healthAuthorizationExcludedNationalities: CountryModel[] = useUpsert.getField(
      'healthAuthorizationExcludedNationalities'
    ).value;
    return Boolean(healthAuthorizationExcludedNationalities?.length);
  };

  const isTravelHistoryAll = (): boolean => {
    const nationalities: CountryModel[] = useUpsert.getField('healthAuthTraveledCountries').value;
    if (!nationalities?.length) {
      return false;
    }
    return nationalities?.some(x => x.label === 'All');
  };

  // QRGDataManagement user should not be able to edit specific fields in edit mode.
  const isQRGDMEditing = (): boolean => {
    return restrictionModuleSecurity.isQRGDataManagement && Boolean(healthAuthId());
  };

  const getContryOptions = (): CountryModel[] => {
    return [ new CountryModel({ id: Utilities.getTempId(true), isO2Code: 'All' }), ..._healthAuthStore.countries ];
  };

  const regionId = (): number | null => {
    const selectedRegion: ISelectOption = useUpsert.getField('region').value;
    return Utilities.getNumberOrNullValue(selectedRegion?.value as number);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'General',
      inputControls: [
        {
          fieldKey: 'authorizationLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.authorizationLevels,
          isLoading: useUpsert.loader.isLoading,
          isDisabled: isQRGDMEditing(),
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'levelDesignator',
          type: EDITOR_TYPES.DROPDOWN,
          options: levelDesignatorOptions(),
          isLoading: useUpsert.loader.isLoading,
          isDisabled: isQRGDMEditing() || !Boolean(authorizationLevel()),
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'infectionType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.infectionTypes,
          isLoading: useUpsert.loader.isLoading,
          isDisabled: isQRGDMEditing(),
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'affectedType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.affectedTypes,
          isLoading: useUpsert.loader.isLoading,
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'region',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.regions,
          isDisabled: isTravelHistory(),
        },
        {
          fieldKey: 'healthAuthNationalities',
          type: EDITOR_TYPES.DROPDOWN,
          options: getContryOptions(),
          multiple: true,
          isDisabled: isTravelHistory(),
          isLoading: useUpsert.loader.isLoading,
          customErrorMessage: customErrorMessage(),
          getChipLabel: option => (option as CountryModel).isO2Code,
          getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
          showChipTooltip: true,
        },
        {
          fieldKey: 'healthAuthorizationExcludedNationalities',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.countries,
          multiple: true,
          isDisabled: isTravelHistory() || !isNationalityAll(),
          getChipLabel: option => (option as CountryModel).isO2Code,
          getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
          showChipTooltip: true,
        },
        {
          fieldKey: 'healthAuthTraveledCountries',
          type: EDITOR_TYPES.DROPDOWN,
          options: getContryOptions(),
          multiple: true,
          isDisabled: useUpsert.getField('affectedType').value?.label === 'Nationality',
          isLoading: useUpsert.loader.isLoading,
          customErrorMessage: customErrorMessage(),
          getChipLabel: option => (option as CountryModel).isO2Code,
          getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
          showChipTooltip: true,
        },
        {
          fieldKey: 'healthAuthorizationExcludedTraveledCountries',
          type: EDITOR_TYPES.DROPDOWN,
          options: _healthAuthStore.countries,
          multiple: true,
          isLoading: useUpsert.loader.isLoading,
          isDisabled: useUpsert.getField('affectedType').value?.label === 'Nationality' || !isTravelHistoryAll(),
          customErrorMessage: customErrorMessage(),
          getChipLabel: option => (option as CountryModel).isO2Code,
          isHidden: true,
        },
        {
          fieldKey: 'status',
          type: EDITOR_TYPES.DROPDOWN,
          options: ModelStatusOptions,
          isDisabled: isQRGDMEditing(),
        },
        {
          fieldKey: 'statusChangeReason',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'isSuspendNotification',
          type: EDITOR_TYPES.CHECKBOX,
        },
        {
          fieldKey: 'accessLevel',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.accessLevels,
          isLoading: useUpsert.loader.isLoading,
          isDisabled: isQRGDMEditing(),
        },
        {
          fieldKey: 'sourceType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _settingsStore.sourceTypes,
          isLoading: useUpsert.loader.isLoading,
          isDisabled: isQRGDMEditing(),
        },

        {
          fieldKey: 'receivedBy',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'receivedDate',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
        },

        {
          fieldKey: 'requestedBy',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'requestedDate',
          type: EDITOR_TYPES.DATE,
          dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
        },
        {
          fieldKey: 'daysCountToReceivedDate',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'daysCountToRequestedDate',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    switch (fieldKey) {
      case 'affectedType':
        setAffectedTypeRules(value, fieldKey);
        useUpsert.getField(fieldKey).set(value);
        validateUnique(fieldKey);
        break;
      case 'authorizationLevel':
        useUpsert.getField('levelDesignator').set('');
        useUpsert.setFormRules('levelDesignator', Boolean(value), 'Level Designator');
        useUpsert.getField(fieldKey).set(value);
        validateUnique(fieldKey);
        break;
      case 'healthAuthNationalities':
      case 'healthAuthTraveledCountries':
        setMultiSelectRules(value as CountryModel[], fieldKey);
        validateUnique(fieldKey);
        if (!isTravelHistoryAll()) {
          useUpsert.clearFormFields([ 'healthAuthorizationExcludedTraveledCountries' ]);
        }
        if (!isNationalityAll()) {
          useUpsert.clearFormFields([ 'healthAuthorizationExcludedNationalities' ]);
        }
        if (isNationalityAll()) {
          useUpsert.getField('region').set(null);
        }
        break;
      case 'receivedBy':
      case 'levelDesignator':
      case 'infectionType':
      case 'status':
      case 'sourceType':
        useUpsert.getField(fieldKey).set(value);
        validateUnique(fieldKey);
        break;
      case 'receivedDate':
        if (!value) {
          return;
        }
        setReceivedDate(value as string);
        break;
      case 'region':
        useUpsert.getField(fieldKey).set(value);
        useUpsert.clearFormFields([ 'healthAuthNationalities' ]);
        if (Boolean(regionId())) {
          loadCountries('', fieldKey);
          useUpsert.clearFormFields([ 'healthAuthorizationExcludedNationalities' ]);
        }
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
  };

  const setReceivedDate = (value: string): void => {
    if (Utilities.isEqual(value, 'Invalid date')) {
      useUpsert.getField('receivedDate').set(value);
      return;
    }
    const isSuspendNotification: boolean = useUpsert.getField('isSuspendNotification').value;
    const receivedDate: string = useUpsert.getField('receivedDate').value;
    if (isSuspendNotification && !Utilities.isSameDate(value, receivedDate)) {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Change"
          message={suspendNotificationMessage}
          yesButton="Yes"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            ModalStore.close();
            useUpsert.getField('isSuspendNotification').set(false);
          }}
        />
      );
    }
    useUpsert.getField('receivedDate').set(value);
    validateUnique('receivedDate');
  };

  /* istanbul ignore next */
  const validateUnique = (fieldKey: string): void => {
    useUpsert.form.validate();
    if (!useUpsert.form.isValid) {
      return;
    }
    UIStore.setPageLoader(true);
    const healthAuth: HealthAuthorizationOverviewModel = new HealthAuthorizationOverviewModel(getUpdatedModel());
    _healthAuthStore
      .validateUnique(healthAuth)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => setIsExistsFieldKey(''),
        error: () => {
          setIsExistsFieldKey(getExistsFieldKey(fieldKey));
          useUpsert.showAlert(customErrorMessage(), 'healthAuthAlert');
        },
      });
  };

  const getExistsFieldKey = (fieldKey: string): string => {
    const uniqueFieldKeys = [
      'authorizationLevel',
      'levelDesignator',
      'infectionType',
      'affectedType',
      'healthAuthNationalities',
      'healthAuthTraveledCountries',
    ];
    return uniqueFieldKeys.includes(fieldKey) ? fieldKey : 'healthAuthNationalities';
  };

  /* istanbul ignore next */
  const loadAuthorizationLevels = (): void => {
    useUpsert.loader.setLoadingState(true);
    _healthAuthStore
      .getAuthorizationLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadCountries = (propertyValue?: string, fieldKey?: string): void => {
    const isRegionId: boolean = Boolean(regionId());
    useUpsert.loader.setLoadingState(true);
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
    const filterCollection = [
      {
        propertyName: 'AssociatedRegions.RegionId',
        propertyValue: regionId(),
      },
    ];
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: isRegionId ? 0 : 10,
      searchCollection: propertyValue ? JSON.stringify(searchCollection) : null,
      filterCollection: isRegionId && !isNationalityAll() ? JSON.stringify(filterCollection) : null,
    };
    _healthAuthStore
      .getCountries(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe(response => {
        if (isRegionId && fieldKey === 'region') {
          useUpsert.getField('healthAuthNationalities').set(response);
        }
      });
  };

  /* istanbul ignore next */
  const loadStates = (propertyValue?: string): void => {
    useUpsert.loader.setLoadingState(true);
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
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadAffectedTypes = (): void => {
    useUpsert.loader.setLoadingState(true);
    _healthAuthStore
      .getAffectedTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadInfectionTypes = (): void => {
    useUpsert.loader.setLoadingState(true);
    _healthAuthStore
      .getInfectionTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const laodAccessLevels = (): void => {
    useUpsert.loader.setLoadingState(true);
    _settingsStore
      .getAccessLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadSourceTypes = (): void => {
    useUpsert.loader.setLoadingState(true);
    _settingsStore
      .getSourceTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadRegions = (): void => {
    if (_healthAuthStore.regions?.length) {
      return;
    }
    useUpsert.loader.setLoadingState(true);
    _healthAuthStore
      .getRegions()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  const setMultiSelectRules = (value: CountryModel[], fieldKey: string): void => {
    const isAll = value.find(x => x.isO2Code === 'All');
    useUpsert.getField(fieldKey).set(isAll ? [ isAll ] : value);
  };

  const levelDesignatorOptions = (): IdNameCodeModel[] | CountryModel[] | StateModel[] | AirportModel[] => {
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

  const setAffectedTypeRules = (value: IOptionValue, fieldKey: string): void => {
    const option = value as ISelectOption;
    switch (option?.label) {
      case AFFECTED_TYPE.NATIONALITY:
        useUpsert.setFormRules('healthAuthNationalities', true, 'Nationality Affected');
        useUpsert.setFormRules('healthAuthTraveledCountries', false, 'Traveled Country');
        useUpsert.clearFormFields([ 'healthAuthTraveledCountries', 'healthAuthorizationExcludedTraveledCountries' ]);
        break;
      case AFFECTED_TYPE.TRAVELED_COUNTRY:
        useUpsert.setFormRules('healthAuthTraveledCountries', true, 'Traveled Country');
        useUpsert.setFormRules('healthAuthNationalities', false, 'Nationality Affected');
        useUpsert.clearFormFields([ 'healthAuthNationalities', 'region', 'healthAuthorizationExcludedNationalities' ]);
        break;
      case AFFECTED_TYPE.BOTH:
        useUpsert.setFormRules('healthAuthTraveledCountries', true, 'Traveled Country');
        useUpsert.setFormRules('healthAuthNationalities', true, 'Nationality Affected');
        break;
    }
  };

  const getUpdatedModel = (): HealthAuthModel => {
    const formValues: HealthAuthModel = useUpsert.form.values();
    const updatedModel = new HealthAuthModel({
      ...healthAuthorization(),
      ...formValues,
      isSuspendNotification: Boolean(formValues.isSuspendNotification),
      authorizationLevelEntityId: formValues.levelDesignator?.id,
      authorizationLevelEntityCode: getAuthorizationLevelEntityCode(formValues.levelDesignator),
    });
    return updatedModel;
  };

  const getAuthorizationLevelEntityCode = (
    levelDesignator: IdNameCodeModel | CountryModel | StateModel | AirportModel
  ): string => {
    let code = '';
    switch (authorizationLevel()) {
      case AUTHORIZATION_LEVEL.COUNTRY:
        code = (levelDesignator as CountryModel)?.isO2Code;
        break;
      case AUTHORIZATION_LEVEL.AIRPORT:
        code = (levelDesignator as AirportModel)?.label;
        break;
      case AUTHORIZATION_LEVEL.STATE:
        code = (levelDesignator as StateModel)?.isoCode;
        break;
    }
    return code || (levelDesignator as IdNameCodeModel)?.code;
  };
  return {
    useUpsert,
    isExistsFieldKey,
    healthAuthorization,
    _healthAuthStore,
    params,
    setReceivedDate,
    setAffectedTypeRules,
    getUpdatedModel,
    unsubscribe,
    authorizationLevel,
    navigate,
    onCancel,
    loadStates,
    loadCountries,
    loadAuthorizationLevels,
    loadAffectedTypes,
    loadInfectionTypes,
    loadSourceTypes,
    laodAccessLevels,
    regionId,
    loadRegions,
    healthAuthId,
    hasNationalitiesExcluded,
    groupInputControls,
    onValueChange,
  };
};

export default useHealthAuthorizationGeneralBase;
