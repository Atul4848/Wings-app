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
} from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  HealthAuthModel,
  QuarantineRequirementModel,
  useRestrictionModuleSecurity,
  VACCINE_PRIVILEGE,
} from '../../../Shared';
import useQuarantineRequirementBase from './QuarantineRequirementBase';
import { useStyles } from '../../HealthAuth.styles';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

const QuarantineRequirement: FC = ({ ...props }) => {
  const tabs: string[] = [ 'Crew Quarantine Requirement', 'Passenger Quarantine Requirement' ];
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const {
    useUpsert,
    setFormValidations,
    healthAuthorization,
    _healthAuthStore,
    setTestInformatiOnValidations,
    setMonitoringMethodValidations,
    setQuarantineLocationsValidations,
    setTravelHistoryValidations,
    setQuarantinePeriodValidations,
    setAgeExemptionValidations,
    clearValidations,
    setHealthAuthorization,
    params,
    groupInputContols,
  } = useQuarantineRequirementBase(props);

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setActiveTab(tabs[0]);
    setFormValidations();
    useUpsert.setFormValues(healthAuthorization);
    setVaccineExemptionValues();
  }, []);

  const setVaccineExemptionValues = (): void => {
    setCrewExemptionValues();
    setPassengerVaccineExemption();
  };

  const setCrewExemptionValues = (): void => {
    const { vaccinePrivileges } = healthAuthorization?.crewVaccinationRequirement;
    const isQuarantine: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.QUARANTINE_EXEMPTION);
    useUpsert.getField('crewQuarantineRequirement.isVaccineExemption').set(isQuarantine);
  };

  const setPassengerVaccineExemption = () => {
    const { vaccinePrivileges } = healthAuthorization?.passengerVaccinationRequirement;
    const isQuarantine: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.QUARANTINE_EXEMPTION);
    useUpsert.getField('passengerQuarantineRequirement.isVaccineExemption').set(isQuarantine);
  };

  const onFocus = (fieldKey: string, searchValue = ''): void => {
    if (fieldKey === 'quarantineTraveledCountries') {
      const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
      useUpsert.observeSearch(_healthAuthStore.getCountries(countryRequest, true));
    }
    if (fieldKey === 'quarantineLocations') {
      useUpsert.observeSearch(_healthAuthStore.getQuarantineLocations());
    }
  };

  const onSearch = (value: string, fieldKey: string): void => {
    if (fieldKey === 'quarantineTraveledCountries') {
      onFocus(fieldKey, value);
    }
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    const prefix = fieldKey.split('.')[0];
    const key = fieldKey.split('.')[1];
    switch (key) {
      case 'isQuarantineRequired':
        if (!Boolean(value) && Boolean(useUpsert.getField(fieldKey).value)) {
          confirmReset(fieldKey, value as boolean);
          return;
        }
        break;
      case 'isTestExemption':
        setTestInformatiOnValidations(prefix, Boolean(value));
        break;
      case 'isGovtSelfMonitoringRequired':
        setMonitoringMethodValidations(prefix, Boolean(value));
        break;
      case 'isLocationAllowed':
        setQuarantineLocationsValidations(prefix, Boolean(value));
        break;
      case 'isTravelHistoryBased':
        setTravelHistoryValidations(prefix, Boolean(value));
        break;
      case 'isPeriodOfQuarantineRequired':
        setQuarantinePeriodValidations(prefix, Boolean(value));
        useUpsert.getField(`${prefix}.isLengthOfStay`).set(Boolean(value));
        break;
      case 'isAgeExemption':
        setAgeExemptionValidations(prefix, Boolean(value));
        break;
      case 'isInherited':
        if (Boolean(value)) {
          clearValidations(prefix);
          break;
        }
        setFormValidations(prefix);
    }
    useUpsert.getField(fieldKey).set(value);
  };

  /* istanbul ignore next */
  const getMessage = (entity: string): string => {
    const entityName = Utilities.isEqual('crewQuarantineRequirement', entity) ? 'Crew' : 'Passenger';
    return `This will reset the ${entityName} Quarantine Requirement data. Do you want to proceed?`;
  };

  const confirmReset = (fieldKey: string, value: boolean): void => {
    const entity = fieldKey.split('.')[0];
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        clearValidations(entity);
        useUpsert.getField(fieldKey).set(value);
        resetQuarantineRequirements(entity, value);
      },
      {
        title: 'Confirm Change',
        message: getMessage(entity),
      }
    );
  };

  /* istanbul ignore next */
  const resetQuarantineRequirements = (entity: string, isQuarantineRequired: boolean): void => {
    const isCrew: boolean = Utilities.isEqual(entity, 'crewQuarantineRequirement');
    const formValues: HealthAuthModel = useUpsert.form.values();
    const paxCrew = new SettingsTypeModel({ id: isCrew ? 2 : 1 });
    const model = new QuarantineRequirementModel({
      healthAuthorizationId: healthAuthorization.id,
      paxCrew,
      isQuarantineRequired,
    });
    if (isCrew) {
      formValues.crewQuarantineRequirement = model;
      useUpsert.setFormValues(formValues);
      setVaccineExemptionValues();
      return;
    }
    formValues.passengerQuarantineRequirement = model;
    useUpsert.setFormValues(formValues);
    setVaccineExemptionValues();
  };

  const upsertQuarantineRequirement = (): void => {
    const { crewQuarantineRequirement, passengerQuarantineRequirement } = useUpsert.form.values();
    const updatedHealthAuthorizationorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuthorization,
      crewQuarantineRequirement: new QuarantineRequirementModel({
        ...healthAuthorization.crewQuarantineRequirement,
        ...crewQuarantineRequirement,
      }),
      passengerQuarantineRequirement: new QuarantineRequirementModel({
        ...healthAuthorization.passengerVaccinationRequirement,
        ...passengerQuarantineRequirement,
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertQuarantineRequirement(updatedHealthAuthorizationorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          setHealthAuthorization(new HealthAuthModel(_healthAuthStore.selectedHealthAuth));
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(new HealthAuthModel(_healthAuthStore.selectedHealthAuth));
          setVaccineExemptionValues();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const routeViewMode = (): VIEW_MODE => params.viewMode?.toUpperCase() as VIEW_MODE;

  /* istanbul ignore next */
  const setToDetailMode = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.form.reset();
    useUpsert.setFormValues(healthAuthorization);
    setVaccineExemptionValues();
    setFormValidations();
  };

  /* istanbul ignore next */
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

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertQuarantineRequirement();
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
        backNavLink="/restrictions"
        backNavTitle="Health Authorizations"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };
  const classes = useStyles();
  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <HealthAuthorizationViewInputControls
          isEditable={useUpsert.isEditable}
          getField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
          onSearch={(value: string, fieldKey: string) => onSearch(value, fieldKey)}
          groupInputControls={groupInputContols()}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          tabs={tabs}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('healthAuthStore')(observer(QuarantineRequirement));
