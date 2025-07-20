import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE, StateModel, CountryModel, AirportModel } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { inject, observer } from 'mobx-react';
import {
  AUTHORIZATION_LEVEL,
  HealthAuthModel,
  HealthAuthorizationOverviewModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AuditFields, ViewInputControl, IViewInputControl } from '@wings-shared/form-controls';
import {
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  IdNameCodeModel,
  SettingsTypeModel,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { DetailsEditorWrapper, ConfirmNavigate, SidebarStore, DetailsEditorHeaderSection } from '@wings-shared/layout';
import useHealthAuthorizationGeneralBase from './HealthAuthorizationGeneralBase';
import { useStyles } from './HealthAuthorizationGeneral.style';

interface Props {
  sidebarStore?: typeof SidebarStore;
}

const HealthAuthorizationGeneral: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const {
    useUpsert,
    isExistsFieldKey,
    _healthAuthStore,
    unsubscribe,
    setReceivedDate,
    healthAuthorization,
    setAffectedTypeRules,
    getUpdatedModel,
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
    params,
  } = useHealthAuthorizationGeneralBase(props);

  /* istanbul ignore next */
  useEffect(() => {
    if (
      Utilities.isEqual(params?.viewMode as string, VIEW_MODE.NEW) &&
      !healthAuthorization()?.healthAuthorizationCloneId
    ) {
      return;
    }
    useUpsert.setFormValues(healthAuthorization());
    setReceivedDate(healthAuthorization().receivedDate);
    setAffectedTypeRules(healthAuthorization().affectedType, 'affectedType');
  }, []);

  /* istanbul ignore next */
  const upsertCloneHealthAuthorization = (): void => {
    const { healthAuthorizationCloneId } = _healthAuthStore.selectedHealthAuth;
    const healthAuthoriationOverviewModel: HealthAuthorizationOverviewModel = new HealthAuthorizationOverviewModel({
      ...getUpdatedModel(),
      healthAuthorizationCloneId,
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertHealthAuthClone(healthAuthoriationOverviewModel)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          _healthAuthStore.setSelectedHealthAuthorization(
            new HealthAuthModel({
              ...response,
              levelDesignator: getLevelDesignator(),
            })
          );
          useUpsert.form.reset();
          useUpsert.setFormValues(healthAuthorization());
          useUpsert.isAddNew &&
            navigate(`/restrictions/health-authorization/${healthAuthorization().id}/${VIEW_MODE.EDIT.toLowerCase()}`);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const upsertHealthAuthorization = (): void => {
    const { selectedHealthAuth } = _healthAuthStore;
    if (selectedHealthAuth.healthAuthorizationCloneId) {
      upsertCloneHealthAuthorization();
      return;
    }
    const healthAuthoriationOverviewModel: HealthAuthorizationOverviewModel = new HealthAuthorizationOverviewModel(
      getUpdatedModel()
    );
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertHealthAuth(healthAuthoriationOverviewModel)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: healthAutorizationOverview => {
          _healthAuthStore.setSelectedHealthAuthorization(
            new HealthAuthModel({
              ..._healthAuthStore.selectedHealthAuth,
              ...healthAutorizationOverview,
              levelDesignator: getLevelDesignator(),
            })
          );
          useUpsert.form.reset();
          useUpsert.setFormValues(healthAuthorization());
          useUpsert.isAddNew &&
            navigate(`/restrictions/health-authorization/${healthAuthorization().id}/${VIEW_MODE.EDIT.toLowerCase()}`);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const getLevelDesignator = (): IdNameCodeModel => {
    const levelDesignator = useUpsert.getField('levelDesignator').value;
    if (levelDesignator instanceof IdNameCodeModel) {
      return new IdNameCodeModel(levelDesignator);
    }
    switch (authorizationLevel()) {
      case AUTHORIZATION_LEVEL.AIRPORT:
        return new IdNameCodeModel({
          id: levelDesignator.id,
          code: (levelDesignator as AirportModel).label,
        });
      case AUTHORIZATION_LEVEL.STATE:
        return new IdNameCodeModel({
          id: levelDesignator.id,
          code: (levelDesignator as StateModel).isoCode,
          name: (levelDesignator as StateModel).officialName,
        });
      default:
        return new IdNameCodeModel({
          id: levelDesignator.id,
          code: (levelDesignator as CountryModel).isO2Code,
          name: (levelDesignator as CountryModel).officialName,
        });
    }
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertHealthAuthorization();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  const onSearch = (value: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'levelDesignator':
        fieldBasedSearch(authorizationLevel(), value);
        break;
      default:
        fieldBasedSearch(fieldKey, value);
        break;
    }
  };

  /* istanbul ignore next */
  const fieldBasedSearch = (fieldKey: string, value: string): void => {
    switch (fieldKey) {
      case AUTHORIZATION_LEVEL.AIRPORT:
        useUpsert.observeSearch(_healthAuthStore.getWingsAirport(value));
        break;
      case AUTHORIZATION_LEVEL.STATE:
        loadStates(value);
        break;
      case AUTHORIZATION_LEVEL.COUNTRY:
      case 'healthAuthNationalities':
      case 'healthAuthTraveledCountries':
      case 'healthAuthorizationExcludedNationalities':
      case 'healthAuthorizationExcludedTraveledCountries':
        loadCountries(value);
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'levelDesignator':
        onSearch('', fieldKey);
        break;
      case 'authorizationLevel':
        loadAuthorizationLevels();
        break;
      case 'affectedType':
        loadAffectedTypes();
        break;
      case 'infectionType':
        loadInfectionTypes();
        break;
      case 'sourceType':
        loadSourceTypes();
        break;
      case 'accessLevel':
        laodAccessLevels();
        break;
      case 'healthAuthNationalities':
      case 'healthAuthTraveledCountries':
      case 'healthAuthorizationExcludedTraveledCountries':
      case 'healthAuthorizationExcludedNationalities':
        loadCountries();
        break;
      case 'region':
        loadRegions();
        break;
    }
  };

  const getOptionDisabled = (option: ISelectOption, value: ISelectOption | ISelectOption[]): boolean => {
    if (Array.isArray(value) && option?.label !== 'All') {
      return value.some(x => x.label === 'All');
    }
    return false;
  };

  const title = (): string => {
    const { levelDesignator, infectionType, affectedType } = useUpsert.form.values();
    return [
      levelDesignator?.label || 'Level Designator',
      infectionType?.label || 'Infection',
      affectedType?.label || 'Affected Type',
    ].join(' - ');
  };

  /* istanbul ignore next */
  const cloneHealthAuthorization = (): void => {
    _healthAuthStore.setSelectedHealthAuthorization(
      new HealthAuthModel({
        ..._healthAuthStore.selectedHealthAuth,
        affectedType: new SettingsTypeModel(),
        region: new IdNameCodeModel(),
        healthAuthNationalities: [],
        isAllNationalities: false,
        isAllTraveledCountries: false,
        healthAuthTraveledCountries: [],
        healthAuthorizationExcludedNationalities: [],
        healthAuthorizationExcludedTraveledCountries: [],
        isSuspendNotification: false,
        receivedBy: '',
        receivedDate: '',
        requestedBy: '',
        requestedDate: '',
        id: 0,
        healthAuthorizationCloneId: healthAuthId(),
      })
    );
    navigate('/restrictions/health-authorization/new');
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <DetailsEditorHeaderSection
          title={title()}
          backNavLink="/restrictions"
          backNavTitle="Health Authorizations"
          disableActions={useUpsert.form.hasError || UIStore.pageLoading || Boolean(isExistsFieldKey)}
          isEditMode={useUpsert.isEditable}
          hasEditPermission={restrictionModuleSecurity.isEditable}
          onAction={onAction}
          customActionButtons={() => (
            <ViewPermission
              hasPermission={
                Boolean(healthAuthId()) &&
                Boolean(!healthAuthorization()?.parentId) &&
                useUpsert.isDetailView &&
                hasNationalitiesExcluded() &&
                restrictionModuleSecurity.isEditable
              }
            >
              <PrimaryButton variant="contained" onClick={cloneHealthAuthorization}>
                Clone
              </PrimaryButton>
            </ViewPermission>
          )}
        />
      </>
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <div className={classes.flexWrap}>
          {groupInputControls()
            .inputControls.filter((inputControl: IViewInputControl) => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                isExists={Utilities.isEqual(inputControl?.fieldKey || '', isExistsFieldKey)}
                customErrorMessage={
                  Utilities.isEqual(inputControl?.fieldKey || '', isExistsFieldKey)
                    ? inputControl.customErrorMessage
                    : ''
                }
                field={useUpsert.getField(inputControl?.fieldKey || '')}
                isEditable={useUpsert.isEditable}
                onValueChange={(option, _) => onValueChange(option, inputControl?.fieldKey || '')}
                getOptionDisabled={(option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) =>
                  getOptionDisabled(option, selectedOption)
                }
                onFocus={(fieldKey: string) => onFocus(fieldKey)}
                onSearch={(value: string, fieldKey: string) => onSearch(value, fieldKey)}
              />
            ))}
        </div>
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('healthAuthStore', 'settingsStore', 'sidebarStore')(observer(HealthAuthorizationGeneral));
