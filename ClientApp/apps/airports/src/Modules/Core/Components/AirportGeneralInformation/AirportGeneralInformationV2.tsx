import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Field } from 'mobx-react-form';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import {
  AirportModel,
  AirportRunwayModel,
  AirportSettingsStore,
  AirportStore,
  EntityMapStore,
  UOMValueModel,
  updateAirportSidebarOptions,
  useAirportModuleSecurity,
} from '../../../Shared';
import { fields } from './Fields';
import { AxiosError } from 'axios';
import {
  Coordinate,
  IAPIGridRequest,
  IOptionValue,
  MODEL_STATUS,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  ViewPermission,
  EntityMapModel,
  GRID_ACTIONS,
  shouldNotNullFilter,
} from '@wings-shared/core';
import {
  AuditFields,
  EDITOR_TYPES,
  ViewInputControlsGroup,
  IViewInputControl,
  IGroupInputControls,
} from '@wings-shared/form-controls';
import {
  CustomActionLabel,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  ConfirmNavigate,
  SidebarStore,
} from '@wings-shared/layout';
import { observable } from 'mobx';
import airportHelper from './AirportHelper';
import { AlertStore } from '@uvgo-shared/alert';
import { MapBoxView } from '@wings-shared/mapbox';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useNavigate, useParams } from 'react-router';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuthStore, Logger } from '@wings-shared/security';
import { useStyles } from './AirportGeneralInformation.styles';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { IMarker } from '@wings-shared/mapbox/dist/Interfaces';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import IcaoUwaCodeEditor from './IcaoUwaCodeEditor/IcaoUwaCodeEditorV2';
import AirportLocationIcon from '@material-ui/icons/LocationOnOutlined';
import ConfirmDeactivateDialog from './ConfirmDeactivateDialog/ConfirmDeactivateDialog';
import { CityModel, ModelStatusOptions, StateModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  entityMapStore?: EntityMapStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportGeneralInformation: FC<Props> = ({ ...props }) => {
  const backNavLink: string = '/airports';
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = props.airportStore as AirportStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _entityMapStore = props.entityMapStore as EntityMapStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const _useConfirmDialog = useConfirmDialog();
  const { isEditable, isRefDataSystemAdmin } = useAirportModuleSecurity();

  const isNewAirport = !Utilities.getNumberOrNullValue(params?.airportId);
  const isActive = Utilities.isEqual(useUpsert.getField('status').value?.label, 'active');
  const title = _selectedAirport?.title || '';
  const validateAirport = observable({
    hasICAOCode: Boolean(useUpsert.getField('icaoCode').value?.id),
    hasUWACode: Boolean(useUpsert.getField('uwaAirportCode').value?.id),
    hasRegionalCode: Boolean(useUpsert.getField('regionalAirportCode').value?.id),
    isCountrySelected: Boolean(useUpsert.getField('airportLocation.country').value?.id),
    hasDistanceToDowntownValue: Boolean(useUpsert.getField('airportLocation.distanceToDowntown.value').value),
  });

  const [ airportsDetails, setAirportsDetails ] = useState<AirportModel>(new AirportModel());
  const [ runways, setRunways ] = useState<AirportRunwayModel[]>([]);
  const [ codeErrorsMap, setCodeErrorsMap ] = useState<Map<string, string>>(new Map());
  const [ cityErrorMap, setCityErrorMap ] = useState(new Map<string, string>());

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    _sidebarStore.setNavLinks(
      updateAirportSidebarOptions(
        '',
        !Boolean(params.airportId),
        '',
        !Boolean(_selectedAirport?.customs?.customsDetailId)
      ),
      airportBasePath()
    );

    loadAirport();
    // load airports while editing to check duplicate records
    if (params.airportId && useUpsert.isEditable) {
      loadStates();
      loadAirportsToValidateNames();
    }

    setAppliedAirportUsageType();
    validateCity();
    return () => {
      _airportSettingStore.ICAOCodes = [];
      _airportStore.airports = [];
      _airportStore.cities = [];
      _airportStore.countries = [];
    };
  }, []);

  const airportBasePath = () => {
    const { airportId, icao, viewMode } = params;
    return airportId ? `/airports/upsert/${airportId}/${icao}/${viewMode}` : '/airports/upsert/new';
  };

  /* istanbul ignore next */
  // If created with code 77682 #4
  const isCreatedWithCode = (): boolean => {
    if (!airportsDetails) {
      return false;
    }
    const { icaoCode, uwaAirportCode, regionalAirportCode } = airportsDetails;
    return Boolean(icaoCode?.label || uwaAirportCode?.label || regionalAirportCode?.label);
  };

  /* istanbul ignore next */
  const isMilitaryUseTypeEnabled = (): boolean => {
    const { value } = useUpsert.getField('appliedAirportType');
    return Boolean((value as EntityMapModel)?.entityId)
      ? !Boolean(Utilities.isEqual(value?.name, 'Joint') || Utilities.isEqual(value?.name, 'Military'))
      : true;
  };

  /* istanbul ignore next */
  const disableSaveButton = (): boolean => {
    return (
      useUpsert.form.hasError ||
      UIStore.pageLoading ||
      !useUpsert.form.changed ||
      useUpsert.hasDuplicateValue ||
      [ ...codeErrorsMap.values() ].some(v => Boolean(v)) ||
      [ ...cityErrorMap.values() ].some(v => Boolean(v))
    );
  };

  /* istanbul ignore next */
  // if airport include retail
  const hasRetailUsageType = (): boolean => {
    const usageType = useUpsert.getField('appliedAirportUsageType').value;
    return Array.isArray(usageType) ? usageType.some(x => Utilities.isEqual(x?.name, 'Retail')) : false;
  };

  /* istanbul ignore next */
  // implemented as per 71942
  const isOnlyRetailAirport = (): boolean => {
    const usageType = useUpsert.getField('appliedAirportUsageType').value;
    return Utilities.isEqual(usageType.length, 1) && Utilities.isEqual(usageType[0].name, 'Retail');
  };

  /* istanbul ignore next */
  const isOnlyOperationalAirport = (): boolean => {
    const usageType = useUpsert.getField('appliedAirportUsageType').value;
    return Utilities.isEqual(usageType.length, 1) && Utilities.isEqual(usageType[0].name, 'Operational');
  };

  /* istanbul ignore next */
  const hasCodeValue = (): boolean => {
    return airportHelper.codeFields.some(x => {
      const _value = useUpsert.getField(x)?.value;
      if (typeof _value === 'object') {
        return Boolean(_value?.label);
      }
      return Boolean(_value);
    });
  };

  /* istanbul ignore next */
  const airportCodes = (updatedAirport): string => {
    return (
      updatedAirport.displayCode ||
      updatedAirport.icaoCode?.label ||
      updatedAirport.uwaCode ||
      updatedAirport.regionalCode ||
      updatedAirport.iataCode ||
      updatedAirport.faaCode
    );
  };

  /* istanbul ignore next */
  // implemented as per 81193
  const shouldClearRetailFields = (): boolean => {
    if (!params?.airportId) {
      return true;
    }
    const { sourceLocationId, airportDataSource } = airportsDetails;
    return !Boolean(airportDataSource && sourceLocationId);
  };

  /* istanbul ignore next */
  // implemented as per 78352
  const disableDataSourceAndLocationId = (): boolean => {
    if (!airportsDetails) {
      return false;
    }
    return Boolean(airportsDetails.sourceLocationId) || !hasRetailUsageType();
  };

  /* istanbul ignore next */
  const loadAirport = (): void => {
    const _airport = _selectedAirport ? _selectedAirport : new AirportModel();
    setAirportsDetails(_airport);
    useUpsert.setFormValues(_airport);
    validateInputFields();
    useUpsert.observeSearch(_airportSettingStore.loadDistanceUOMs().pipe(tap(() => setUOMsOption())));
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'icaoCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.ICAOCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.ICAO_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit ICAO Code"
                label={useUpsert.getFieldLabel(field.key)}
                hideIcon={isNewAirport || hasRetailUsageType() || !isCreatedWithCode()}
                onAction={() => confirmEditAirportCode(field)}
              />
            ),
            isDisabled: isNewAirport
              ? validateAirport.hasUWACode || validateAirport.hasRegionalCode
              : isCreatedWithCode() || validateAirport.hasUWACode || validateAirport.hasRegionalCode,
            customErrorMessage: codeErrorsMap.get('icaoCode'),
            isServerSideSearch: true,
          },
          {
            fieldKey: 'uwaAirportCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.uwaCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.UWA_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit UWA Code"
                label={useUpsert.getFieldLabel(field.key)}
                hideIcon={isNewAirport || validateAirport.hasICAOCode || hasRetailUsageType() || !isCreatedWithCode()}
                onAction={() => confirmEditAirportCode(field)}
              />
            ),
            isDisabled: isNewAirport
              ? validateAirport.hasICAOCode || validateAirport.hasRegionalCode
              : isCreatedWithCode() || validateAirport.hasICAOCode || validateAirport.hasRegionalCode,
            customErrorMessage: codeErrorsMap.get('uwaAirportCode'),
            isServerSideSearch: true,
          },
          {
            fieldKey: 'iataCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: codeErrorsMap.get('iataCode'),
          },
          {
            fieldKey: 'regionalAirportCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.regionalCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.REGIONAL_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit Regional Code"
                label={useUpsert.getFieldLabel(field.key)}
                hideIcon={isNewAirport || validateAirport.hasICAOCode || hasRetailUsageType() || !isCreatedWithCode()}
                onAction={() => confirmEditAirportCode(field)}
              />
            ),
            isDisabled: isNewAirport
              ? validateAirport.hasICAOCode || validateAirport.hasUWACode
              : validateAirport.hasICAOCode || validateAirport.hasUWACode || isCreatedWithCode(),
            customErrorMessage: codeErrorsMap.get('regionalAirportCode'),
            isServerSideSearch: true,
          },
          {
            fieldKey: 'faaCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: codeErrorsMap.get('faaCode'),
          },
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('name')
              ? 'The Name already exists for the selected Country and City/Closest City.'
              : '',
          },
          {
            fieldKey: 'appliedAirportUsageType',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _entityMapStore.usageTypes,
            getChipDisabled: option => Utilities.isEqual(option?.label, 'Retail') && useUpsert.isAddNew,
          },
          {
            fieldKey: 'appliedAirportType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityMapStore.airportTypes,
          },
          {
            fieldKey: 'militaryUseType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.militaryUseType,
            isDisabled: isMilitaryUseTypeEnabled(),
          },
          {
            fieldKey: 'airportFacilityType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportFacilityTypes,
          },
          {
            fieldKey: 'airportFacilityAccessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportFacilityAccessLevels,
          },
          {
            fieldKey: 'cappsAirportName',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('cappsAirportName')
              ? 'The CAPPS Airport Name already exists for the selected Country and City/Closest City.'
              : '',
          },
          {
            fieldKey: 'airportOfEntry',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportOfEntry,
          },
          {
            fieldKey: 'isTopUsageAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'primaryRunway',
            type: EDITOR_TYPES.DROPDOWN,
            options: runways.filter(a => a.status?.name === 'Active'),
          },
        ],
      },
      {
        title: 'Retail Information:',
        inputControls: [
          {
            fieldKey: 'airportDataSource',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: isRefDataSystemAdmin ? false : disableDataSourceAndLocationId(),
            options: _airportSettingStore.airportDataSources,
          },
          {
            fieldKey: 'sourceLocationId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: disableDataSourceAndLocationId(),
            customErrorMessage: codeErrorsMap.get('sourceLocationId'),
          },
        ],
      },
      {
        title: 'Location Details:',
        inputControls: [
          {
            fieldKey: 'airportLocation.country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            isServerSideSearch: true,
          },
          {
            fieldKey: 'airportLocation.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.states,
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            isDisabled: !validateAirport.isCountrySelected,
            getOptionLabel: state => (state as StateModel)?.label,
            isServerSideSearch: true,
          },
          {
            fieldKey: 'airportLocation.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.cities,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !validateAirport.isCountrySelected,
            getOptionLabel: city => (city as CityModel)?.labelWithState,
            customErrorMessage: cityErrorMap.get('airportLocation.city'),
            isServerSideSearch: true,
          },
          {
            fieldKey: 'airportLocation.closestCity',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.cities,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !validateAirport.isCountrySelected,
            getOptionLabel: city => (city as CityModel)?.labelWithState,
            customErrorMessage: cityErrorMap.get('airportLocation.closestCity'),
          },
          {
            fieldKey: 'airportLocation.island',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportStore.islands,
            searchEntityType: SEARCH_ENTITY_TYPE.ISLAND,
            isDisabled: !validateAirport.isCountrySelected,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'latitudeCoordinate.latitude',
            coordinate: Coordinate.LAT,
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isLatLongEditor: true,
            isInputCustomLabel: true,
            subFields: airportHelper.latValues(),
            tooltipText: airportsDetails?.latitudeCoordinate?.coordinate.label,
          },
          {
            fieldKey: 'longitudeCoordinate.longitude',
            coordinate: Coordinate.LONG,
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isLatLongEditor: true,
            isInputCustomLabel: true,
            subFields: airportHelper.longValues(),
            tooltipText: airportsDetails?.longitudeCoordinate?.coordinate.label,
          },
          {
            fieldKey: 'airportLocation.magneticVariation',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportLocation.distanceToDowntown.value',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportLocation.distanceUOM',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: true,
            options: _airportSettingStore.distanceUOMs,
            getOptionDisabled: options => !Utilities.isEqual(options.label, 'miles'),
          },
          {
            fieldKey: 'airportLocation.airportDirection',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: !validateAirport.hasDistanceToDowntownValue,
            options: _airportSettingStore.airportDirections,
          },
          {
            fieldKey: 'airportLocation.elevation.value',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportLocation.elevationUOM',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: true,
            getOptionDisabled: options => !Utilities.isEqual(options.label, 'feet'),
            options: _airportSettingStore.distanceUOMs,
          },
        ],
      },
      {
        title: 'Other Details:',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.accessLevels,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: true,
            options: ModelStatusOptions,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.sourceTypes,
          },
        ],
      },
      {
        title: '',
        inputControlClassName: classes?.inactiveReason,
        inputControls: [
          {
            fieldKey: 'inactiveReason',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isActive,
            isDisabled: true,
            multiline: true,
            rows: 2,
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const setAppliedAirportUsageType = (): void => {
    if (hasRetailUsageType()) {
      return;
    }
    useUpsert.observeSearch(
      _entityMapStore.getUsageTypes().pipe(
        tapWithAction(response => {
          const _usageType = useUpsert.getField('appliedAirportUsageType').value;
          const _retailUsage = response.find(x => Utilities.isEqual(x.name, 'Retail'));
          _usageType.push(_retailUsage);
          useUpsert.getField('appliedAirportUsageType').set(_usageType);
        })
      )
    );
  };

  /* istanbul ignore next */
  const confirmEditAirportCode = (field: Field): void => {
    _useConfirmDialog.confirmAction(() => openCodeEditor(field), {
      title: 'Confirm Edit',
      message: `Are you sure you want to edit this ${useUpsert.getFieldLabel(field.key)}?`,
    });
  };

  /* istanbul ignore next */
  // editor for Editing UWA code and ICAO code 62978
  const openCodeEditor = (field: Field): void => {
    const inputControl = groupInputControls()[0].inputControls.find(({ fieldKey }) =>
      Utilities.isEqual(fieldKey || '', field?.key)
    ) as IViewInputControl;

    ModalStore.open(
      <IcaoUwaCodeEditor
        inputControl={inputControl}
        field={field}
        airportId={Number(params?.airportId)}
        airportStore={_airportStore}
        airportSettingsStore={_airportSettingStore}
        onSaveSuccess={updatedAirport => {
          const airportModel = new AirportModel({
            ...updatedAirport,
            timezoneInformation: airportsDetails?.timezoneInformation,
          });
          _airportStore.setSelectedAirport(airportModel);
          setAirportsDetails(airportModel);
          useUpsert.form.reset();
          useUpsert.setFormValues(updatedAirport);
        }}
      />
    );
  };

  /* istanbul ignore next */
  const setUOMsOption = (): void => {
    const milesOption = _airportSettingStore.distanceUOMs.find(uom => Utilities.isEqual(uom.label, 'miles'));
    useUpsert.getField('airportLocation.distanceUOM').set(milesOption);
    const feetOption = _airportSettingStore.distanceUOMs.find(uom => Utilities.isEqual(uom.label, 'feet'));
    useUpsert.getField('airportLocation.elevationUOM').set(feetOption);
  };

  /* istanbul ignore next */
  // load cities based on state or country
  const loadCities = (searchValue: string): void => {
    const countryId: number = useUpsert.getField('airportLocation.country').value?.id;
    if (!countryId || !searchValue) {
      _airportStore.cities = [];
      return;
    }
    const stateId: number = useUpsert.getField('airportLocation.state').value?.id;
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
        tapWithAction(response => (_airportStore.cities = response))
      )
    );
  };

  /* istanbul ignore next */
  // load cities based on state or country
  const loadStates = (): void => {
    const countryId: string = useUpsert.getField('airportLocation.country').value?.id;
    if (!countryId) {
      _airportStore.states = [];
      return;
    }
    const stateRequest = useUpsert.getFilterRequest(SEARCH_ENTITY_TYPE.STATE, [
      Utilities.getFilter('Country.CountryId', countryId),
      shouldNotNullFilter('CappsCode'),
    ]);
    useUpsert.observeSearch(_airportStore.getStates(stateRequest));
  };

  // implemented as per 92638
  /* istanbul ignore next */
  const validateCity = (): void => {
    const { appliedAirportUsageType, airportLocation } = useUpsert.form.values();
    const cityFields = [ 'airportLocation.city', 'airportLocation.closestCity' ];
    const errorMessage = 'Please select City having CAPPS Code.';
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    if (!hasOperationalAirport) {
      cityFields.forEach(key => setCodeErrorsMap(new Map(codeErrorsMap.set(key, ''))));
    }
    if (hasOperationalAirport && airportLocation.city) {
      setCityErrorMap(
        new Map(cityErrorMap.set(cityFields[0], !Boolean(airportLocation.city.cappsCode) ? errorMessage : ''))
      );
    }
    if (hasOperationalAirport && airportLocation.closestCity) {
      cityErrorMap.set(cityFields[1], !Boolean(airportLocation.closestCity.cappsCode) ? errorMessage : '');
      setCityErrorMap(
        //eslint-disable-next-line max-len
        new Map(cityErrorMap.set(cityFields[1], !Boolean(airportLocation.closestCity.cappsCode) ? errorMessage : ''))
      );
    }
  };

  /* istanbul ignore next */
  // Validate Airport Name 55772
  const validateAirportName = (): void => {
    const cityId: string = useUpsert.getField('airportLocation.city').value?.id;
    const closestCityId: string = useUpsert.getField('airportLocation.closestCity').value?.id;
    [ 'name', 'cappsAirportName' ].forEach(columnName => {
      const isExists = _airportStore.airports.some(airport => {
        const isNameMatch = Utilities.isEqual(airport[columnName], useUpsert.getField(columnName).value);
        if (!isNameMatch) {
          return false;
        }
        const city = airport.airportLocation?.city?.id
          ? airport.airportLocation?.city
          : airport.airportLocation?.closestCity;

        return Utilities.isEqual(city?.id, cityId || closestCityId);
      });
      useUpsert.isAlreadyExistMap.set(columnName, isExists);
    });
  };

  // Auto populate state from selected city 61569
  /* istanbul ignore next */
  const populateState = (city: CityModel, fieldKey: string): void => {
    const stateId = useUpsert.getField('airportLocation.state').value?.id;
    if (!city || !city.state?.id || stateId) {
      return;
    }
    // needs to filter state to get cappsCode
    const state = _airportStore.states.find(_state => _state.id === city.state?.id);
    useUpsert.getField('airportLocation.state').set(state);
    _airportStore.cities = _airportStore.cities.filter(_city => _city.state?.id === city.state?.id);

    // clear dropdown if
    const key = fieldKey === 'airportLocation.closestCity' ? 'airportLocation.city' : 'airportLocation.closestCity';
    useUpsert.getField(key).clear();
  };

  /* istanbul ignore next */
  // Validate Airport Codes 75700
  // Validate Airport icaoCode uwaCode and iataCode
  const validateAirportFields = (fieldKey): void => {
    const _values = useUpsert.form.values();
    const { iataCode, faaCode, sourceLocationId } = _values;
    switch (fieldKey) {
      case 'iataCode':
        if (iataCode?.length !== 3) {
          return;
        }
        break;
      case 'faaCode':
        if (faaCode?.length < 3 || faaCode?.length > 5) {
          return;
        }
        break;
      case 'sourceLocationId':
        if (sourceLocationId.length < 8 || sourceLocationId.length > 11) {
          return;
        }
        break;
    }
    UIStore.setPageLoader(true);
    _airportStore
      .validateAirportCodes(_values, params.airportId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ errors }) => {
        airportHelper.codeFields.concat('sourceLocationId').forEach(key => {
          const message = errors.find(x => Utilities.isEqual(x.propertyName, key))?.errorMessage;
          setCodeErrorsMap(new Map(codeErrorsMap.set(key, message || '')));
        });
      });
  };

  /* istanbul ignore next */
  // Load Airports based on Country State and City
  const loadAirportsToValidateNames = (): void => {
    const countryId: string = useUpsert.getField('airportLocation.country').value?.id;
    const closestCityId: string = useUpsert.getField('airportLocation.closestCity').value?.id;
    const cityId: string = useUpsert.getField('airportLocation.city').value?.id;
    if (!countryId || !(cityId || closestCityId)) {
      _airportStore.airports = [];
      validateAirportName();
      return;
    }

    // validated based on city or closest city 62948
    const filterCollection = [
      Utilities.getFilter('AirportLocation.City.CityId', cityId || closestCityId),
      Utilities.getFilter('AirportLocation.ClosestCity.CityId', cityId || closestCityId, 'or'),
      { propertyName: 'AirportId', propertyValue: Number(params?.airportId), operator: 'and', filterType: 'ne' },
    ];
    useUpsert.observeSearch(
      _airportStore
        .getAirports({
          pageSize: 0,
          filterCollection: JSON.stringify(filterCollection),
          specifiedFields: baseEntitySearchFilters[SEARCH_ENTITY_TYPE.AIRPORT].specifiedFields,
        })
        .pipe(
          tapWithAction(({ results }) => {
            _airportStore.airports = results;
            validateAirportName();
          })
        )
    );
  };

  /* istanbul ignore next */
  const upsertAirport = (): void => {
    if (!hasRetailUsageType()) {
      useUpsert.showAlert('Retail Type is required in Airport Usage Type', 'upsertAirportBase');
      return;
    }

    const { airportLocation, ...otherFields } = useUpsert.form.values();
    const airport = new AirportModel({
      ...airportsDetails,
      ...otherFields,
      airportLocation: {
        ...airportsDetails?.airportLocation,
        ...airportLocation,
        distanceToDowntown: new UOMValueModel({
          ...airportsDetails?.airportLocation?.distanceToDowntown,
          ...airportLocation.distanceToDowntown,
        }),
        elevation: new UOMValueModel({
          ...airportsDetails?.airportLocation.elevation,
          ...airportLocation.elevation,
        }),
      },
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirport(airport.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: updatedAirport => {
          if (updatedAirport.errors?.length) {
            useUpsert.showAlert(updatedAirport.errors[0].errorMessage, 'upsertAirportBase');
            return;
          }
          _airportStore.setSelectedAirport({
            ...updatedAirport,
            runways: _selectedAirport?.runways,
            airportFrequencies: _selectedAirport?.airportFrequencies,
            timezoneInformation: _selectedAirport?.timezoneInformation,
            customs: _selectedAirport?.customs,
          });
          setAirportsDetails(updatedAirport);
          useUpsert.form.reset();
          useUpsert.setFormValues(updatedAirport);
          setUOMsOption();
          // if new airport then redirect to edit screen
          if (!airport.id) {
            navigate(`/airports/upsert/${updatedAirport.id}/${airportCodes(updatedAirport)}/edit`, useUpsert.noBlocker);
          }
        },
        error: error => useUpsert.showAlert(error.message, 'upsertAirportBase'),
      });
  };

  /* istanbul ignore next */
  const updateStatus = (): void => {
    ModalStore.open(
      <ConfirmDeactivateDialog
        isActive={isActive}
        onNoClick={() => ModalStore.close()}
        onYesClick={(inactiveReason: string) => {
          _airportStore
            .updateAirportStatus({
              airportId: Number(params?.airportId),
              status: isActive ? MODEL_STATUS.IN_ACTIVE : MODEL_STATUS.ACTIVE,
              inactiveReason,
            })
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe({
              next: (updatedAirport: AirportModel) => {
                ModalStore.close();
                _airportStore.setSelectedAirport({
                  ...updatedAirport,
                  runways: _selectedAirport?.runways,
                  timezoneInformation: _selectedAirport?.timezoneInformation,
                });
                setAirportsDetails(updatedAirport);
                useUpsert.form.reset();
                useUpsert.setFormValues(updatedAirport);
                setUOMsOption();
              },
              error: (error: AxiosError) => {
                AlertStore.critical(error.message);
                Logger.error(error.message);
              },
            });
        }}
      />
    );
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirport();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        loadStates();
        loadAirportsToValidateNames();
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        updateStatus();
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params?.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(airportsDetails);
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
      case 'icaoCode':
      case 'uwaAirportCode':
      case 'regionalAirportCode':
      case 'iataCode':
      case 'sourceLocationId':
        // clear dropdown
        if (!value) {
          _airportSettingStore.ICAOCodes = [];
          _airportSettingStore.uwaCodes = [];
          _airportSettingStore.regionalCodes = [];
          setCodeErrorsMap(new Map(codeErrorsMap.set(fieldKey, '')));
        }
        validateAirportFields(fieldKey);
        break;
      case 'faaCode':
        if (!value) {
          setCodeErrorsMap(new Map(codeErrorsMap.set(fieldKey, '')));
        }
        if ((value as string).length === 5) {
          useUpsert.showAlert(
            'In order to integrate to CAPPS system please provide FAA Code less than five characters',
            'upsertAirport'
          );
        }
        validateAirportFields(fieldKey);
        break;
      case 'name':
      case 'cappsAirportName':
        validateAirportName();
        break;
      case 'airportLocation.city':
      case 'airportLocation.closestCity':
        // clear cities
        if (!value) {
          _airportStore.cities = [];
        }
        populateState(value as CityModel, fieldKey);
        loadAirportsToValidateNames();
        validateCity();
        break;
      case 'airportLocation.country':
        // clear countries
        if (!value) {
          _airportStore.countries = [];
        }
        _airportStore.cities = [];
        _airportStore.states = [];
        _airportStore.islands = [];
        useUpsert.clearFormFields(airportHelper.locationFields.concat('airportLocation.state'));
        loadAirportsToValidateNames();
        loadStates();
        break;
      case 'airportLocation.state':
        _airportStore.cities = [];
        useUpsert.clearFormFields(airportHelper.locationFields);
        break;
      case 'airportLocation.distanceToDowntown.value':
        if (!value) {
          useUpsert.getField('airportLocation.airportDirection').clear();
        }
        break;
      case 'appliedAirportUsageType':
        if (useUpsert.isAddNew) {
          setAppliedAirportUsageType();
        }
        if (isOnlyOperationalAirport() && shouldClearRetailFields()) {
          useUpsert.clearFormFields([ 'airportDataSource', 'sourceLocationId' ]);
        }
        // #81193
        if (params?.airportId && hasRetailUsageType()) {
          const { sourceLocationId, airportDataSource } = airportsDetails;
          useUpsert.getField('airportDataSource').set(airportDataSource);
          useUpsert.getField('sourceLocationId').set(sourceLocationId);
        }
        validateCity();
        validateAirportFields(fieldKey);
        break;
      case 'appliedAirportType':
        // clear military types
        if (value) {
          useUpsert.getField('militaryUseType').clear();
        }
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
    // validate input fields on value change
    validateInputFields();
  };

  const validateInputFields = (): void => {
    defaultRulesForCodes();

    // validate City and Closest City
    useUpsert.setFormRules(
      'airportLocation.city',
      !Boolean(useUpsert.getField('airportLocation.closestCity').value?.id)
    );
    useUpsert.setFormRules(
      'airportLocation.closestCity',
      !Boolean(useUpsert.getField('airportLocation.city').value?.id)
    );

    // validate Distance to Downtown
    const distanceToDowntown = useUpsert.getField('airportLocation.distanceToDowntown.value').value;
    useUpsert.setFormRules('airportLocation.distanceUOM', Boolean(distanceToDowntown));

    // validate Elevation
    const elevation = useUpsert.getField('airportLocation.elevation.value').value;
    useUpsert.setFormRules('airportLocation.elevationUOM', Boolean(elevation));

    // validate airport Facility Type
    const usageType = useUpsert.getField('appliedAirportUsageType').value || [];
    useUpsert.setFormRules(
      'airportFacilityType',
      usageType.some(({ label }) => Utilities.isEqual(label, 'Retail'))
    );

    // validate fields based on selected Airport Usage Type
    setCodeFieldRules();
    setSourceFieldRules();
  };

  /* istanbul ignore next */
  // default rules for ICAO and UWA code
  const defaultRulesForCodes = (): void => {
    const { uwaAirportCode, regionalAirportCode, icaoCode, appliedAirportUsageType } = useUpsert.form.values();
    useUpsert.setFormRules('uwaAirportCode', !Boolean(icaoCode?.label || regionalAirportCode?.label));
    useUpsert.setFormRules('icaoCode', !Boolean(uwaAirportCode?.label || regionalAirportCode?.label));
    useUpsert.setFormRules(
      'regionalAirportCode',
      !Boolean(icaoCode?.label || uwaAirportCode?.label) &&
        appliedAirportUsageType?.map(x => x?.label).includes('Operational')
    );
    useUpsert.form.validate();
  };

  /* istanbul ignore next */
  // 73001 set all code rules based on Retail airport
  const setCodeFieldRules = (): void => {
    if (isOnlyRetailAirport()) {
      airportHelper.codeFields.forEach(fieldKey => useUpsert.setFormRules(fieldKey, !hasCodeValue()));
      useUpsert.form.validate();
      return;
    }
    airportHelper.codeFields.forEach(fieldKey => useUpsert.setFormRules(fieldKey, false));
    defaultRulesForCodes();
  };

  /* istanbul ignore next */
  // set rules for DataSource and SourceLocationId based on Operational airport
  const setSourceFieldRules = (): void => {
    useUpsert.setFormRules('airportDataSource', !isOnlyOperationalAirport());
    useUpsert.setFormRules('sourceLocationId', !isOnlyOperationalAirport());
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string, entityType: SEARCH_ENTITY_TYPE): void => {
    const request = {
      filterCollection: JSON.stringify([{ statusId: MODEL_STATUS.ACTIVE }]),
    };
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
        loadCities(searchValue);
        break;
      case SEARCH_ENTITY_TYPE.ICAO_CODE:
        useUpsert.observeSearch(_airportSettingStore.searchIcaoCode(searchValue));
        break;
      case SEARCH_ENTITY_TYPE.UWA_CODE:
        if (!Boolean(searchValue)) {
          _airportSettingStore.uwaCodes = [];
          return;
        }
        useUpsert.observeSearch(
          _airportSettingStore.loadUwaCodes(request).pipe(
            tapWithAction(response => {
              const _codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              _airportSettingStore.uwaCodes = _codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
      case SEARCH_ENTITY_TYPE.REGIONAL_CODE:
        if (!Boolean(searchValue)) {
          _airportSettingStore.regionalCodes = [];
          return;
        }
        useUpsert.observeSearch(
          _airportSettingStore.loadRegionalCodes(request).pipe(
            tapWithAction(response => {
              const codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              _airportSettingStore.regionalCodes = codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    const countryId: string = useUpsert.getField('airportLocation.country').value?.id;
    switch (fieldKey) {
      case 'island':
        if (!countryId) {
          _airportStore.islands = [];
          return;
        }
        const isLandFilters = [ Utilities.getFilter('Country.CountryId', countryId) ];
        const isLandRequest = useUpsert.getFilterRequest(SEARCH_ENTITY_TYPE.ISLAND, isLandFilters);
        useUpsert.observeSearch(_airportStore.getIslands(isLandRequest));
        break;
      case 'airportFacilityType':
        useUpsert.observeSearch(_airportSettingStore.loadAirportFacilityTypes());
        break;
      case 'airportFacilityAccessLevel':
        useUpsert.observeSearch(_airportSettingStore.loadAirportFacilityAccessLevels());
        break;
      case 'airportOfEntry':
        useUpsert.observeSearch(_airportSettingStore.loadAirportOfEntries());
        break;
      case 'primaryRunway':
        useUpsert.observeSearch(
          _airportStore
            .getRunways(Number(params.airportId) || 0)
            .pipe(tapWithAction((response: AirportRunwayModel[]) => setRunways(response)))
        );
        break;
      case 'airportDataSource':
        useUpsert.observeSearch(_airportSettingStore.loadAirportDataSources());
        break;
      case 'appliedAirportType':
      case 'appliedAirportUsageType':
        useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
        break;
      case 'militaryUseType':
        useUpsert.observeSearch(_airportSettingStore.loadMilitaryUseTypes());
        break;
      case 'elevationUOM':
      case 'distanceUOM':
        useUpsert.observeSearch(_airportSettingStore.loadDistanceUOMs());
        break;
      case 'airportDirection':
        useUpsert.observeSearch(_airportSettingStore.loadAirportDirections());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_airportSettingStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_airportSettingStore.getSourceTypes());
        break;
    }
  };

  /* istanbul ignore next */
  const openMapViewDialog = (model: AirportModel): void => {
    const { latitudeCoordinate, longitudeCoordinate, name } = model;
    const title: string = `${name} (LAT: ${latitudeCoordinate?.latitude},  LON: ${longitudeCoordinate?.longitude})`;
    ModalStore.open(
      <Dialog
        title={title}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => (
          <MapBoxView
            marker={
              {
                title,
                latitude: latitudeCoordinate?.latitude,
                longitude: longitudeCoordinate?.longitude,
              } as IMarker
            }
          />
        )}
        dialogActions={() => (
          <PrimaryButton variant="outlined" onClick={() => ModalStore.close()}>
            Close
          </PrimaryButton>
        )}
      />
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavLink={backNavLink}
        backNavTitle="Airports"
        disableActions={disableSaveButton()}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={isEditable}
        onAction={onAction}
        showStatusButton={useUpsert.isDetailView}
        isActive={useUpsert.isAddNew || airportsDetails?.isActive}
        customActionButtons={() => (
          <ViewPermission
            hasPermission={Boolean(
              airportsDetails?.latitudeCoordinate?.latitude && airportsDetails?.longitudeCoordinate?.longitude
            )}
          >
            <PrimaryButton
              className={classes?.mapButton}
              variant="contained"
              onClick={() => openMapViewDialog(airportsDetails)}
              startIcon={<AirportLocationIcon />}
            >
              View Map
            </PrimaryButton>
          </ViewPermission>
        )}
      />
    );
  };

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
          onValueChange={onValueChange}
          onFocus={onFocus}
          onSearch={onSearch}
        />
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'airportStore',
  'airportSettingsStore',
  'sidebarStore',
  'entityMapStore'
)(observer(AirportGeneralInformation));
