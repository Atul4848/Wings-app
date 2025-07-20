import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { VIEW_MODE } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { HealthAuthModel, useRestrictionModuleSecurity, StayRequirementModel } from '../../../Shared';
import { IOptionValue, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { DetailsEditorWrapper, ConfirmNavigate, DetailsEditorHeaderSection } from '@wings-shared/layout';
import useStayRequirementBase from './StayRequirementBase';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useNavigate } from 'react-router';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

const StayRequirement: FC = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const {
    useUpsert,
    setFormValidations,
    params,
    clearValidations,
    groupInputContols,
    healthAuth,
    _settingsStore,
    _healthAuthStore,
    setVaccineExemptionValues,
    setLengthOfStayValue,
    setStayLengthValidation,
    resetStayRequirement,
  } = useStayRequirementBase(props);

  const tabs = (): string[] => groupInputContols().map(({ title }) => title);
  const _useConfirmDialog = useConfirmDialog();
  useEffect(() => {
    useUpsert.setActiveTab(tabs()[0]);
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    useUpsert.setFormValues(healthAuth);
    setFormValidations();
    setVaccineExemptionValues();
  }, []);

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    const [ prefix, key ] = fieldKey.split('.');
    if (Utilities.isEqual(key, 'isStayRequired')) {
      if (!Boolean(value) && Boolean(useUpsert.getField(fieldKey).value)) {
        confirmReset(fieldKey, value as boolean);
        return;
      } else {
        setStayLengthValidation(prefix, Boolean(value));
        setLengthOfStayValue(prefix, Boolean(value));
      }
    }
    if (Utilities.isEqual(key, 'isInherited')) {
      if (Boolean(value)) {
        setStayLengthValidation(prefix, false);
        useUpsert.getField(fieldKey).set(value);
        return;
      }
      setFormValidations(prefix);
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const onFocus = (fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'testType')) {
      loadTestTypes();
    }
    if (Utilities.isEqual(fieldKey, 'stayLengthCategory')) {
      loadStayLengthCategories();
    }
  };

  const loadStayLengthCategories = (): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getStayLengthCategories()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const loadTestTypes = (): void => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getTestTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const getMessage = (entity: string): string => {
    const entityName = Utilities.isEqual('passengerStayRequirement', entity) ? 'Passenger' : 'Crew';
    return `This will reset the ${entityName} Stay Requirement data. Do you want to proceed?`;
  };

  const confirmReset = (fieldKey: string, value: boolean): void => {
    const [ entity ] = fieldKey.split('.');
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        clearValidations(entity);
        resetStayRequirement(entity, value);
      },
      {
        title: 'Confirm Change',
        message: getMessage(entity),
      }
    );
  };

  /* istanbul ignore next */
  const confirmClose = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.EDIT) {
      navigate('/restrictions', useUpsert.noBlocker);
      return;
    }
    if (!useUpsert.form.touched) {
      onCancel();
      return;
    }
    _useConfirmDialog.confirmAction(
      () => {
        onCancel();
        ModalStore.close();
      },
      {
        title: 'Confirm Cancellation',
        message: 'Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?',
      }
    );
  };

  const onCancel = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(healthAuth);
      setVaccineExemptionValues();
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
        upsertStayRequirement();
        break;
      case GRID_ACTIONS.CANCEL:
        confirmClose();
        break;
    }
  };

  const upsertStayRequirement = (): void => {
    const { crewStayRequirement, passengerStayRequirement } = useUpsert.form.values();
    const healthAuthorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuth,
      crewStayRequirement: new StayRequirementModel({
        ...healthAuth.crewStayRequirement,
        ...crewStayRequirement,
      }),
      passengerStayRequirement: new StayRequirementModel({
        ...healthAuth.passengerStayRequirement,
        ...passengerStayRequirement,
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertStayRequirement(healthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(healthAuthorization);
          setVaccineExemptionValues();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={healthAuth.title}
        backNavLink="/restrictions"
        backNavTitle="Health Authorizations"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <HealthAuthorizationViewInputControls
          isEditable={useUpsert.isEditable}
          getField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          onFocus={onFocus}
          groupInputControls={groupInputContols()}
          onValueChange={onValueChange}
          tabs={tabs()}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('healthAuthStore', 'settingsStore')(observer(StayRequirement));
