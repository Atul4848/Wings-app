import {
  CityModel,
  CountryModel,
  StateModel,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AirportAddressModel,
  airportBasePath,
  AirportManagementModel,
  AirportModel,
  AirportStore,
  updateAirportSidebarOptions,
  useAirportModuleSecurity,
} from '../../../Shared';
import { fields } from './Fields';
import { useStyles } from './Ownership.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, map, takeUntil } from 'rxjs/operators';
import {
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  IOptionValue,
  IAPIGridRequest,
  IAPISearchFilter,
  GRID_ACTIONS,
} from '@wings-shared/core';
import {
  ConfirmNavigate,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  Collapsable,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const Ownership: FC<Props> = ({ airportStore, sidebarStore }) => {
  const backNavLink: string = '/airports';
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();

  const [ managerState, setManagerState ] = useState<StateModel[]>([]);
  const [ ownerState, setOwnerState ] = useState<StateModel[]>([]);
  const [ managerCity, setManagerCity ] = useState<CityModel[]>([]);
  const [ ownerCity, setOwnerCity ] = useState<CityModel[]>([]);
  const [ cityErrorMap, setCityErrorMap ] = useState(new Map<string, string>());

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    useUpsert.setViewMode((viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Ownership / Management', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    loadInitialData();
    validateCity();
  }, []);

  const loadInitialData = (): void => {
    useUpsert.setFormValues(_selectedAirport?.airportManagement);
    _airportStore.getCountries();
    const { airportManagement } = _selectedAirport;
    if (airportManagement?.airportManagerAddress?.country?.id) {
      loadStates('airportManagerAddress.country');
    }
    if (airportManagement?.airportOwnerAddress?.country?.id) {
      loadStates('airportOwnerAddress.country');
    }
  };

  /* istanbul ignore next */
  const disableSaveButton = (): boolean => {
    return (
      useUpsert.form.hasError ||
      UIStore.pageLoading ||
      !useUpsert.form.changed ||
      [ ...cityErrorMap.values() ].some(v => v)
    );
  };

  const isManagerCountrySelected = (): boolean => {
    const { value } = useUpsert.getField('airportManagerAddress.country');
    return Boolean((value as CountryModel)?.id);
  };

  const isOwnerCountrySelected = (): boolean => {
    const { value } = useUpsert.getField('airportOwnerAddress.country');
    return Boolean((value as CountryModel)?.id);
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'Airport Manager',
        inputControls: [
          {
            fieldKey: 'airportManagerName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportManagerAddress.email',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportManagerAddress.phone',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportManagerAddress.country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'airportManagerAddress.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: managerState,
            isDisabled: !isManagerCountrySelected(),
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'airportManagerAddress.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: managerCity,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !isManagerCountrySelected(),
            getOptionLabel: city => (city as CityModel)?.label,
            customErrorMessage: cityErrorMap.get('airportManagerAddress.city'),
          },
          {
            fieldKey: 'airportManagerAddress.addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 2,
          },
          {
            fieldKey: 'airportManagerAddress.addressLine2',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 2,
          },
          {
            fieldKey: 'airportManagerAddress.zipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Airport Owner',
        inputControls: [
          {
            fieldKey: 'airportOwnerName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportOwnerAddress.email',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportOwnerAddress.phone',
            type: EDITOR_TYPES.TEXT_FIELD,
          },

          {
            fieldKey: 'airportOwnerAddress.country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'airportOwnerAddress.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: ownerState,
            isDisabled: !isOwnerCountrySelected(),
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'airportOwnerAddress.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: ownerCity,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !isOwnerCountrySelected(),
            getOptionLabel: city => (city as CityModel)?.label,
            customErrorMessage: cityErrorMap.get('airportOwnerAddress.city'),
          },
          {
            fieldKey: 'airportOwnerAddress.addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 2,
          },
          {
            fieldKey: 'airportOwnerAddress.addressLine2',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 2,
          },
          {
            fieldKey: 'airportOwnerAddress.zipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
    ];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'airportManagerAddress.country':
        // clear countries
        if (!value) {
          _airportStore.countries = [];
        }
        setManagerCity([]);
        setManagerState([]);
        useUpsert.clearFormFields([ 'airportManagerAddress.city', 'airportManagerAddress.state' ]);
        loadStates(fieldKey);
        break;
      case 'airportOwnerAddress.country':
        // clear countries
        if (!value) {
          _airportStore.countries = [];
        }
        setOwnerCity([]);
        setOwnerState([]);
        useUpsert.clearFormFields([ 'airportOwnerAddress.city', 'airportOwnerAddress.state' ]);
        loadStates(fieldKey);
        break;
      case 'airportManagerAddress.state':
        _airportStore.cities = [];
        useUpsert.clearFormFields([ 'airportManagerAddress.city' ]);
        break;
      case 'airportOwnerAddress.state':
        _airportStore.cities = [];
        useUpsert.clearFormFields([ 'airportOwnerAddress.city' ]);
        break;
      case 'airportOwnerAddress.city':
      case 'airportManagerAddress.city':
        validateCity();
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string, entityType: SEARCH_ENTITY_TYPE): void => {
    switch (entityType) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        if (!searchValue) {
          _airportStore.countries = [];
          return;
        }
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, entityType);
        useUpsert.observeSearch(_airportStore.getCountries(countryRequest));
        break;
      case SEARCH_ENTITY_TYPE.CITY:
        loadCities(searchValue, fieldKey);
        break;
    }
  };

  // implemented as per 92638
  /* istanbul ignore next */
  const validateCity = (): void => {
    const { appliedAirportUsageType } = _selectedAirport;
    const { airportManagerAddress, airportOwnerAddress } = useUpsert.form.values();
    const cityFields = [ 'airportManagerAddress.city', 'airportOwnerAddress.city' ];
    const errorMessage = 'Please select City having CAPPS Code.';
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    if (!hasOperationalAirport || !airportManagerAddress?.city || !airportOwnerAddress?.city) {
      cityFields.forEach(key => setCityErrorMap(new Map(cityErrorMap.set(key, ''))));
    }
    if (hasOperationalAirport && Boolean(airportManagerAddress?.city?.id)) {
      setCityErrorMap(
        new Map(cityErrorMap.set(cityFields[0], !Boolean(airportManagerAddress?.city?.cappsCode) ? errorMessage : ''))
      );
    }
    if (hasOperationalAirport && Boolean(airportOwnerAddress?.city?.id)) {
      setCityErrorMap(
        new Map(cityErrorMap.set(cityFields[1], !Boolean(airportOwnerAddress?.city?.cappsCode) ? errorMessage : ''))
      );
    }
  };

  /* istanbul ignore next */
  // load cities based on state or country
  const loadCities = (searchValue: string, fieldKey: string): void => {
    const { appliedAirportUsageType } = _selectedAirport;
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    const [ prefix ] = fieldKey.split('.');
    const isOwner = prefix === 'airportOwnerAddress';
    const countryId: number = useUpsert.getField(`${prefix}.country`).value?.id;
    if (!countryId || !searchValue) {
      _airportStore.cities = [];
      return;
    }
    const stateId: number = useUpsert.getField(`${prefix}.state`).value?.id;
    const filters = stateId
      ? Utilities.getFilter('State.StateId', stateId)
      : Utilities.getFilter('Country.CountryId', countryId);
    const notEqualFilter: IAPISearchFilter = {
      propertyName: 'CAPPSCode',
      operator: 'and',
      propertyValue: null,
      filterType: 'ne',
    };
    const filterCollection = hasOperationalAirport ? [ filters, notEqualFilter ] : [ filters ];
    const cityRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.CITY, filterCollection);
    useUpsert.observeSearch(
      _airportStore.searchCities({ searchValue, stateId, countryId }, true, true).pipe(
        map(results =>
          results.map(city => {
            // need to do this for map state capss code in
            return new CityModel({
              ...city,
              state: _airportStore.states.find(state => state.id == city.state?.id),
            });
          })
        ),
        tapWithAction(response => {
          if (isOwner) {
            setOwnerCity(response);
            return;
          }
          setManagerCity(response);
        })
      )
    );
  };

  const loadStates = (fieldKey: string): void => {
    const [ prefix ] = fieldKey.split('.');
    const isOwner = prefix === 'airportOwnerAddress';
    const countryId: string = useUpsert.getField(`${prefix}.country`).value?.id;
    if (!countryId) {
      _airportStore.states = [];
      return;
    }
    const notEqualFilter: IAPISearchFilter = {
      propertyName: 'CappsCode',
      operator: 'and',
      propertyValue: null,
      filterType: 'ne',
    };
    const stateFilters = Utilities.getFilter('Country.CountryId', countryId);
    const stateRequest = useUpsert.getFilterRequest(SEARCH_ENTITY_TYPE.STATE, [ stateFilters, notEqualFilter ]);
    useUpsert.observeSearch(
      _airportStore.getStates(stateRequest).pipe(
        tapWithAction(response => {
          if (isOwner) {
            setOwnerState(response.results);
            return;
          }
          setManagerState(response.results);
        })
      )
    );
  };

  const upsertAirportManagement = (): void => {
    const { airportManagerAddress, airportOwnerAddress, ...rest } = useUpsert.form.values();
    const request = new AirportManagementModel({
      ..._selectedAirport.airportManagement,
      ...rest,
      airportManagerAddress: new AirportAddressModel({
        ..._selectedAirport.airportManagement.airportManagerAddress,
        ...airportManagerAddress,
      }),
      airportOwnerAddress: new AirportAddressModel({
        ..._selectedAirport.airportManagement.airportOwnerAddress,
        ...airportOwnerAddress,
      }),
      airportId: Number(params.airportId),
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirportManagementInfo(request.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore.setSelectedAirport({
            ..._selectedAirport,
            airportManagement: response,
          });
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirportManagement();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_selectedAirport?.airportManagement);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink, useUpsert.noBlocker);
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport.title}
        backNavLink={backNavLink}
        backNavTitle="Airports"
        disableActions={disableSaveButton()}
        isEditMode={useUpsert.isEditable}
        isActive={_selectedAirport.isActive}
        hasEditPermission={airportModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
        <div className={classes.flexRow}>
          {groupInputControls().map(groupInputControl => {
            return (
              <Collapsable key={groupInputControl.title} title={groupInputControl.title}>
                <div className={classes.flexWrap}>
                  {groupInputControl.inputControls
                    .filter(inputControl => !inputControl.isHidden)
                    .map((inputControl: IViewInputControl, index: number) => {
                      return (
                        <ViewInputControl
                          {...inputControl}
                          key={index}
                          customErrorMessage={inputControl.customErrorMessage}
                          field={useUpsert.getField(inputControl.fieldKey || '')}
                          isEditable={useUpsert.isEditable}
                          isExists={inputControl.isExists}
                          classes={{
                            flexRow: classes.inputControl,
                          }}
                          onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                          onSearch={(searchValue: string, fieldKey: string, entityType: SEARCH_ENTITY_TYPE) =>
                            onSearch(
                              searchValue,
                              inputControl.fieldKey || '',
                              inputControl.searchEntityType as SEARCH_ENTITY_TYPE
                            )
                          }
                        />
                      );
                    })}
                </div>
              </Collapsable>
            );
          })}
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('airportStore', 'sidebarStore')(observer(Ownership));
