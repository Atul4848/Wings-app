import React, { ReactNode, FC, useState, useEffect } from 'react';
import { EditDialog, VIEW_MODE, CityModel, ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CountryStore, SettingsStore } from '../../Shared/Stores';
import { fields } from './Fields';
import {
  IAPIGridRequest,
  IAPISearchFilter,
  IClasses,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';
import { useCountryModuleSecurity } from '../../Shared';

interface Props {
  cityModel: CityModel;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  viewMode: VIEW_MODE;
  onUpsertCity: (updatedCityModel: CityModel) => Observable<CityModel>;
  classes?: IClasses;
}

const UpsertCity: FC<Props> = ({ ...props }) => {
  const tabs = useState<string>('City Details');
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(props, fields, baseEntitySearchFilters);
  const [ isAlreadyExist, setIsAlreadyExists ] = useState<boolean>(false);
  const _settingsStore = props.settingsStore as SettingsStore;
  const _countryStore = props.countryStore as CountryStore;
  const countryId = Number(params?.countryId);
  const stateId = Number(params?.stateId);
  const countryModuleSecurity = useCountryModuleSecurity()

  /* istanbul ignore next */
  useEffect(() => {
    const { cityModel } = props;
    useUpsert.setFormValues(cityModel);
    setCappsNameRule();
    loadStates();
    return () => {
      _countryStore.clearStore();
    };
  }, []);

  /* istanbul ignore next */
  const hasError = (): boolean => {
    return isAlreadyExist || useUpsert.form.hasError || !Boolean(useUpsert.getField('country').value?.id);
  };

  const latitudeDMS = (): string => {
    const { latitude } = Utilities.getLatLongDMSCoords(
      useUpsert.getField('longitude').value,
      useUpsert.getField('latitude').value
    );
    return Utilities.dmsCoords(latitude);
  };

  const longitudeDMS = (): string => {
    const { longitude } = Utilities.getLatLongDMSCoords(
      useUpsert.getField('longitude').value,
      useUpsert.getField('latitude').value
    );
    return Utilities.dmsCoords(longitude);
  };

  /* istanbul ignore next */
  // 56009
  const hasCappsCode = (): boolean => {
    const { cityModel } = props;
    return Boolean(cityModel.id && cityModel.cappsCode);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'officialName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'commonName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cityAlternateNames',
            type: EDITOR_TYPES.FREE_SOLO_CHIP_INPUT,
            customErrorMessage: useUpsert.getCustomValidationError('cityAlternateNames'),
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'cappsCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: hasCappsCode(),
            customErrorMessage: isAlreadyExist ? 'Capps Code already exist for selected Country' : '',
          },
          {
            fieldKey: 'cappsName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsShortName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _countryStore.countries,
            isDisabled: useUpsert.isEditView || Boolean(countryId),
          },
          {
            fieldKey: 'state',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: Boolean(stateId) || !Boolean(useUpsert.getField('country').value?.id),
            options: _countryStore.states,
            autoSelect: false,
          },
          {
            fieldKey: 'metro',
            type: EDITOR_TYPES.DROPDOWN,
            options: _countryStore.metros,
            isDisabled: true,
          },
          {
            fieldKey: 'latitude',
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isInputCustomLabel: true,
            tooltipText: latitudeDMS(),
          },
          {
            fieldKey: 'longitude',
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isInputCustomLabel: true,
            tooltipText: longitudeDMS(),
          },
          {
            fieldKey: 'population',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'ranking',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled: hasCappsCode(),
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
        ],
      },
    ];
  };

  const setCappsNameRule = () => {
    const { value } = useUpsert.getField('cappsCode');
    useUpsert.setFormRules('cappsName', Boolean(value), useUpsert.getFieldLabel('cappsName'));
  };

  const onAction = (gridAction: GRID_ACTIONS) => {
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertCity();
        break;
      case GRID_ACTIONS.CANCEL:
        useUpsert.onCancel(props.cityModel);
        break;
    }
  };

  const onValueChange = (newValue: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(newValue);
    switch (fieldKey) {
      case 'country':
        useUpsert.clearFormFields([ 'state', 'metro' ]);
        if (!newValue) {
          setIsAlreadyExists(false);
          _countryStore.states = [];
          return;
        }
        loadStates();
        validateCity();
        break;
      case 'cappsCode':
        setCappsNameRule();
        validateCity();
        break;
    }
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string) => {
    if (Utilities.isEqual(fieldKey, 'country')) {
      if (!searchValue) {
        _countryStore.countries = [];
        return;
      }
      const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
      useUpsert.observeSearch(_countryStore.getCountries(countryRequest));
    }
  };

  const onFocus = (fieldKey: string) => {
    switch (fieldKey) {
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  /* istanbul ignore next */
  const loadStates = () => {
    const countryId: string = useUpsert.getField('country').value?.id;
    if (!countryId) {
      return;
    }

    const notEqualFilter: IAPISearchFilter = {
      propertyName: 'CappsCode',
      operator: 'and',
      propertyValue: null,
      filterType: 'ne',
    };

    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('Country.CountryId', countryId), notEqualFilter ]),
    };
    useUpsert.observeSearch(_countryStore.getStates(request));
  };

  /* istanbul ignore next */
  const validateCity = () => {
    const countryId: string = useUpsert.getField('country').value?.id;
    const cappsCode: string = useUpsert.getField('cappsCode').value;
    if (!countryId || !cappsCode) {
      setIsAlreadyExists(false);
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('Country.CountryId', countryId) ]),
      searchCollection: JSON.stringify([ Utilities.getFilter('CAPPSCode', cappsCode) ]),
      specifiedFields: [ 'CityId', 'OfficialName', 'CAPPSCode' ],
    };
    useUpsert.observeSearch(
      _countryStore.getCities(request).pipe(
        tapWithAction(({ results }) => {
          const { cityModel } = props;
          setIsAlreadyExists(
            results.some(
              city => !Utilities.isEqual(city.id, cityModel.id) && Utilities.isEqual(city.cappsCode, cappsCode)
            )
          );
        })
      )
    );
  };

  /* istanbul ignore next */
  const upsertCity = () => {
    const { cityModel } = props;
    const cityModelData: CityModel = new CityModel({
      ...cityModel,
      ...useUpsert.form.values(),
    });
    useUpsert.setIsLoading(true);
    props
      .onUpsertCity(cityModelData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe({
        next: () => ModalStore.close(),
        error: error => useUpsert.showAlert(error.message, 'upsertCity'),
      });
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
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
    <EditDialog
      tabs={tabs}
      noTabs={true}
      title="City Details"
      isEditable={useUpsert.isEditable}
      hasErrors={hasError() || !useUpsert.form.changed}
      isLoading={useUpsert.isLoading}
      hasEditPermission={countryModuleSecurity.isEditable}
      onAction={onAction}
      tabContent={dialogContent}
    />
  );
};

export default inject('countryStore', 'settingsStore')(observer(UpsertCity));
