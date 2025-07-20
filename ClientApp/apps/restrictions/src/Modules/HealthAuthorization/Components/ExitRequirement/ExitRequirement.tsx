import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS, IOptionValue, UIStore, Utilities } from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  ExitFormRequirementModel,
  ExitRequirementModel,
  HealthAuthModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import ExitFormRequirementGrid from './ExitFormRequirementGrid/ExitFormRequirementGrid';
import useExitRequirementBase, { BaseProps } from './ExitRequirementBase';
import { useNavigate } from 'react-router';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

const ExitRequirement: FC<BaseProps> = ({ ...props }) => {
  const {
    useUpsert,
    params,
    groupInputContols,
    healthAuth,
    setFormValidation,
    setVaccineExemptionValues,
    isRowEditing,
    setIsRowEditing,
    healthAuthStore,
    settingsStore,
    resetExitRequirement,
    setBoardingTypesValidations,
    clearValidations,
    setFormRequirementValidations,
    setTestRequirentValidations,
  } = useExitRequirementBase(props);
  const tabs = (): string[] => groupInputContols().map(({ title }) => title);
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  useEffect(() => {
    useUpsert.setActiveTab(tabs()[0]);
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    useUpsert.setFormValues(healthAuth);
    setFormValidation();
    setVaccineExemptionValues();
  }, []);

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    const [ prefix, key ] = fieldKey.split('.');
    switch (key) {
      case 'isExitRequirement':
        if (!Boolean(value) && Boolean(useUpsert.getField(fieldKey).value)) {
          confirmReset(fieldKey, value as boolean);
          return;
        }
        break;
      case 'isFormsRequired':
        setFormRequirementValidations(prefix, Boolean(value));
        break;
      case 'isPreDepartureTestRequired':
        setTestRequirentValidations(prefix, Boolean(value));
        break;
      case 'isProofToBoard':
        setBoardingTypesValidations(prefix, Boolean(value));
        break;
      case 'isInherited':
        if (Boolean(value)) {
          clearValidations(prefix);
          break;
        }
        setFormValidation(prefix);
        break;
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const onFocus = (fieldKey: string): void => {
    if (fieldKey === 'testType') {
      loadTestTypes();
    }
    if (fieldKey === 'boardingTypes') {
      loadBoardingTypes();
    }
  };

  const loadBoardingTypes = (): void => {
    UIStore.setPageLoader(true);
    settingsStore
      .getBoardingTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadTestTypes = (): void => {
    UIStore.setPageLoader(true);
    settingsStore
      .getTestTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const getMessage = (entity: string): string => {
    const entityName = Utilities.isEqual('passengerExitRequirement', entity) ? 'Passenger' : 'Crew';
    return `This will reset the ${entityName} Exit Requirement data. Do you want to proceed?`;
  };

  const confirmReset = (fieldKey: string, value: boolean): void => {
    const [ entity ] = fieldKey.split('.');
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        clearValidations(entity);
        resetExitRequirement(entity, value);
        useUpsert.getField(fieldKey).set(value);
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

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  const exitFormRequirements = (fieldKey: string): ExitFormRequirementModel[] => {
    const [ type ] = fieldKey.split('.');
    return useUpsert.getField(fieldKey)?.values() || healthAuth[type]?.formRequirements;
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertExitRequirement();
        break;
      case GRID_ACTIONS.CANCEL:
        confirmClose();
        break;
    }
  };

  /* istanbul ignore next */
  const upsertExitRequirement = (): void => {
    const { crewExitRequirement, passengerExitRequirement } = useUpsert.form.values();
    const healthAuthorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuth,
      crewExitRequirement: new ExitRequirementModel({
        ...healthAuth.crewExitRequirement,
        ...crewExitRequirement,
        formRequirements: crewExitRequirement.formRequirements.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
      }),
      passengerExitRequirement: new ExitRequirementModel({
        ...healthAuth.passengerExitRequirement,
        ...passengerExitRequirement,
        formRequirements: passengerExitRequirement.formRequirements.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
      }),
    });
    UIStore.setPageLoader(true);
    healthAuthStore
      .upsertExitRequirement(healthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
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
        disableActions={useUpsert.form.hasError || UIStore.pageLoading || isRowEditing}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
        isRowEditing={isRowEditing}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <HealthAuthorizationViewInputControls
          isEditable={useUpsert.isEditable}
          getField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
          isTabDisable={isRowEditing}
          groupInputControls={groupInputContols()}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          tabs={tabs()}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
          customComponent={inputControl => (
            <ExitFormRequirementGrid
              key={inputControl?.fieldKey}
              isEditable={
                useUpsert.isEditable &&
                !Boolean(useUpsert.getField(`${inputControl?.fieldKey?.split('.')[0]}.isInherited`).value)
              }
              rowData={exitFormRequirements(inputControl?.fieldKey || '')}
              onDataUpdate={(formRequirements: ExitFormRequirementModel[]) =>
                useUpsert.getField(inputControl?.fieldKey || '').set(formRequirements)
              }
              onRowEdit={isRowEditing => {
                if (isRowEditing) {
                  useUpsert.getField(inputControl?.fieldKey || '').onFocus();
                }
                setIsRowEditing(isRowEditing);
              }}
            />
          )}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};
export default inject('healthAuthStore', 'settingsStore')(observer(ExitRequirement));
