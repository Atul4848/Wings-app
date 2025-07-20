import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS, IOptionValue, UIStore, Utilities } from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  DomesticMeasureCurfewHourModel,
  DomesticMeasureModel,
  HealthAuthModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import useDomesticMeasure, { BaseProps } from './DomesticMeasureBase';
import DomesticMeasureCurfewHourGrid from './DomesticMeasureCurfewHourGrid/DomesticMeasureCurfewHourGrid';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

interface Props extends BaseProps {
  isEditable?: boolean;
}

const DomesticMeasure: FC<Props> = ({ ...props }) => {
  const [ isRowEditing, setIsRowEditing ] = useState<Boolean>();
  const _useConfirmDialog = useConfirmDialog();
  const {
    useUpsert,
    setFormValidations,
    params,
    groupInputContols,
    healthAuth,
    _healthAuthStore,
    _settingsStore,
    setAgeValidations,
    setPPETypesValidations,
    setIdRequiredValidations,
    setVaccineExemptionValues,
    isInherited,
  } = useDomesticMeasure(props);
  const tabs = (): string[] => groupInputContols().map(({ title }) => title);
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setActiveTab(tabs()[0]);
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    useUpsert.setFormValues(healthAuth);
    setFormValidations();
    setVaccineExemptionValues();
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    setFormValidations();
  }, [ useUpsert.isEditable ]);

  const onFocus = (fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'domesticMeasurePPERequired')) {
      useUpsert.observeSearch(_settingsStore.getPPETypes());
    }
    if (Utilities.isEqual(fieldKey, 'domesticMeasureIdRequired')) {
      useUpsert.observeSearch(_settingsStore.getIdTypes());
    }
  };

  const clearValidations = (): void => {
    setAgeValidations(false);
    setPPETypesValidations(false);
    setIdRequiredValidations(false);
  };

  const onChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    const key: string = fieldKey.split('.')[1];
    switch (key) {
      case 'isAgeExemption':
        setAgeValidations(Boolean(value));
        break;
      case 'isPPERequired':
        setPPETypesValidations(Boolean(value));
        break;
      case 'isIdentificationRequiredOnPerson':
        setIdRequiredValidations(Boolean(value));
        break;
      case 'isInherited':
        if (Boolean(value)) {
          clearValidations();
          useUpsert.form.validate();
          break;
        }
        setFormValidations(true);
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertDomesticMeasure();
        break;
      case GRID_ACTIONS.CANCEL:
        confirmClose();
        break;
    }
  };

  /* istanbul ignore next */
  const upsertDomesticMeasure = (): void => {
    const { domesticMeasure } = useUpsert.form.values();
    const healthAuthorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuth,
      domesticMeasure: new DomesticMeasureModel({
        ...healthAuth.domesticMeasure,
        ...domesticMeasure,
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertDomesticMeasure(healthAuthorization)
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
  const domesticCurfewHours = (fieldKey: string): DomesticMeasureCurfewHourModel[] => {
    const [ type ] = fieldKey.split('.');
    return useUpsert.getField(fieldKey)?.values() || healthAuth[type]?.domesticMeasureCurfewHours;
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
          onFocus={onFocus}
          groupInputControls={groupInputContols()}
          onValueChange={(option: IOptionValue, fieldKey: string) => onChange(option, fieldKey)}
          tabs={tabs()}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
          customComponent={inputControl => (
            <DomesticMeasureCurfewHourGrid
              isEditable={useUpsert.isEditable && !isInherited()}
              rowData={domesticCurfewHours(inputControl?.fieldKey || '')}
              onDataUpdate={(formRequirements: DomesticMeasureCurfewHourModel[]) =>
                onChange(formRequirements, inputControl?.fieldKey || '')
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

export default inject('healthAuthStore', 'settingsStore')(observer(DomesticMeasure));
