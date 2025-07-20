import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, CountryModel, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { fields } from './Fields';
import {
  HealthAuthModel,
  HealthAuthStore,
  SettingsStore,
  CountryLevelExclusionModel,
  TraveledHistoryModel,
  SectionLevelExclusionModel,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { useParams, useNavigate } from 'react-router-dom';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  IAPIGridRequest,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { DetailsEditorWrapper, ConfirmNavigate, Collapsable, DetailsEditorHeaderSection } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './TraveledHistory.style';
import classNames from 'classnames';
import { SectionLevelExclusion, CountryLevelExclusion } from './Components';

interface Props {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
}

const TraveledHistory: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const [ rowEditing, setRowEditing ] = useState<{ isLink: boolean; isRequirement: boolean }>({
    isLink: false,
    isRequirement: false,
  });

  const healthAuth = (): HealthAuthModel => {
    return _healthAuthStore.selectedHealthAuth;
  };

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setFormValues(healthAuth());
    if (!restrictionModuleSecurity.isQRGAdmin) {
      return useUpsert.setViewMode(VIEW_MODE.DETAILS);
    }
    setTraveledHistoryValidations(healthAuth().traveledHistory.isTraveledHistoryRequired);
  }, []);

  const setTraveledHistoryValidations = (isTraveledHistory: boolean = true): void => {
    useUpsert.setFormRules('traveledHistory.countryLevelExclusions', isOtherSelected(), 'Links');
    useUpsert.setFormRules(
      'traveledHistory.traveledHistoryCountries',
      isTraveledHistory && !isOtherSelected(),
      'Traveled History Countries'
    );
    useUpsert.setFormRules('traveledHistory.travelHistoryTimeframe', isTraveledHistory, 'Traveled History Time Frame');
    if (isOtherSelected()) {
      useUpsert.getField('traveledHistory.traveledHistoryCountries').set([]);
      return;
    }
    useUpsert.getField('traveledHistory.countryLevelExclusions').set([]);
  };

  /* istanbul ignore next */
  const clearValidation = (): void => {
    useUpsert.setFormRules('traveledHistory.countryLevelExclusions', false, 'Links');
    useUpsert.setFormRules('traveledHistory.traveledHistoryCountries', false, 'Traveled History Countries');
    useUpsert.setFormRules('traveledHistory.travelHistoryTimeframe', false, 'Traveled History Time Frame');
  };

  /* istanbul ignore next */
  const resetTraveledHistoryForm = (): void => {
    const fieldKeys = [
      'traveledHistory.traveledHistoryCountries',
      'traveledHistory.isOther',
      'traveledHistory.sectionLevelExclusions',
      'traveledHistory.countryLevelExclusions',
    ];
    useUpsert.clearFormFields(fieldKeys);
    useUpsert.getField('traveledHistory.travelHistoryTimeframe').set(null);
    clearValidation();
  };

  const countryLevelExclusions = (): CountryLevelExclusionModel[] => {
    return useUpsert.getField('traveledHistory.countryLevelExclusions')?.values() || [];
  };

  const isOtherSelected = (): boolean => {
    return Boolean(useUpsert.getField('traveledHistory.isOther').values());
  };

  /* istanbul ignore next */
  const upsertTraveledHistory = (): void => {
    const { traveledHistory } = useUpsert.form.values();
    const healthAuthorization: HealthAuthModel = new HealthAuthModel({
      ...healthAuth(),
      traveledHistory: new TraveledHistoryModel({
        ...healthAuth().traveledHistory,
        ...traveledHistory,
        // Math.floor(id) is required to make new entry id 0, as tempId is assigned between 0-1.
        countryLevelExclusions: traveledHistory.countryLevelExclusions?.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
        sectionLevelExclusions: traveledHistory.sectionLevelExclusions?.map(({ id, ...rest }) => {
          return { id: Math.floor(id), ...rest };
        }),
      }),
    });
    UIStore.setPageLoader(true);
    _healthAuthStore
      .upsertTraveledHistory(healthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          useUpsert.form.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          useUpsert.setFormValues(healthAuth());
          setTraveledHistoryValidations(healthAuth().traveledHistory?.isTraveledHistoryRequired);
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
        upsertTraveledHistory();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel();
        break;
    }
  };

  const onFocus = (fieldKey: string, searchValue = ''): void => {
    if (fieldKey === 'traveledHistoryCountries') {
      const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
      useUpsert.observeSearch(_healthAuthStore.getCountries(countryRequest, true));
    }
  };

  const onSearch = (value: string, fieldKey: string): void => {
    if (fieldKey === 'traveledHistoryCountries') {
      onFocus(fieldKey, value);
    }
  };

  /* istanbul ignore next */
  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(healthAuth());
      setTraveledHistoryValidations(healthAuth().traveledHistory?.isTraveledHistoryRequired);
      return;
    }
    navigate('/restrictions', useUpsert.noBlocker);
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    switch (fieldKey) {
      case 'traveledHistory.isTraveledHistoryRequired':
        if (!Boolean(value) && Boolean(useUpsert.getField(fieldKey).value)) {
          confirmReset(fieldKey, value as boolean);
          return;
        }
        useUpsert.getField(fieldKey).set(value);
        setTraveledHistoryValidations(value as boolean);
        break;
      case 'traveledHistory.isOther':
        const sectionLevelExclusions = useUpsert.getField('traveledHistory.sectionLevelExclusions').values();
        if (Boolean(value) && sectionLevelExclusions?.length) {
          showConfirmationDialog();
          return;
        }
        useUpsert.getField(fieldKey).set(value);
        setTraveledHistoryValidations();
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
        break;
    }
  };

  /* istanbul ignore next */
  const showConfirmationDialog = (): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        useUpsert.getField('traveledHistory.isOther').set(true);
        setTraveledHistoryValidations();
        useUpsert.getField('traveledHistory.sectionLevelExclusions').set([]);
      },
      {
        onNo: () => {
          useUpsert.getField('traveledHistory.isOther').set(false);
          ModalStore.close();
        },
        title: 'Confirm Action',
        message: 'Requirements table will be cleared out. Do you want to continue?',
        onClose: () => {
          useUpsert.getField('traveledHistory.isOther').set(false);
          ModalStore.close();
        },
      }
    );
  };

  /* istanbul ignore next */
  const confirmReset = (fieldKey: string, value: boolean): void => {
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        resetTraveledHistoryForm();
        useUpsert.getField(fieldKey).set(value);
      },
      {
        title: 'Confirm Change',
        message: 'This will reset traveled History data. Do you want to proceed?',
      }
    );
  };

  const isTraveledHistoryRequired = (): boolean => {
    return useUpsert.getField('traveledHistory.isTraveledHistoryRequired')?.value;
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Traveled History',
        inputControls: [
          {
            fieldKey: 'traveledHistory.isTraveledHistoryRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
          },
          {
            fieldKey: 'traveledHistory.traveledHistoryCountries',
            type: EDITOR_TYPES.DROPDOWN,
            options: _healthAuthStore.countries,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: isOtherSelected(),
            isHidden: !isTraveledHistoryRequired(),
            getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
            showChipTooltip: true,
          },
          {
            fieldKey: 'traveledHistory.travelHistoryTimeframe',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Days',
            isHidden: !isTraveledHistoryRequired(),
          },
          {
            fieldKey: 'traveledHistory.isOther',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !isTraveledHistoryRequired(),
          },
        ],
      },
      {
        title: 'Links',
        inputControls: [],
      },
      {
        title: 'Requirements',
        inputControls: [],
      },
    ];
  };

  const isRowEditing = (): boolean => {
    const { isLink, isRequirement } = rowEditing;
    return isLink || isRequirement;
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_healthAuthStore.selectedHealthAuth.title}
        backNavLink="/restrictions"
        backNavTitle="Health Authorizations"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading || isRowEditing()}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isQRGAdmin}
        onAction={action => onAction(action)}
        isRowEditing={isRowEditing()}
      />
    );
  };

  const countryLevelExclusionsGrid = (): ReactNode => {
    if (!(isOtherSelected() && isTraveledHistoryRequired())) {
      return null;
    }
    return (
      <CountryLevelExclusion
        isEditable={useUpsert.isEditable}
        rowData={countryLevelExclusions()}
        onDataUpdate={(countryLevelExclusions: CountryLevelExclusionModel[]) =>
          onValueChange(countryLevelExclusions, 'traveledHistory.countryLevelExclusions')
        }
        onRowEdit={isLink => {
          useUpsert.getField('traveledHistory.countryLevelExclusions').onFocus();
          setRowEditing({ ...rowEditing, isLink });
        }}
      />
    );
  };

  const selectedTraveledHistoryCountries = (): string => {
    const selectedCountries: CountryModel[] =
      useUpsert.getField('traveledHistory.traveledHistoryCountries')?.values() || [];
    return selectedCountries.map(a => a.isO2Code).join(', ');
  };

  const sectionLevelExclusions = (): SectionLevelExclusionModel[] => {
    return useUpsert.getField('traveledHistory.sectionLevelExclusions')?.values() || [];
  };

  const sectionLevelExclusionGrid = (): ReactNode => {
    if (!isTraveledHistoryRequired()) {
      return null;
    }
    return (
      <SectionLevelExclusion
        isEditable={useUpsert.isEditable}
        rowData={sectionLevelExclusions()}
        onDataUpdate={(sectionLevelExclusions: SectionLevelExclusionModel[]) =>
          onValueChange(sectionLevelExclusions, 'traveledHistory.sectionLevelExclusions')
        }
        countryLevel={selectedTraveledHistoryCountries()}
        onRowEdit={isRequirement => {
          useUpsert.getField('traveledHistory.sectionLevelExclusions').onFocus();
          setRowEditing({ ...rowEditing, isRequirement });
        }}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <div className={classes.flexRow}>
          {groupInputControls().map(groupInputControl => {
            switch (groupInputControl.title) {
              case 'Links':
                return <div key={groupInputControl.title}>{countryLevelExclusionsGrid()}</div>;
              case 'Requirements':
                return <div key={groupInputControl.title}>{sectionLevelExclusionGrid()}</div>;
              default:
                return (
                  <Collapsable key={groupInputControl.title} title={groupInputControl.title}>
                    <div className={classes.flexWrap}>
                      {groupInputControl.inputControls
                        .filter(inputControl => !inputControl.isHidden)
                        .map((inputControl: IViewInputControl, index: number) => (
                          <ViewInputControl
                            {...inputControl}
                            key={index}
                            onSearch={(value: string, fieldKey: string) => onSearch(value, fieldKey)}
                            customErrorMessage={inputControl.customErrorMessage}
                            field={useUpsert.getField(inputControl.fieldKey || '')}
                            isEditable={useUpsert.isEditable}
                            classes={{
                              flexRow: classNames({
                                [classes.inputControl]: true,
                                [classes.fullFlex]: inputControl.isFullFlex,
                              }),
                            }}
                            onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                            onFocus={(fieldKey: string) => onFocus(fieldKey)}
                          />
                        ))}
                    </div>
                  </Collapsable>
                );
            }
          })}
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('healthAuthStore')(observer(TraveledHistory));
