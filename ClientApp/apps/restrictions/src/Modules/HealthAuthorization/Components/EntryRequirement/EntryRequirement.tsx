import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS, IAPIGridRequest, IOptionValue, SettingsTypeModel, UIStore, Utilities } from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CountryModel, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  EntryFormRequirementModel,
  EntryRequirementModel,
  HealthAuthModel,
  PreTravelTestDetailModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import useEntryRequirementBase, { BaseProps } from './EntryRequirementBase';
import PreTravelTestDetailGrid from './PreTravelTestDetailGrid/PreTravelTestDetailGrid';
import EntryFormRequirementGrid from './EntryFormRequirementGrid/EntryFormRequirementGrid';
// eslint-disable-next-line max-len
import HealthAuthorizationViewInputControls from '../HealthAuthorizationViewInputControls/HealthAuthorizationViewInputControls';

const EntryRequirement: FC<BaseProps> = ({ ...props }) => {
  const tabs = (): string[] => groupInputContols().map(({ title }) => title);
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
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
    setFormRequirementValidations,
    setPreTravelTestValidation,
    resetEntryRequirement,
  } = useEntryRequirementBase(props);

  useEffect(() => {
    useUpsert.setActiveTab(tabs()[0]);
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    useUpsert.setFormValues(healthAuth);
    mapNationalities('crewEntryRequirement');
    mapNationalities('passengerEntryRequirement');
    setFormValidation();
    setVaccineExemptionValues();
  }, []);

  const onChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    const [ prefix, key ] = fieldKey.split('.');
    switch (key) {
      case 'isEntryRequirements':
        if (!value && Boolean(useUpsert.getField(fieldKey).value)) {
          confirmReset(fieldKey, value as boolean);
          return;
        }
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'entryRequirementBannedNationalitiesRegions':
        const bannedNationaltiyRegionsLength: number = (value as SettingsTypeModel[]).length;
        if (!bannedNationaltiyRegionsLength) {
          useUpsert.getField(`${prefix}.entryRequirementBannedNationalities`).set([]);
          useUpsert.getField(fieldKey).set(value);
          return;
        }
        const currentBannedRegions: SettingsTypeModel[] = useUpsert.getField(
          `${prefix}.entryRequirementBannedNationalitiesRegions`
        ).value;
        if (currentBannedRegions?.length < bannedNationaltiyRegionsLength) {
          loadCountries('', value[bannedNationaltiyRegionsLength - 1]?.id, prefix);
          useUpsert.getField(fieldKey).set(value);
          return;
        }
        filterRemovedRegionsCountries(currentBannedRegions, value as SettingsTypeModel[], prefix);
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'isFormsRequired':
        setFormRequirementValidations(prefix, Boolean(value));
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'isPreTravelTestRequired':
        setPreTravelTestValidation(prefix, Boolean(value));
        useUpsert.getField(fieldKey).set(value);
        break;
      case 'isInherited':
        if (Boolean(value)) {
          setPreTravelTestValidation(prefix, false);
          setFormRequirementValidations(prefix, false);
          break;
        }
        setFormValidation(prefix);
        break;
    }
    useUpsert.getField(fieldKey).set(value);
  };

  const getMessage = (entity: string): string => {
    const entityName = Utilities.isEqual('crewEntryRequirement', entity) ? 'Crew' : 'Passenger';
    return `This will reset the ${entityName} Entry Requirement data. Do you want to proceed?`;
  };

  const mapNationalities = tabKey => {
    const countryIds = useUpsert.getField(`${tabKey}.entryRequirementBannedNationalities`).value?.map(c => c.id);
    const request = {
      filterCollection: JSON.stringify([{ propertyName: 'CountryId', propertyValue: countryIds, filterType: 'in' }]),
    };
    UIStore.setPageLoader(true);
    healthAuthStore
      .getCountries(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(countries => {
        useUpsert.getField(`${tabKey}.entryRequirementBannedNationalities`).set(countries);
      });
  };

  /* istanbul ignore next */
  const filterRemovedRegionsCountries = (
    oldRegions: SettingsTypeModel[],
    currentRegions: SettingsTypeModel[],
    category: string
  ): void => {
    const bannedNationalities: CountryModel[] = useUpsert.getField(`${category}.entryRequirementBannedNationalities`)
      .value;
    const removedRegions: SettingsTypeModel[] = oldRegions.filter(x => !currentRegions.some(y => y.id === x.id));
    removedRegions.forEach(x => {
      const filteredBannedNationalities: CountryModel[] = bannedNationalities?.filter(
        c => !c?.associatedRegions?.some(z => z.id === x.id)
      );
      useUpsert.getField(`${category}.entryRequirementBannedNationalities`).set(filteredBannedNationalities);
    });
  };

  /* istanbul ignore next */
  const confirmReset = (fieldKey: string, value: boolean): void => {
    const [ entity ] = fieldKey.split('.');
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        useUpsert.getField(fieldKey).set(value);
        useUpsert.getField(`${entity}.entryRequirementBannedNationalitiesRegions`).set([]);
        setPreTravelTestValidation(entity, false);
        setFormRequirementValidations(entity, false);
        resetEntryRequirement(entity, value);
      },
      { message: getMessage(entity) }
    );
  };

  const onFocus = (fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'testType')) {
      useUpsert.observeSearch(settingsStore.getTestTypes());
    }
    if (Utilities.isEqual(fieldKey, 'leadTimeIndicator')) {
      useUpsert.observeSearch(settingsStore.getLeadTimeIndicators());
    }
    if (Utilities.isEqual(fieldKey, 'entryRequirementBannedNationalitiesRegions') && !healthAuthStore.regions.length) {
      useUpsert.observeSearch(healthAuthStore.getRegions());
    }
    if (Utilities.isEqual(fieldKey, 'entryRequirementBannedNationalities')) {
      const _key = Utilities.isEqual(useUpsert.activeTab, 'Crew Entry Requirement')
        ? 'crewEntryRequirement'
        : 'passengerEntryRequirement';
      const regionsIds = useUpsert.getField(`${_key}.entryRequirementBannedNationalitiesRegions`).value.map(x => x.id);
      loadCountries('', regionsIds);
    }
  };

  /* istanbul ignore next */
  const entryFormRequirements = (fieldKey: string): EntryFormRequirementModel[] => {
    const [ type ] = fieldKey.split('.');
    return useUpsert.getField(fieldKey)?.values() || healthAuth[type]?.formRequirements;
  };

  /* istanbul ignore next */
  const entryPreTravelTestDetails = (fieldKey: string): PreTravelTestDetailModel[] => {
    const [ type ] = fieldKey.split('.');
    return useUpsert.getField(fieldKey)?.values() || healthAuth[type]?.preTravelTestDetails;
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertEntryRequirement();
        break;
      case GRID_ACTIONS.CANCEL:
        confirmClose();
        break;
    }
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
    _useConfirmDialog.confirmAction(() => {
      onCancel();
      ModalStore.close();
    }, {});
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
  const upsertEntryRequirement = (): void => {
    const { crewEntryRequirement, passengerEntryRequirement } = useUpsert.form.values();
    const healthAuthorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuth,
      crewEntryRequirement: new EntryRequirementModel({
        ...healthAuth.crewEntryRequirement,
        ...crewEntryRequirement,
        // Math.floor(id) is required to make new entry id 0, as tempId is assigned between 0-1.
        preTravelTestEntryRequirement: {
          ...crewEntryRequirement.preTravelTestEntryRequirement,
          preTravelTestDetails: crewEntryRequirement.preTravelTestEntryRequirement.preTravelTestDetails.map(
            ({ id, ...rest }) => {
              return new PreTravelTestDetailModel({ id: Math.floor(id), ...rest });
            }
          ),
        },
        formRequirements: crewEntryRequirement.formRequirements.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
      }),
      passengerEntryRequirement: new EntryRequirementModel({
        ...healthAuth.passengerEntryRequirement,
        ...passengerEntryRequirement,
        preTravelTestEntryRequirement: {
          ...passengerEntryRequirement.preTravelTestEntryRequirement,
          preTravelTestDetails: passengerEntryRequirement.preTravelTestEntryRequirement.preTravelTestDetails.map(
            ({ id, ...rest }) => {
              return new PreTravelTestDetailModel({ id: Math.floor(id), ...rest });
            }
          ),
        },
        formRequirements: passengerEntryRequirement.formRequirements.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
      }),
    });
    UIStore.setPageLoader(true);
    healthAuthStore
      .upsertEntryRequirement(healthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(healthAuthorization);
          mapNationalities('crewEntryRequirement');
          mapNationalities('passengerEntryRequirement');
          setVaccineExemptionValues();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const loadCountries = (propertyValue: string, regionId?: number | number[], category?: string): void => {
    useUpsert.setIsLoading(true);
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
    const _regionIds = Array.isArray(regionId) ? regionId : [ regionId ];
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: _regionIds.length ? 0 : 10,
      searchCollection: propertyValue ? JSON.stringify(searchCollection) : null,
      filterCollection: _regionIds.length
        ? JSON.stringify([
          {
            propertyName: 'AssociatedRegions.RegionId',
            propertyValue: _regionIds,
            filterType: 'in',
          },
        ])
        : null,
    };
    healthAuthStore
      ?.getCountries(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe(response => {
        if (regionId && category) {
          const bannedNationalities: CountryModel[] = useUpsert.getField(
            `${category}.entryRequirementBannedNationalities`
          ).value;
          const updatedBannedNationalities: CountryModel[] = [
            ...new Map([ ...bannedNationalities, ...response ].map(item => [ item['id'], item ])).values(),
          ];
          useUpsert.getField(`${category}.entryRequirementBannedNationalities`).set(updatedBannedNationalities);
        }
      });
  };

  const onSearch = (option: string, fieldKey: string): void => {
    if (fieldKey === 'entryRequirementBannedNationalities') {
      const _key = Utilities.isEqual(useUpsert.activeTab, 'Crew Entry Requirement')
        ? 'crewEntryRequirement'
        : 'passengerEntryRequirement';
      const regionsIds = useUpsert.getField(`${_key}.entryRequirementBannedNationalitiesRegions`).value.map(x => x.id);
      if (!Boolean(regionsIds.length)) {
        loadCountries(option);
      }
      loadCountries(option, regionsIds);
    }
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
          isTabDisable={isRowEditing}
          getField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
          groupInputControls={groupInputContols()}
          onValueChange={(option: IOptionValue, fieldKey: string) => onChange(option, fieldKey)}
          tabs={tabs()}
          setActiveTab={(activeTab: string) => useUpsert.setActiveTab(activeTab)}
          activeTab={useUpsert.activeTab}
          onSearch={(option: string, fieldKey: string) => onSearch(option, fieldKey)}
          customComponent={inputControl => {
            return inputControl?.fieldKey?.split('.')[1] === 'formRequirements' ? (
              <EntryFormRequirementGrid
                key={inputControl.fieldKey}
                isEditable={
                  useUpsert.isEditable &&
                  !Boolean(useUpsert.getField(`${inputControl.fieldKey.split('.')[0]}.isInherited`).value)
                }
                rowData={entryFormRequirements(inputControl.fieldKey)}
                onDataUpdate={(formRequirements: EntryFormRequirementModel[]) =>
                  onChange(formRequirements, inputControl.fieldKey || '')
                }
                onRowEdit={isRowEditing => {
                  if (isRowEditing) {
                    useUpsert.getField(inputControl.fieldKey || '').onFocus();
                  }
                  setIsRowEditing(isRowEditing);
                }}
              />
            ) : (
              <PreTravelTestDetailGrid
                key={inputControl?.fieldKey}
                isEditable={
                  useUpsert.isEditable &&
                  !Boolean(useUpsert.getField(`${inputControl?.fieldKey?.split('.')[0]}.isInherited`).value)
                }
                rowData={entryPreTravelTestDetails(inputControl?.fieldKey || '')}
                onDataUpdate={(preTravelTestDetail: PreTravelTestDetailModel[]) =>
                  onChange(preTravelTestDetail, inputControl?.fieldKey || '')
                }
                onRowEdit={isRowEditing => {
                  if (isRowEditing) {
                    useUpsert.getField(inputControl?.fieldKey || '').onFocus();
                  }
                  setIsRowEditing(isRowEditing);
                }}
              />
            );
          }}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('healthAuthStore', 'settingsStore')(observer(EntryRequirement));
