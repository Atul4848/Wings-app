import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  SettingsTypeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CountryModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Observable, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  HealthAuthModel, 
  HealthAuthStore,
  useRestrictionModuleSecurity,
  SettingsStore,
  VaccinationRequirementModel,
} from '../../../Shared';
import { fields } from './Fields';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

interface Props {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
}

const VaccinationRequirement: FC<Props> = ({ ...props }) => {
  const tabs: string[] = [ 'Crew Vaccination Requirement', 'Passenger Vaccination Requirement' ];
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const params = useParams();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  // eslint-disable-next-line max-len
  const [ healthAuthorization, setHealthAuthorization ] = useState<HealthAuthModel>(_healthAuthStore.selectedHealthAuth);

  useEffect(() => {
    useUpsert.setActiveTab(tabs[0]);
    useUpsert.setViewMode(routeViewMode() || VIEW_MODE.DETAILS);
    useUpsert.setFormValues(healthAuthorization);
    setFormValidations();
  }, []);

  const routeViewMode = (): VIEW_MODE => params.viewMode?.toUpperCase() as VIEW_MODE;

  const setFormValidations = (prefix: string = ''): void => {
    if (Utilities.isEqual(prefix, 'crewVaccinationRequirement')) {
      setCrewValidations(useUpsert.form.values()?.crewVaccinationRequirement);
      return;
    }
    if (Utilities.isEqual(prefix, 'passengerVaccinationRequirement')) {
      setPassengerValidations(useUpsert.form.values()?.passengerVaccinationRequirement);
      return;
    }
    const { crewVaccinationRequirement, passengerVaccinationRequirement } = healthAuthorization;
    setCrewValidations(crewVaccinationRequirement);
    setPassengerValidations(passengerVaccinationRequirement);
  };

  const setPassengerValidations = (passengerVaccinationRequirement): void => {
    setDocumentationValidation(
      passengerVaccinationRequirement?.isDocumentationRequired,
      'passengerVaccinationRequirement.documentationRequirements'
    );

    setManufacturerValidation(
      passengerVaccinationRequirement?.vaccinePrivileges,
      'passengerVaccinationRequirement.vaccineManufacturers'
    );
    setAgeValidation(passengerVaccinationRequirement?.isAgeExemption);
  };

  const setCrewValidations = (crewVaccinationRequirement): void => {
    setDocumentationValidation(
      crewVaccinationRequirement?.isDocumentationRequired,
      'crewVaccinationRequirement.documentationRequirements'
    );

    setManufacturerValidation(
      crewVaccinationRequirement?.vaccinePrivileges,
      'crewVaccinationRequirement.vaccineManufacturers'
    );
  };

  const setBoosterVaccineExpirationValidations = (prefix: string): void => {
    const isBoosterRequired: boolean = useUpsert.getField(`${prefix}.isBoosterRequired`)?.value as boolean;
    const isBoosterExpiry: boolean = useUpsert.getField(`${prefix}.isBoosterExpiry`)?.value as boolean;
    useUpsert.setFormRules(
      `${prefix}.boosterVaccineExpiration`,
      isBoosterRequired && isBoosterExpiry,
      'Booster Vaccine Expiration'
    );
    useUpsert.form.validate();
  };

  const setDocumentationValidation = (value: boolean, key: string): void =>
    useUpsert.setFormRules(key, Boolean(value), 'Documentation Requirements');

  const setAgeValidation = (value: boolean): void => {
    useUpsert.setFormRules('passengerVaccinationRequirement.age', Boolean(value), 'Age');
    if (!value) {
      useUpsert.getField('passengerVaccinationRequirement.age').set(null);
    }
  };

  const setManufacturerValidation = (value: IOptionValue[], key: string): void => {
    const isRequired: boolean = Boolean(value?.length);
    useUpsert.setFormRules(key, isRequired, 'Accepted Vaccine Manufacturer');
  };

  const isCrewVaccinationInherited = (): boolean =>
    useUpsert.getField('crewVaccinationRequirement.isInherited').values();

  const isPassengerVaccinationInherited = (): boolean =>
    useUpsert.getField('passengerVaccinationRequirement.isInherited').values();

  const isCrewBoosterVaccinationRequired = (): boolean =>
    useUpsert.getField('crewVaccinationRequirement.isBoosterExpiry').values() &&
    useUpsert.getField('crewVaccinationRequirement.isBoosterRequired').values();

  const isPassengerBoosterVaccinationRequired = (): boolean =>
    useUpsert.getField('passengerVaccinationRequirement.isBoosterExpiry').values() &&
    useUpsert.getField('passengerVaccinationRequirement.isBoosterRequired').values();

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Crew Vaccine Requirement',
        inputControls: [
          {
            fieldKey: 'crewVaccinationRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuthorization.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'crewVaccinationRequirement.isVaccinationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Vaccination Required',
            isFullFlex: true,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.vaccinePrivileges',
            type: EDITOR_TYPES.DROPDOWN,
            label: 'Vaccine Privileges',
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: _settingsStore.vaccinationPrivileges,
            isFullFlex: true,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.vaccineManufacturers',
            type: EDITOR_TYPES.DROPDOWN,
            isFullFlex: true,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            label: 'Accepted Vaccination Manufacturer',
            options: _settingsStore.vaccineManufacturers,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.vaccinationRequirementIssuedCountries',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isLoading: useUpsert.loader.isLoading,
            isFullFlex: true,
            label: 'Vaccination Country of Issue',
            options: _healthAuthStore.countries,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Minimum Time Since Vaccine Series Completion',
            endAdormentValue: 'Days',
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.expirationDays',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Vaccine Expiration',
            endAdormentValue: 'Days',
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.isDocumentationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            label: 'Documentation Required',
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.documentationRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Documentaion Requirements',
            multiline: true,
            isHidden: !Boolean(useUpsert.getField('crewVaccinationRequirement.isDocumentationRequired').value),
            rows: 5,
            isFullFlex: true,
            isIndent: true,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.additionalInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Other Information',
            multiline: true,
            rows: 5,
            isFullFlex: true,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.isBoosterRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            label: 'Booster Required',
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.isBoosterExpiry',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Booster Expiry',
            isHidden: !Boolean(useUpsert.getField('crewVaccinationRequirement.isBoosterRequired').value),
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.boosterVaccineExpiration',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Booster Vaccine Expiration',
            endAdormentValue: 'Days',
            isHidden: !isCrewBoosterVaccinationRequired(),
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.vaccineBoosterManufacturers',
            type: EDITOR_TYPES.DROPDOWN,
            isFullFlex: true,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            label: 'Accepted Booster Vaccination Manufacturer',
            isHidden: !Boolean(useUpsert.getField('crewVaccinationRequirement.isBoosterRequired').value),
            options: _settingsStore.vaccineManufacturers,
            isDisabled: isCrewVaccinationInherited(),
          },
          {
            fieldKey: 'crewVaccinationRequirement.boosterExemptions',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Exemptions for booster',
            multiline: true,
            rows: 2,
            isFullFlex: true,
            isHidden: !Boolean(useUpsert.getField('crewVaccinationRequirement.isBoosterRequired').value),
            isDisabled: isCrewVaccinationInherited(),
          },
        ],
      },
      {
        title: 'Passenger Vaccine Requirement',
        inputControls: [
          {
            fieldKey: 'passengerVaccinationRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuthorization.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'passengerVaccinationRequirement.isVaccinationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Vaccination Required',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.isAgeExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Age Exemption',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.age',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Age',
            isHidden: !Boolean(useUpsert.getField('passengerVaccinationRequirement.isAgeExemption').value),
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.vaccinePrivileges',
            type: EDITOR_TYPES.DROPDOWN,
            label: 'Vaccine Privileges',
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            isFullFlex: true,
            options: _settingsStore.vaccinationPrivileges,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.vaccineManufacturers',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: _settingsStore.vaccineManufacturers,
            isFullFlex: true,
            label: 'Accepted Vaccination Manufacturer',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.vaccinationRequirementIssuedCountries',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isLoading: useUpsert.loader.isLoading,
            label: 'Vaccination Country of Issue',
            options: _healthAuthStore.countries,
            isFullFlex: true,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Minimum Time Since Vaccine Series Completion',
            endAdormentValue: 'Days',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.expirationDays',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Vaccine Expiration',
            endAdormentValue: 'Days',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.isDocumentationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            label: 'Documentation Required',
            isBoolean: true,
            isFullFlex: true,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.documentationRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Documentaion Requirements',
            multiline: true,
            isHidden: !Boolean(useUpsert.getField('passengerVaccinationRequirement.isDocumentationRequired').value),
            rows: 5,
            isFullFlex: true,
            isIndent: true,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.additionalInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Other Information',
            multiline: true,
            rows: 5,
            isFullFlex: true,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.isBoosterRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            label: 'Booster Required',
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.isBoosterExpiry',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Booster Expiry',
            isHidden: !Boolean(useUpsert.getField('passengerVaccinationRequirement.isBoosterRequired').value),
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.boosterVaccineExpiration',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Booster Vaccine Expiration',
            endAdormentValue: 'Days',
            isHidden: !isPassengerBoosterVaccinationRequired(),
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.vaccineBoosterManufacturers',
            type: EDITOR_TYPES.DROPDOWN,
            isFullFlex: true,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            label: 'Accepted Booster Vaccination Manufacturer',
            isHidden: !Boolean(useUpsert.getField('passengerVaccinationRequirement.isBoosterRequired').value),
            options: _settingsStore.vaccineManufacturers,
            isDisabled: isPassengerVaccinationInherited(),
          },
          {
            fieldKey: 'passengerVaccinationRequirement.boosterExemptions',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Exemptions for booster',
            multiline: true,
            rows: 2,
            isFullFlex: true,
            isHidden: !Boolean(useUpsert.getField('passengerVaccinationRequirement.isBoosterRequired').value),
            isDisabled: isPassengerVaccinationInherited(),
          },
        ],
      },
    ];
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    const [ prefix, key ] = fieldKey.split('.');
    switch (key) {
      case 'vaccinePrivileges':
        setManufacturerValidation(value as IOptionValue[], `${prefix}.vaccineManufacturers`);
        break;
      case 'isAgeExemption':
        setAgeValidation(value as boolean);
        break;
      case 'isDocumentationRequired':
        setDocumentationValidation(value as boolean, `${prefix}.documentationRequirements`);
        break;
      case 'isInherited':
        if (Boolean(value)) {
          clearFormValidations(prefix);
          break;
        }
        setFormValidations(prefix);
        break;
      case 'isBoosterExpiry':
        useUpsert.getField(fieldKey).set(value);
        setBoosterVaccineExpirationValidations(prefix);
        return;
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const clearFormValidations = (prefix: string): void => {
    setManufacturerValidation([], `${prefix}.vaccineManufacturers`);
    setDocumentationValidation(false, `${prefix}.documentationRequirements`);
    if (Utilities.isEqual(prefix, 'passengerVaccinationRequirement')) {
      setAgeValidation(false);
    }
  };

  const setToDetailMode = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setFormValues(healthAuthorization);
    setFormValidations();
  };

  const onCancel = (): void => {
    if (routeViewMode() === VIEW_MODE.DETAILS) {
      if (useUpsert.form.touched) {
        return _useConfirmDialog.confirmAction(
          () => {
            ModalStore.close();
            setToDetailMode();
          },
          {
            title: 'Confirm Cancellation',
            message: 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?',
          }
        );
      }
      setToDetailMode();
      return;
    }
    navigate('/restrictions', useUpsert.noBlocker);
  };

  /* istanbul ignore next */
  const upsertVaccinationRequirement = (): void => {
    const { crewVaccinationRequirement, passengerVaccinationRequirement } = useUpsert.form.values();
    const updatedHealthAuthorizationorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuthorization,
      crewVaccinationRequirement: new VaccinationRequirementModel({
        ...healthAuthorization.crewVaccinationRequirement,
        ...crewVaccinationRequirement,
      }),
      passengerVaccinationRequirement: new VaccinationRequirementModel({
        ...healthAuthorization.passengerVaccinationRequirement,
        ...passengerVaccinationRequirement,
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertVaccinationRequirement(updatedHealthAuthorizationorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VaccinationRequirementModel[]) => {
          setHealthAuthorization(new HealthAuthModel(_healthAuthStore.selectedHealthAuth));
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(new HealthAuthModel(_healthAuthStore.selectedHealthAuth));
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertVaccinationRequirement();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={healthAuthorization.title}
        // title='Health Authorizations'
        backNavLink="/restrictions"
        backNavTitle="Health Authorizations"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };

  const onSearch = (value: string, fieldKey: string): void => {
    if (fieldKey === 'vaccinationRequirementIssuedCountries') {
      onFocus(fieldKey, value);
    }
  };

  const onFocus = (fieldKey: string, searchValue: string = ''): void => {
    let searchObservable: Observable<(SettingsTypeModel | CountryModel)[]> = of([]);
    switch (fieldKey) {
      case 'vaccinationRequirementIssuedCountries':
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        searchObservable = _healthAuthStore.getCountries(countryRequest, true);
        break;
      case 'vaccineManufacturers':
      case 'vaccineBoosterManufacturers':
        searchObservable = _settingsStore.getVaccineManufacturers();
        break;
      case 'vaccinePrivileges':
        searchObservable = _settingsStore.getVaccinationPrivileges();
        break;
    }
    useUpsert.loader.setLoadingState(true);
    searchObservable
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.loader.setLoadingState(false))
      )
      .subscribe();
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <HealthAuthorizationViewInputControls
          isEditable={useUpsert.isEditable}
          getField={useUpsert.getField}
          onFocus={onFocus}
          onSearch={onSearch}
          groupInputControls={groupInputContols()}
          onValueChange={onValueChange}
          tabs={tabs}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('settingsStore', 'healthAuthStore')(observer(VaccinationRequirement));
