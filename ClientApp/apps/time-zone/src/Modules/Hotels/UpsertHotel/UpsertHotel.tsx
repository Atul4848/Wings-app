import {
  GRID_ACTIONS,
  IAPISearchFilter,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  EntityOptionsStore,
  IBaseModuleProps,
  ModelStatusOptions,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  EventStore,
  HotelAirportModel,
  HotelModel,
  TimeZoneSettingsStore,
  TimeZoneStore,
  updateTimezoneSidebarOptions,
} from '../../Shared';
import { useNavigate, useParams } from 'react-router';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { fields, latitudeDMS, longitudeDMS } from './Fields';
import { useGeographicModuleSecurity } from '../../Shared/Tools';
import { useStyles } from './UpsertHotel.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import AirportGrid from './AirportGrid/AirportGrid';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  params?: { viewMode: VIEW_MODE; eventId: string };
  eventStore?: EventStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  sidebarStore?: typeof SidebarStore;
  entityOptionsStore?: EntityOptionsStore;
  timeZoneStore?: TimeZoneStore;
}

const UpsertHotel: FC<Props> = ({ timeZoneSettingsStore, sidebarStore, entityOptionsStore, timeZoneStore }: Props) => {
  const navigate = useNavigate();
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const backNavLink: string = '/geographic/hotels';
  const useUpsert = useBaseUpsertComponent<HotelModel>(params, fields, baseEntitySearchFilters);
  const _entityOptionsStore = entityOptionsStore as EntityOptionsStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();
  const [ hotel, setHotel ] = useState(new HotelModel({ id: 0 }));
  const [ editingGrid, setEditingGrid ] = useState<string[]>([]);
  const [ isDataUpdated, setDataUpdate ] = useState(false);

  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Hotels'), 'geographic');
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadHotel();
  }, []);

  /* istanbul ignore next */
  const loadHotel = (): void => {
    if (!params.hotelId) {
      useUpsert.setFormValues(hotel);
      return;
    }
    UIStore.setPageLoader(true);
    _timeZoneStore
      .getHotelById(Number(params.hotelId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: HotelModel) => {
        setHotel(response);
        useUpsert.setFormValues(response);
      });
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    const { latitude, longitude } = useUpsert.form.values();
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'externalId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'hotelSource',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'addressLine2',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            options: _entityOptionsStore.countries,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
          },
          {
            fieldKey: 'state',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            options: _entityOptionsStore.states,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: !Boolean(useUpsert.getField('country').value),
          },
          {
            fieldKey: 'city',
            type: EDITOR_TYPES.DROPDOWN,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            options: _entityOptionsStore.cities,
            isServerSideSearch: true,
            isLoading: useUpsert.loader.isLoading,
            isDisabled: !Boolean(useUpsert.getField('state').value),
          },
          {
            fieldKey: 'zipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'localPhoneNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'faxNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'reservationEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'frontDeskEmail',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'website',
            type: EDITOR_TYPES.LINK,
          },
          {
            fieldKey: 'latitude',
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isInputCustomLabel: true,
            tooltipText: latitudeDMS(latitude, longitude),
          },
          {
            fieldKey: 'longitude',
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isInputCustomLabel: true,
            tooltipText: longitudeDMS(latitude, longitude),
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

  const upsertHotel = (): void => {
    const model = new HotelModel({
      ...hotel,
      ...useUpsert.form.values(),
    });
    UIStore.setPageLoader(true);
    _timeZoneStore
      .upsertHotel(model.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: HotelModel) => {
          setHotel(response);
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
        },
        error: error => useUpsert.showAlert(error.message, 'upsertEvent'),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertHotel();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode, VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(hotel);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink);
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'country':
        if (!Boolean(value)) {
          _entityOptionsStore.states = [];
          _entityOptionsStore.cities = [];
          useUpsert.clearFormFields([ 'state', 'city' ]);
        }
        break;
      case 'state':
        if (!Boolean(value)) {
          _entityOptionsStore.cities = [];
          useUpsert.clearFormFields([ 'city' ]);
        }
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
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
    if (fieldKey === 'state') {
      const countryId: number = useUpsert.getField('country').value?.entityId;
      return [{ propertyName: 'Country.CountryId', propertyValue: countryId }];
    }
    const stateId: number[] = useUpsert.getField('state').value?.entityId;
    return [{ propertyName: 'State.StateId', propertyValue: stateId }];
  };

  const onSearch = (searchValue: string, fieldKey: string, searchEntityType: SEARCH_ENTITY_TYPE): void => {
    if (!searchValue.length) {
      _entityOptionsStore.countries = [];
      _entityOptionsStore.states = [];
      _entityOptionsStore.cities = [];
      return;
    }
    switch (fieldKey) {
      case 'country':
        const countryRequest = useUpsert.getSearchRequest(searchValue, searchEntityType);
        useUpsert.observeSearch(_entityOptionsStore.searchEntity(searchEntityType, countryRequest));
        break;
      case 'state':
      case 'city':
        const request = useUpsert.getSearchRequest(searchValue, searchEntityType, [ ...searchFilters(fieldKey) ]);
        useUpsert.observeSearch(_entityOptionsStore.searchEntity(searchEntityType, request));
        break;
    }
  };

  const disableAction = () => {
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading;
    }
    return useUpsert.isActionDisabled;
  };

  /* istanbul ignore next */
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavLink={backNavLink}
        backNavTitle="Hotels"
        disableActions={disableAction()}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={geographicModuleSecurity.isEditable}
        onAction={action => onAction(action)}
      />
    );
  };

  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = editingGrid.filter(a => !Utilities.isEqual(a, girdName));
    if (isEditing) {
      editingGrid.push(girdName);
      return;
    }
    setEditingGrid(_editingGrids);
  };

  const updateAirportInfo = (airportInfo: HotelAirportModel[]): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, airports: airportInfo });
    setDataUpdate(true);
  };

  const { airports } = useUpsert.form.values();

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.loader.isLoading}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onFocus={onFocus}
          onSearch={onSearch}
        />
        <AirportGrid
          key={`airport-${useUpsert.isEditable}`}
          isEditable={useUpsert.isEditable || !useUpsert.isDetailView}
          airports={airports}
          onDataSave={airportInfo => updateAirportInfo(airportInfo)}
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
)(observer(UpsertHotel));
