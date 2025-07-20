import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  EntityMapModel,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFilter,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import {
  BaseAirportStore,
  EntityOptionsStore,
  IBaseModuleProps,
  ModelStatusOptions,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useNavigate, useParams } from 'react-router';
import { airportRequest, fields, getLabel, getTooltip } from './Fields';
import { useGeographicModuleSecurity } from '../../Shared/Tools';
import { finalize, takeUntil } from 'rxjs/operators';
import { useStyles } from './UpsertSupplier.styles';
import { SupplierModel, TimeZoneSettingsStore, updateTimezoneSidebarOptions, TimeZoneStore } from '../../Shared';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { Chip } from '@material-ui/core';
import { forkJoin } from 'rxjs';
import SupplierAirportGrid from './SupplierAirportGrid/SupplierAirportGrid';

interface Props extends Partial<IBaseModuleProps> {
  timeZoneStore?: TimeZoneStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  entityOptionsStore?: EntityOptionsStore;
  sidebarStore?: typeof SidebarStore;
}

const UpsertSupplier: FC<Props> = ({ ...props }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const backNavLink: string = '/geographic/suppliers';
  const _timeZoneStore = props.timeZoneStore as TimeZoneStore;
  const _timeZoneSettingsStore = props.timeZoneSettingsStore as TimeZoneSettingsStore;
  const _entityOptionsStore = props.entityOptionsStore as EntityOptionsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const baseAirportStore = useMemo(() => new BaseAirportStore(), []);
  const useUpsert = useBaseUpsertComponent<SupplierModel>(params, fields, baseEntitySearchFilters);
  const [ supplierDetails, setSupplierDetails ] = useState(new SupplierModel());
  const [ editingGrid, setEditingGrid ] = useState<string[]>([]);
  const geographicModuleSecurity = useGeographicModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Suppliers'), 'geographic');
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadSupplier();
  }, []);

  /* istanbul ignore next */
  const loadSupplier = (): void => {
    if (!params.supplierId) {
      useUpsert.setFormValues(supplierDetails);
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('SupplierId', params.supplierId) ]),
    };
    UIStore.setPageLoader(true);
    _timeZoneStore
      ?.getSuppliers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        setSupplierDetails(response.results[0]);
        useUpsert.setFormValues(response.results[0]);
        mapEntities();
      });
  };

  const mapEntities = () => {
    const cityIds = useUpsert.getField('cities').value?.map(s => s.entityId);
    const stateIds = useUpsert.getField('states').value?.map(s => s.entityId);
    const { CITY, STATE } = SEARCH_ENTITY_TYPE;

    UIStore.setPageLoader(true);
    forkJoin([
      _entityOptionsStore.searchEntity(
        CITY,
        useUpsert.getFilterRequest(CITY, [{ propertyName: 'CityId', propertyValue: cityIds, filterType: 'in' }])
      ),

      _entityOptionsStore.searchEntity(
        STATE,
        useUpsert.getFilterRequest(STATE, [{ propertyName: 'StateId', propertyValue: stateIds, filterType: 'in' }])
      ),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ cities, states ]) => {
        useUpsert.getField('cities').set(cities);
        useUpsert.getField('states').set(states);
        clearStoreEntities();
      });
  };

  const upsertSupplier = (): void => {
    const model = new SupplierModel({
      ...supplierDetails,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _timeZoneStore
      .upsertSupplier(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          setSupplierDetails(response);
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
          if (!model.id) {
            navigate(`/geographic/suppliers/${response?.id}/edit`, useUpsert.noBlocker);
          }
          mapEntities();
        },
        error: error => useUpsert.showAlert(error.message, 'upsertSupplier'),
      });
  };

  /* istanbul ignore next */
  const setRequiredFields = () => {
    const label = useUpsert.getField('serviceLevel').value?.label?.toLowerCase();
    const requiredFields = {
      cities: label === 'city',
      states: [ 'city', 'state' ].includes(label),
      countries: [ 'city', 'state', 'country' ].includes(label),
    };

    Object.entries(requiredFields).forEach(([ field, isRequired ]) => {
      useUpsert.getField(field).set('rules', isRequired ? 'required' : '');
    });

    useUpsert.form.validate();
  };

  /* istanbul ignore next */
  const disableFields = fieldKey => {
    const serviceLevel = useUpsert.getField('serviceLevel').value?.label;
    const countryIds = useUpsert.getField('countries').value?.map(c => c.id || c.entityId) || [];
    const stateIds = useUpsert.getField('states').value?.map(s => s.id || s.entityId) || [];

    if (!serviceLevel || serviceLevel === 'Worldwide') return true;

    const serviceLevelMap = {
      country: ![ 'Country', 'State', 'City' ].includes(serviceLevel),
      state: !(countryIds.length && [ 'State', 'City' ].includes(serviceLevel)),
      city: !(stateIds.length && serviceLevel === 'City'),
    };

    return serviceLevelMap[fieldKey] ?? !Utilities.isEqual(serviceLevel, fieldKey);
  };

  const optionAndChipLabel = (model, fieldKey) => {
    if (Array.isArray(model)) {
      return model.map((x, idx) => <Chip key={idx} label={x.label} classes={{ root: classes.chip }} />);
    }
    return getLabel(model, fieldKey);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'supplierType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.supplierTypes,
          },
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'emailAddress',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'serviceLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.serviceLevels,
          },
          {
            fieldKey: 'countries',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            options: _entityOptionsStore.countries,
            multiple: true,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: disableFields('country'),
          },
          {
            fieldKey: 'states',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            options: _entityOptionsStore.states,
            multiple: true,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            getOptionLabel: option => optionAndChipLabel(option, 'states'),
            getChipLabel: option => optionAndChipLabel(option, 'states'),
            getOptionTooltip: option => getTooltip(option, 'states'),
            showTooltip: true,
            isDisabled: disableFields('state'),
          },
          {
            fieldKey: 'cities',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            options: _entityOptionsStore.cities,
            multiple: true,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            getOptionLabel: option => optionAndChipLabel(option, 'cities'),
            getChipLabel: option => optionAndChipLabel(option, 'cities'),
            getOptionTooltip: option => getTooltip(option, 'cities'),
            showTooltip: true,
            isDisabled: disableFields('city'),
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.sourceTypes,
          },
        ],
      },
    ];
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertSupplier();
        break;
      case GRID_ACTIONS.EDIT:
        mapEntities();
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode, VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(supplierDetails);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink);
        break;
    }
  };

  const filterStateAndCity = () => {
    const countries = useUpsert.getField('countries').value?.map(x => x.entityId) || [];
    const states = useUpsert.getField('states').value || [];
    const cities = useUpsert.getField('cities').value || [];

    const filterStates = states.filter(state => countries.includes(state.country?.countryId));
    useUpsert.getField('states').set(filterStates);

    const filterCities = cities.filter(city => filterStates.map(x => x.entityId).includes(city.state?.stateId));
    useUpsert.getField('cities').set(filterCities);
    clearStoreEntities();
  };

  const clearStoreEntities = () => {
    _entityOptionsStore.countries = [];
    _entityOptionsStore.cities = [];
    _entityOptionsStore.states = [];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'serviceLevel':
        clearStoreEntities();
        baseAirportStore.wingsAirports = [];
        useUpsert.clearFormFields([ 'countries', 'states', 'cities' ]);
        setRequiredFields();
        break;
      case 'countries':
        if (!(value as IOptionValue[]).length) {
          _entityOptionsStore.states = [];
          _entityOptionsStore.cities = [];
          useUpsert.clearFormFields([ 'states', 'cities' ]);
        }
        filterStateAndCity();
        setRequiredFields();
        break;
      case 'states':
        if (!(value as IOptionValue[]).length) {
          _entityOptionsStore.cities = [];
          useUpsert.clearFormFields([ 'cities' ]);
        }
        filterStateAndCity();
        setRequiredFields();
        break;
      case 'cities':
        setRequiredFields();
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'supplierType':
        useUpsert.observeSearch(_timeZoneSettingsStore.getSupplierTypes());
        break;
      case 'serviceLevel':
        useUpsert.observeSearch(_timeZoneSettingsStore.getServiceLevels());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_timeZoneSettingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_timeZoneSettingsStore.getSourceTypes());
        break;
    }
  };

  /* istanbul ignore next */
  const searchFilters = (fieldKey): IAPISearchFilter[] => {
    if (fieldKey === 'states') {
      const countryIds: number = useUpsert.getField('countries').value?.map(c => c.entityId);
      return [{ propertyName: 'Country.CountryId', propertyValue: countryIds, filterType: 'in' }];
    }
    const stateIds: number[] = useUpsert.getField('states').value?.map(s => s.entityId);
    return [{ propertyName: 'State.StateId', propertyValue: stateIds, filterType: 'in' }];
  };

  const onSearch = (searchValue, fieldKey, searchEntityType): void => {
    if (!searchValue.length) {
      baseAirportStore.wingsAirports = [];
      _entityOptionsStore.countries = [];
      _entityOptionsStore.states = [];
      _entityOptionsStore.cities = [];
      return;
    }
    switch (fieldKey) {
      case 'countries':
        const countryRequest = useUpsert.getSearchRequest(searchValue, searchEntityType);
        useUpsert.observeSearch(_entityOptionsStore.searchEntity(searchEntityType, countryRequest));
        break;
      case 'states':
      case 'cities':
        const request = useUpsert.getSearchRequest(searchValue, searchEntityType, [ ...searchFilters(fieldKey) ]);
        useUpsert.observeSearch(_entityOptionsStore.searchEntity(searchEntityType, request));
        break;
    }
  };

  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = editingGrid.filter(a => !Utilities.isEqual(a, girdName));
    if (isEditing) {
      editingGrid.push(girdName);
      return;
    }
    setEditingGrid(_editingGrids);
  };

  /* istanbul ignore next */
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavLink={backNavLink}
        backNavTitle="Suppliers"
        disableActions={UIStore.pageLoading || useUpsert.form.hasError || !useUpsert.form.changed}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={geographicModuleSecurity.isEditable}
        onAction={action => onAction(action)}
      />
    );
  };
  const { supplierAirports } = useUpsert.form.values();

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={useUpsert.getField}
          isEditing={useUpsert.isEditable}
          onValueChange={onValueChange}
          isLoading={useUpsert.loader.isLoading}
          onFocus={onFocus}
          onSearch={onSearch}
        />
        <SupplierAirportGrid
          key={`airport-${useUpsert.isEditable}`}
          isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
          supplierAirports={supplierAirports}
          onRowEditing={isEditing => updateRowEditing(isEditing, 'airportGrid')}
          useUpsert={useUpsert}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'timeZoneStore',
  'timeZoneSettingsStore',
  'sidebarStore',
  'entityOptionsStore'
)(observer(UpsertSupplier));
