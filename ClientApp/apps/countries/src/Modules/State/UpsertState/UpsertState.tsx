import { EditDialog, ModelStatusOptions, StateModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { ReactNode, useEffect, useState } from 'react';
import { CountryStore, SettingsStore, useCountryModuleSecurity } from '../../Shared';
import { Observable } from 'rxjs';
import { AuditFields, EDITOR_TYPES, IViewInputControl, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import { fields } from './Fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';

interface Props {
  countryId?: Number;
  stateModel: StateModel;
  viewMode: VIEW_MODE;
  onUpsertState: (stateModel: StateModel) => Observable<StateModel>;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
}

const UpsertState = ({ ...props }: Props) => {
  const tabs: string[] = [ 'State Details' ];
  const [ isAlreadyExist, setIsAlreadyExist ] = useState<boolean>(false);
  const [ isStateCodeExist, setIsStateCodeExist ] = useState<boolean>(false);
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(props, fields, baseEntitySearchFilters);
  const countryModuleSecurity = useCountryModuleSecurity()
  const _countryStore = props.countryStore as CountryStore;
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setFormValues(props.stateModel);
    useUpsert
      .getField('startDate')
      .set(Utilities.getformattedDate(props.stateModel?.startDate, DATE_FORMAT.API_DATE_FORMAT));
    useUpsert
      .getField('endDate')
      .set(Utilities.getformattedDate(props.stateModel?.endDate, DATE_FORMAT.API_DATE_FORMAT));
    setFieldRules(props.stateModel?.syncToCAPPS);

    return () => _countryStore.clearStore();
  }, []);

  /* istanbul ignore next */
  const hasError = (): boolean =>
    useUpsert.form.hasError || !Boolean(useUpsert.getField('country').value?.id) || isAlreadyExist || isStateCodeExist;

  /* istanbul ignore next */
  const validateISOCode = () => {
    const isoCode: string = useUpsert.getField('isoCode').value;
    if (!isoCode) {
      setIsAlreadyExist(false);
      return;
    }
    const request: IAPIGridRequest = {
      pageSize: 0,
      searchCollection: JSON.stringify([ Utilities.getFilter('ISOCode', isoCode) ]),
    };
    useUpsert.observeSearch(
      _countryStore.getStates(request).pipe(
        tapWithAction(({ results }) => {
          const _isAlreadyExist = results.some(
            (state: StateModel) =>
              !Utilities.isEqual(state.id, props.stateModel.id) && Utilities.isEqual(state.isoCode, isoCode)
          );
          setIsAlreadyExist(_isAlreadyExist);
        })
      )
    );
  };

  /* istanbul ignore next */
  const validateStateCode = () => {
    const countryId = useUpsert.getField('country').value?.countryId;
    const stateCode: string = useUpsert.getField('code').value;
    if (!countryId || !stateCode) {
      setIsStateCodeExist(false);
      return;
    }
    const request: IAPIGridRequest = {
      pageSize: 0,
      filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: countryId }]),
      searchCollection: JSON.stringify([ Utilities.getFilter('Code', stateCode) ]),
    };
    useUpsert.observeSearch(
      _countryStore.getStates(request).pipe(
        tapWithAction(({ results }) => {
          // needs to check with latest code value
          const stateCode: string = useUpsert.getField('code').value;
          if (!stateCode) {
            setIsStateCodeExist(false);
            return;
          }
          const _isStateCodeExist = results.some(
            (state: StateModel) =>
              !Utilities.isEqual(state.id, props.stateModel.id) && Utilities.isEqual(state.code, stateCode)
          );
          setIsStateCodeExist(_isStateCodeExist);
        })
      )
    );
  };

  const inputControls: IViewInputControl[] = [
    {
      fieldKey: 'country',
      type: EDITOR_TYPES.DROPDOWN,
      options: _countryStore.countries,
      isDisabled: useUpsert.isEditView || Boolean(props.countryId),
    },
    {
      fieldKey: 'code',
      type: EDITOR_TYPES.TEXT_FIELD,
      isDisabled: useUpsert.isEditView,
      isExists: isStateCodeExist,
    },
    {
      fieldKey: 'isoCode',
      type: EDITOR_TYPES.TEXT_FIELD,
      isExists: isAlreadyExist,
    },
    {
      fieldKey: 'stateType',
      type: EDITOR_TYPES.DROPDOWN,
      options: _settingsStore.stateTypes,
    },
    {
      fieldKey: 'commonName',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'officialName',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'cappsCode',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'cappsName',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'syncToCAPPS',
      type: EDITOR_TYPES.CHECKBOX,
    },
    {
      fieldKey: 'startDate',
      type: EDITOR_TYPES.DATE,
      maxDate: useUpsert.getField('endDate')?.value || null,
    },
    {
      fieldKey: 'endDate',
      type: EDITOR_TYPES.DATE,
      minDate: useUpsert.getField('startDate')?.value || null,
    },
    {
      fieldKey: 'accessLevel',
      type: EDITOR_TYPES.DROPDOWN,
      options: _settingsStore.accessLevels,
    },
    {
      fieldKey: 'status',
      type: EDITOR_TYPES.DROPDOWN,
      options: ModelStatusOptions,
    },
    {
      fieldKey: 'sourceType',
      type: EDITOR_TYPES.DROPDOWN,
      options: _settingsStore.sourceTypes,
    },
  ];

  const onAction = (gridAction: GRID_ACTIONS): void => {
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertState();
        break;
      case GRID_ACTIONS.CANCEL:
        useUpsert.onCancel(props.stateModel);
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'syncToCAPPS':
        setFieldRules(Boolean(value));
        break;
      case 'isoCode':
        if (!value) {
          _countryStore.states = [];
        }
        validateISOCode();
        break;
      case 'code':
      case 'country':
        if (!value) {
          _countryStore.states = [];
        }
        validateStateCode();
        break;
    }
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'country')) {
      if (!searchValue) {
        _countryStore.countries = [];
        return;
      }
      const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
      useUpsert.observeSearch(_countryStore.getCountries(countryRequest));
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'stateType':
        useUpsert.observeSearch(_settingsStore.getStateTypes());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const setFieldRules = (isRequired: boolean): void => {
    useUpsert.setFormRules('cappsCode', isRequired, useUpsert.getFieldLabel('cappsCode'));
    useUpsert.setFormRules('cappsName', isRequired, useUpsert.getFieldLabel('cappsName'));
  };

  /* istanbul ignore next */
  const upsertState = (): void => {
    const stateModelData: StateModel = new StateModel({
      ...props.stateModel,
      ...useUpsert.form.values(),
    });

    useUpsert.setIsLoading(true);
    props
      .onUpsertState(stateModelData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe({
        next: () => ModalStore.close(),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <ViewInputControlsGroup
          groupInputControls={[{ title: '', inputControls: inputControls }]}
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
        />
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </>
    );
  };

  return (
    <>
      <EditDialog
        tabs={tabs}
        noTabs={true}
        title="State Details"
        isEditable={useUpsert.isEditable}
        hasErrors={hasError() || !useUpsert.form.changed}
        isLoading={useUpsert.isLoading}
        hasEditPermission={countryModuleSecurity.isEditable}
        onAction={action => onAction(action)}
        tabContent={dialogContent}
      />
    </>
  );
};

export default inject('settingsStore', 'countryStore')(observer(UpsertState));
