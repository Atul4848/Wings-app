import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IOptionValue,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  EditDialog,
  IslandModel,
  ModelStatusOptions,
  StateModel,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Observable, forkJoin } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { CountryStore, SettingsStore } from '../../Shared/Stores';
import { fields } from './Fields';
import { useStyles } from './UpsertIsland.styles';
import { useCountryModuleSecurity } from '../../Shared';

interface Props {
  islandModel: IslandModel;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  viewMode: VIEW_MODE;
  onUpsertIsland: (updatedIslandModel: IslandModel) => Observable<IslandModel>;
}

const UpsertIsland: FC<Props> = ({ ...props }) => {
  const tabs = useState<string>('Island Details');
  const [ states, setStates ] = useState<StateModel[]>([]);
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const countryModuleSecurity = useCountryModuleSecurity()
  const useUpsert = useBaseUpsertComponent(props, fields, baseEntitySearchFilters);
  const [ isAlreadyExist, setIsAlreadyExists ] = useState<boolean>(false);
  const _settingsStore = props.settingsStore as SettingsStore;
  const _countryStore = props.countryStore as CountryStore;

  /* istanbul ignore next */
  useEffect(() => {
    const { islandModel } = props;
    useUpsert.setFormValues(islandModel);
    loadInitialData();

    if (islandModel?.country?.id) {
      loadStates();
    }
  }, []);

  /* istanbul ignore next */
  const countryId = Utilities.getNumberOrNullValue(params?.countryId);

  /* istanbul ignore next */
  const stateId = Utilities.getNumberOrNullValue(params?.stateId);

  /* istanbul ignore next */
  const inputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'name',
        type: EDITOR_TYPES.TEXT_FIELD,
        customErrorMessage: isAlreadyExist ? 'Name should be unique' : '',
      },
      {
        fieldKey: 'country',
        type: EDITOR_TYPES.DROPDOWN,
        options: _countryStore.countries,
        isDisabled: useUpsert.isEditView || Boolean(countryId),
        customErrorMessage: isAlreadyExist ? 'Country should be unique' : '',
      },
      {
        fieldKey: 'state',
        type: EDITOR_TYPES.DROPDOWN,
        isDisabled: Boolean(stateId) || !Boolean(useUpsert.getField('country').value?.id),
        options: states,
        customErrorMessage: isAlreadyExist && useUpsert.getField('state').value?.id ? 'State should be unique' : '',
      },
      {
        fieldKey: 'status',
        type: EDITOR_TYPES.DROPDOWN,
        options: ModelStatusOptions,
      },
      {
        fieldKey: 'accessLevel',
        type: EDITOR_TYPES.DROPDOWN,
        options: _settingsStore.accessLevels,
      },
      {
        fieldKey: 'sourceType',
        type: EDITOR_TYPES.DROPDOWN,
        options: _settingsStore.sourceTypes,
      },
    ];
  };

  const onAction = (gridAction: GRID_ACTIONS) => {
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertIsland();
        break;
      case GRID_ACTIONS.CANCEL:
        useUpsert.onCancel(props.islandModel);
        break;
    }
  };

  /* istanbul ignore next */
  // Check if Island Is Alredy Exist or Not based On the Name, State and country
  const validateIsLand = () => {
    const { name, country, state } = useUpsert.form.values();
    if (!country?.id || !name) {
      setIsAlreadyExists(false);
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('Country.CountryId', country?.id) ]),
      searchCollection: JSON.stringify([ Utilities.getFilter('Name', name) ]),
    };
    useUpsert.observeSearch(
      _countryStore.getIslands(request).pipe(
        tapWithAction(({ results }) => {
          const _isAlreadyExists = results
            .filter(x => x.id !== props.islandModel?.id)
            .some(x => (state?.id ? Utilities.isEqual(x.state?.id, state?.id) : !Boolean(x.state?.id)));
          setIsAlreadyExists(_isAlreadyExists);
        })
      )
    );
  };

  /* istanbul ignore next */
  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'name':
        validateIsLand();
        break;
      case 'state':
        loadStates();
        validateIsLand();
        break;
      case 'country':
        useUpsert.getField('state').set(null);
        if (value) {
          loadStates();
        }
        validateIsLand();
        break;
    }
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _countryStore.getCountries(), _settingsStore.getSourceTypes(), _settingsStore.getAccessLevels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadStates = () => {
    const { country } = useUpsert.form.values();
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: country?.id }]),
    };
    useUpsert.setIsLoading(true);
    _countryStore
      .getStates(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        map(response => response.results),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe((states: StateModel[]) => setStates(states));
  };

  /* istanbul ignore next */
  const upsertIsland = () => {
    const { islandModel } = props;
    const islandModelData: IslandModel = new IslandModel({
      ...islandModel,
      ...useUpsert.form.values(),
    });
    useUpsert.setIsLoading(true);
    props
      .onUpsertIsland(islandModelData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe({
        next: () => ModalStore.close,
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => useUpsert.setIsLoading(false),
      });
  };

  const dialogContent = () => {
    return (
      <>
        <div className={classes.flexWrap}>
          {inputControls().map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              field={useUpsert.getField(inputControl.fieldKey || '')}
              isEditable={useUpsert.isEditable}
              onValueChange={(option: IOptionValue, fieldKey) => onValueChange(option, fieldKey)}
            />
          ))}
        </div>
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </>
    );
  };

  {
    return (
      <EditDialog
        tabs={tabs}
        noTabs={true}
        title="Island Details"
        isEditable={useUpsert.isEditable}
        hasErrors={useUpsert.form.hasError || isAlreadyExist || !useUpsert.form.changed}
        isLoading={useUpsert.isLoading}
        hasEditPermission={countryModuleSecurity.isEditable}
        onAction={(action: GRID_ACTIONS) => onAction(action)}
        tabContent={dialogContent}
      />
    );
  }
};

export default inject('countryStore', 'settingsStore')(observer(UpsertIsland));
