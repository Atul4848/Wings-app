import { withStyles } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import {
  BaseUpsertComponent,
  CityModel,
  CountryModel,
  IBaseModuleProps,
  ModelStatusOptions,
  StateModel,
  VIEW_MODE,
} from '@wings/shared';
import { AuthStore, Logger } from '@wings-shared/security';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import React, { ReactNode } from 'react';
import { NavigateFunction } from 'react-router';
import { debounceTime, finalize, map, takeUntil, tap } from 'rxjs/operators';
import {
  AirportModel,
  AirportRunwayModel,
  AirportSettingsStore,
  AirportStore,
  IAPIValidateAirport,
  UOMValueModel,
  updateAirportSidebarOptions,
} from '../../../Shared';
import { AirportModuleSecurity } from '../../../Shared/Tools';
import { styles } from './AirportGeneralInformation.styles';
import { fields } from './Fields';
import IcaoUwaCodeEditor from './IcaoUwaCodeEditor/IcaoUwaCodeEditor';
import AirportLocationIcon from '@material-ui/icons/LocationOnOutlined';
import ConfirmDeactivateDialog from './ConfirmDeactivateDialog/ConfirmDeactivateDialog';
import { AxiosError } from 'axios';
import {
  Coordinate,
  IAPIGridRequest,
  IAPISearchFilter,
  IOptionValue,
  MODEL_STATUS,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  withRouter,
  IClasses,
  ViewPermission,
  EntityMapModel,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { MapBoxView } from '@wings-shared/mapbox';
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
  ConfirmDialog,
  ConfirmNavigate,
  SidebarStore,
} from '@wings-shared/layout';
import { IMarker } from '@wings-shared/mapbox/dist/Interfaces';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  params?: { viewMode: VIEW_MODE; airportId: string };
  navigate: NavigateFunction;
  classes?: IClasses;
  sidebarStore: typeof SidebarStore;
}

@inject('airportStore', 'airportSettingsStore', 'sidebarStore')
@observer
export class AirportGeneralInformation extends BaseUpsertComponent<Props, AirportModel> {
  private readonly codeFields = [ 'icaoCode', 'uwaAirportCode', 'regionalAirportCode', 'iataCode', 'faaCode' ];
  private readonly locationFields: string[] = [
    'airportLocation.city',
    'airportLocation.closestCity',
    'airportLocation.island',
  ];
  private readonly backNavLink: string = '/airports';
  @observable private airportsDetails: AirportModel;
  @observable private airportTypes: EntityMapModel[] = [];
  @observable private usageTypes: EntityMapModel[] = [];
  @observable private runways: AirportRunwayModel[] = [];
  // validate fields
  @observable $codeErrorsMap: Map<string, string> = new Map<string, string>();
  @observable $cityErrorMap: Map<string, string> = new Map<string, string>();

  private readonly latDirections = [
    { label: 'N', value: 'N' },
    { label: 'S', value: 'S' },
  ];

  private readonly longDirections = [
    { label: 'W', value: 'W' },
    { label: 'E', value: 'E' },
  ];

  constructor(p: Props) {
    super(p, fields, baseEntitySearchFilters);
    this.viewMode = (this.props.params?.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS;
  }

  private get airportBasePath() {
    const { airportId, icao, viewMode } = this.props.params;
    return airportId ? `/airports/upsert/${airportId}/${icao}/${viewMode}` : '/airports/upsert/new';
  }

  /* istanbul ignore next */
  componentDidMount() {
    const { airportId } = this.props.params;
    this.loadAirport();
    this.props.sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('', window.location.search, !Boolean(airportId)),
      this.airportBasePath
    );
    // load airports while editing to check duplicate records
    if (this.airportId && this.isEditable) {
      this.loadStates();
      this.loadAirports();
    }
    this.searchSourceLocationId();
    this.searchCodeValidation();
    this.setAppliedAirportUsageType();
    this.validateCity();
  }

  componentWillUnmount() {
    this.airportSettingsStore.ICAOCodes = [];
    this.airportStore.airports = [];
    this.airportStore.cities = [];
    this.airportStore.countries = [];
  }

  /* istanbul ignore next */
  private get airportStore(): AirportStore {
    return this.props.airportStore as AirportStore;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private get isNewAirport(): boolean {
    return !Utilities.getNumberOrNullValue(this.props.params?.airportId);
  }

  /* istanbul ignore next */
  // If created with code 77682 #4
  private get isCreatedWithCode(): boolean {
    if (!this.airportsDetails) {
      return false;
    }
    const { icaoCode, uwaAirportCode, regionalAirportCode } = this.airportsDetails;
    return Boolean(icaoCode?.label || uwaAirportCode?.label || regionalAirportCode?.label);
  }

  private get hasICAOCode(): boolean {
    return Boolean(this.getField('icaoCode').value?.id);
  }

  private get hasUWACode(): boolean {
    return Boolean(this.getField('uwaAirportCode').value?.id);
  }

  private get hasRegionalCode(): boolean {
    return Boolean(this.getField('regionalAirportCode').value?.id);
  }

  /* istanbul ignore next */
  private get airportId(): number {
    return Utilities.getNumberOrNullValue(this.props.params?.airportId) as number;
  }

  /* istanbul ignore next */
  private get isCountrySelected(): boolean {
    const { value } = this.getField('airportLocation.country');
    return Boolean((value as CountryModel)?.id);
  }

  /* istanbul ignore next */
  private get isMilitaryUseTypeEnabled(): boolean {
    const { value } = this.getField('appliedAirportType');
    return Boolean((value as EntityMapModel)?.entityId)
      ? !Boolean(Utilities.isEqual(value?.name, 'Joint') || Utilities.isEqual(value?.name, 'Military'))
      : true;
  }

  /* istanbul ignore next */
  private get hasDistanceToDowntownValue(): boolean {
    const { value } = this.getField('airportLocation.distanceToDowntown.value');
    return Boolean(value);
  }

  /* istanbul ignore next */
  private get airportStatus(): boolean {
    return Utilities.isEqual(this.getField('status').value?.label, 'active');
  }

  /* istanbul ignore next */
  private get title(): string {
    return new AirportModel(this.form.values()).title;
  }

  /* istanbul ignore next */
  private get disableSaveButton(): boolean {
    return (
      this.form.hasError ||
      UIStore.pageLoading ||
      !this.form.changed ||
      this.hasDuplicateValue ||
      [ ...this.$codeErrorsMap.values() ].some(v => v) ||
      [ ...this.$cityErrorMap.values() ].some(v => v)
    );
  }

  /* istanbul ignore next */
  // if airport include retail
  private get hasRetailUsageType(): boolean {
    const usageType = this.getField('appliedAirportUsageType').value;
    return Array.isArray(usageType) ? usageType.some(x => Utilities.isEqual(x?.name, 'Retail')) : false;
  }

  /* istanbul ignore next */
  // implemented as per 71942
  private get isOnlyRetailAirport(): boolean {
    const usageType = this.getField('appliedAirportUsageType').value;
    return Utilities.isEqual(usageType.length, 1) && Utilities.isEqual(usageType[0].label, 'Retail');
  }

  /* istanbul ignore next */
  private get isOnlyOperationalAirport(): boolean {
    const usageType = this.getField('appliedAirportUsageType').value;
    return Utilities.isEqual(usageType.length, 1) && Utilities.isEqual(usageType[0].label, 'Operational');
  }

  /* istanbul ignore next */
  private get hasCodeValue(): boolean {
    return this.codeFields.some(x => {
      if (typeof x === 'object') {
        return Boolean(this.getField(x).value?.label);
      }
      return Boolean(this.getField(x).value);
    });
  }

  /* istanbul ignore next */
  private get airportCodes(): string {
    return (
      this.airportsDetails.displayCode ||
      this.airportsDetails.icaoCode?.label ||
      this.airportsDetails.uwaCode ||
      this.airportsDetails.regionalCode ||
      this.airportsDetails.iataCode ||
      this.airportsDetails.faaCode
    );
  }

  /* istanbul ignore next */
  // implemented as per 81193
  private get shouldClearRetailFields(): boolean {
    if (!this.airportId) {
      return true;
    }
    const { sourceLocationId, airportDataSource } = this.airportsDetails;
    return !Boolean(airportDataSource && sourceLocationId);
  }

  /* istanbul ignore next */
  // implemented as per 78352
  private get disableDataSourceAndLocationId(): boolean {
    if (!this.airportsDetails) {
      return false;
    }
    const { sourceLocationId } = this.airportsDetails;
    return Boolean(sourceLocationId) || !this.hasRetailUsageType;
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls[] {
    return [
      {
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'icaoCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.ICAOCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.ICAO_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit ICAO Code"
                label={field.label}
                hideIcon={this.isNewAirport || this.hasRetailUsageType || !this.isCreatedWithCode}
                onAction={() => this.confirmEditAirportCode(field)}
              />
            ),
            isDisabled: this.isNewAirport
              ? this.hasUWACode || this.hasRegionalCode
              : this.isCreatedWithCode || this.hasUWACode || this.hasRegionalCode,
            customErrorMessage: this.$codeErrorsMap.get('icaoCode'),
          },
          {
            fieldKey: 'uwaAirportCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.uwaCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.UWA_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit UWA Code"
                label={field.label}
                hideIcon={this.isNewAirport || this.hasICAOCode || this.hasRetailUsageType || !this.isCreatedWithCode}
                onAction={() => this.confirmEditAirportCode(field)}
              />
            ),
            isDisabled: this.isNewAirport
              ? this.hasICAOCode || this.hasRegionalCode
              : this.isCreatedWithCode || this.hasICAOCode || this.hasRegionalCode,
            customErrorMessage: this.$codeErrorsMap.get('uwaAirportCode'),
          },
          {
            fieldKey: 'iataCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: this.$codeErrorsMap.get('iataCode'),
          },
          {
            fieldKey: 'regionalAirportCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.regionalCodes,
            searchEntityType: SEARCH_ENTITY_TYPE.REGIONAL_CODE,
            customLabel: field => (
              <CustomActionLabel
                tooltip="Edit Regional Code"
                label={field.label}
                hideIcon={this.isNewAirport || this.hasICAOCode || this.hasRetailUsageType || !this.isCreatedWithCode}
                onAction={() => this.confirmEditAirportCode(field)}
              />
            ),
            isDisabled: this.isNewAirport
              ? this.hasICAOCode || this.hasUWACode
              : this.hasICAOCode || this.hasUWACode || this.isCreatedWithCode,
            customErrorMessage: this.$codeErrorsMap.get('regionalAirportCode'),
          },
          {
            fieldKey: 'faaCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: this.$codeErrorsMap.get('faaCode'),
          },
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: this.isAlreadyExistMap.get('name')
              ? 'The Name already exists for the selected Country and City/Closest City.'
              : '',
          },
          {
            fieldKey: 'appliedAirportUsageType',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: this.usageTypes,
            getChipDisabled: option => Utilities.isEqual(option?.label, 'Retail') && this.isAddNew,
          },
          {
            fieldKey: 'appliedAirportType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportTypes,
          },
          {
            fieldKey: 'militaryUseType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.militaryUseType,
            isDisabled: this.isMilitaryUseTypeEnabled,
          },
          {
            fieldKey: 'airportFacilityType',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportFacilityTypes,
          },
          {
            fieldKey: 'airportFacilityAccessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportFacilityAccessLevels,
          },
          {
            fieldKey: 'cappsAirportName',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: this.isAlreadyExistMap.get('cappsAirportName')
              ? 'The CAPPS Airport Name already exists for the selected Country and City/Closest City.'
              : '',
          },
          {
            fieldKey: 'airportOfEntry',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportOfEntry,
          },
          {
            fieldKey: 'isTopUsageAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'primaryRunway',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.runways.filter(a => a.status?.name === 'Active'),
          },
        ],
      },
      {
        title: 'Retail Information:',
        inputControls: [
          {
            fieldKey: 'airportDataSource',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: AuthStore.user?.isSystemAdmin ? false : this.disableDataSourceAndLocationId,
            options: this.airportSettingsStore.airportDataSources,
          },
          {
            fieldKey: 'sourceLocationId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: this.disableDataSourceAndLocationId,
            customErrorMessage: this.isAlreadyExistMap.get('sourceLocationId')
              ? 'Airport already exists with this SourceLocationId'
              : '',
          },
        ],
      },
      {
        title: 'Location Details:',
        inputControls: [
          {
            fieldKey: 'airportLocation.country',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'airportLocation.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportStore.states,
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            isDisabled: !this.isCountrySelected,
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'airportLocation.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportStore.cities,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !this.isCountrySelected,
            getOptionLabel: city => (city as CityModel)?.labelWithState,
            customErrorMessage: this.$cityErrorMap.get('airportLocation.city'),
          },
          {
            fieldKey: 'airportLocation.closestCity',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportStore.cities,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !this.isCountrySelected,
            getOptionLabel: city => (city as CityModel)?.labelWithState,
            customErrorMessage: this.$cityErrorMap.get('airportLocation.closestCity'),
          },
          {
            fieldKey: 'airportLocation.island',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportStore.islands,
            searchEntityType: SEARCH_ENTITY_TYPE.ISLAND,
            isDisabled: !this.isCountrySelected,
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
            subFields: this.latValues,
            tooltipText: this.airportsDetails?.latitudeCoordinate?.coordinate.label,
          },
          {
            fieldKey: 'longitudeCoordinate.longitude',
            coordinate: Coordinate.LONG,
            type: EDITOR_TYPES.TEXT_FIELD,
            showTooltip: true,
            isLatLongEditor: true,
            isInputCustomLabel: true,
            subFields: this.longValues,
            tooltipText: this.airportsDetails?.longitudeCoordinate?.coordinate.label,
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
            options: this.airportSettingsStore.distanceUOMs,
            getOptionDisabled: options => !Utilities.isEqual(options.label, 'miles'),
          },
          {
            fieldKey: 'airportLocation.airportDirection',
            type: EDITOR_TYPES.DROPDOWN,
            isDisabled: !this.hasDistanceToDowntownValue,
            options: this.airportSettingsStore.airportDirections,
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
            options: this.airportSettingsStore.distanceUOMs,
          },
        ],
      },
      {
        title: 'Other Details:',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.accessLevels,
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
            options: this.airportSettingsStore.sourceTypes,
          },
        ],
      },
      {
        title: '',
        inputControlClassName: this.props.classes?.inactiveReason,
        inputControls: [
          {
            fieldKey: 'inactiveReason',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: this.airportStatus,
            isDisabled: true,
            multiline: true,
            rows: 2,
          },
        ],
      },
    ];
  }

  private get latValues(): IViewInputControl[] {
    return [
      {
        fieldKey: 'lat',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'min',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'sec',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'dir',
        type: EDITOR_TYPES.DROPDOWN,
        options: this.latDirections,
      },
    ];
  }

  private get longValues(): IViewInputControl[] {
    return [
      {
        fieldKey: 'long',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'min',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'sec',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'dir',
        type: EDITOR_TYPES.DROPDOWN,
        options: this.longDirections,
      },
    ];
  }

  /* istanbul ignore next */
  private searchSourceLocationId(): void {
    this.debounce$
      .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$))
      .subscribe(() => this.validateSourceLocationId());
  }

  /* istanbul ignore next */
  private searchCodeValidation(): void {
    this.debounce$
      .pipe(debounceTime(this.debounceTime), takeUntil(this.destroy$))
      .subscribe(() => this.validateAirportCodes());
  }

  /* istanbul ignore next */
  private setAppliedAirportUsageType(): void {
    this.observeSearch(
      this.airportSettingsStore.loadAirportUsageTypes().pipe(
        tapWithAction(response => {
          this.usageTypes = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
          if (this.hasRetailUsageType) {
            return;
          }
          const appliedAirportUsageType = this.getField('appliedAirportUsageType').value;
          appliedAirportUsageType.push(this.usageTypes.find(x => Utilities.isEqual(x.name, 'Retail')));
          this.getField('appliedAirportUsageType').set(appliedAirportUsageType);
        })
      )
    );
  }

  /* istanbul ignore next */
  private confirmEditAirportCode(field: Field) {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Edit"
        message={`Are you sure you want to edit this ${this.getFieldLabel(field.key)}?`}
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => this.openCodeEditor(field)}
      />
    );
  }

  /* istanbul ignore next */
  // editor for Editing UWA code and ICAO code 62978
  private openCodeEditor(field: Field): void {
    const inputControl = this.groupInputControls[0].inputControls.find(({ fieldKey }) =>
      Utilities.isEqual(fieldKey || '', field.key)
    ) as IViewInputControl;

    ModalStore.open(
      <IcaoUwaCodeEditor
        inputControl={inputControl}
        field={field}
        airportId={this.airportId}
        airportStore={this.airportStore}
        airportSettingsStore={this.airportSettingsStore}
        onSaveSuccess={updatedAirport => {
          const airportModel = new AirportModel({
            ...updatedAirport,
            timezoneInformation: this.airportsDetails?.timezoneInformation,
          });
          this.airportStore.setSelectedAirport(airportModel);
          this.airportsDetails = airportModel;
          this.form.reset();
          this.setFormValues(updatedAirport);
        }}
      />
    );
  }

  /* istanbul ignore next */
  private setUOMsOption(): void {
    const milesOption = this.airportSettingsStore.distanceUOMs.find(uom => Utilities.isEqual(uom.label, 'miles'));
    this.getField('airportLocation.distanceUOM').set(milesOption);
    const feetOption = this.airportSettingsStore.distanceUOMs.find(uom => Utilities.isEqual(uom.label, 'feet'));
    this.getField('airportLocation.elevationUOM').set(feetOption);
  }

  /* istanbul ignore next */
  private loadAirport(): void {
    const { selectedAirport } = this.airportStore;
    this.airportsDetails = selectedAirport ? selectedAirport : new AirportModel();
    this.setFormValues(this.airportsDetails);
    this.validateInputFields();
    this.observeSearch(this.airportSettingsStore.loadDistanceUOMs().pipe(tap(() => this.setUOMsOption())));
  }

  /* istanbul ignore next */
  // load cities based on state or country
  private loadCities(searchValue: string): void {
    const { appliedAirportUsageType } = this.form.values();
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    const countryId: number = this.getField('airportLocation.country').value?.id;
    if (!countryId || !searchValue) {
      this.airportStore.cities = [];
      return;
    }
    const stateId: number = this.getField('airportLocation.state').value?.id;
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
    const cityRequest = this.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.CITY, filterCollection);
    this.observeSearch(
      this.airportStore.searchCities({ searchValue, stateId, countryId }, true, true).pipe(
        map(results =>
          results.map(city => {
            // need to do this for map state capss code in
            return new CityModel({
              ...city,
              state: this.airportStore.states.find(state => state.id == city.state?.id),
            });
          })
        ),
        tapWithAction(response => (this.airportStore.cities = response))
      )
    );
  }

  /* istanbul ignore next */
  // load cities based on state or country
  private loadStates(): void {
    const countryId: string = this.getField('airportLocation.country').value?.id;
    if (!countryId) {
      this.airportStore.states = [];
      return;
    }
    const notEqualFilter: IAPISearchFilter = {
      propertyName: 'CappsCode',
      operator: 'and',
      propertyValue: null,
      filterType: 'ne',
    };
    const stateFilters = Utilities.getFilter('Country.CountryId', countryId);
    const stateRequest = this.getFilterRequest(SEARCH_ENTITY_TYPE.STATE, [ stateFilters, notEqualFilter ]);
    this.observeSearch(this.airportStore.getStates(stateRequest));
  }

  // implemented as per 92638
  /* istanbul ignore next */
  private validateCity(): void {
    const { appliedAirportUsageType, airportLocation } = this.form.values();
    const cityFields = [ 'airportLocation.city', 'airportLocation.closestCity' ];
    const errorMessage = 'Please select City having CAPPS Code.';
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    if (!hasOperationalAirport) {
      cityFields.forEach(key => this.$cityErrorMap.set(key, ''));
    }
    if (hasOperationalAirport && airportLocation.city) {
      this.$cityErrorMap.set(cityFields[0], !Boolean(airportLocation.city.cappsCode) ? errorMessage : '');
    }
    if (hasOperationalAirport && airportLocation.closestCity) {
      this.$cityErrorMap.set(cityFields[1], !Boolean(airportLocation.closestCity.cappsCode) ? errorMessage : '');
    }
  }

  /* istanbul ignore next */
  // Validate Airport Name 55772
  @action
  private validateAirportName(): void {
    const cityId: string = this.getField('airportLocation.city').value?.id;
    const closestCityId: string = this.getField('airportLocation.closestCity').value?.id;
    [ 'name', 'cappsAirportName' ].forEach(columnName => {
      const isExists = this.airportStore.airports.some(airport => {
        const isNameMatch = Utilities.isEqual(airport[columnName], this.getField(columnName).value);
        if (!isNameMatch) {
          return false;
        }
        const city = airport.airportLocation?.city?.id
          ? airport.airportLocation?.city
          : airport.airportLocation?.closestCity;

        return Utilities.isEqual(city?.id, cityId || closestCityId);
      });
      this.isAlreadyExistMap.set(columnName, isExists);
    });
  }

  /* istanbul ignore next */
  // Validate Source Location Id
  @action
  private validateSourceLocationId(): void {
    const value = this.getField('sourceLocationId').value;
    if (value.length < 8) {
      return;
    }
    const filters = this.isAddNew
      ? [ Utilities.getFilter('SourceLocationId', value) ]
      : [
        Utilities.getNotFilter('AirportId', this.props.params?.airportId),
        Utilities.getFilter('SourceLocationId', value),
      ];
    this.airportStore
      .getAirports({
        filterCollection: JSON.stringify(filters),
      })
      .pipe()
      .subscribe(({ results }) => this.isAlreadyExistMap.set('sourceLocationId', Boolean(results.length)));
  }

  // Auto populate state from selected city 61569
  /* istanbul ignore next */
  @action
  private populateState(city: CityModel, fieldKey: string): void {
    const stateId = this.getField('airportLocation.state').value?.id;
    if (!city || !city.state?.id || stateId) {
      return;
    }
    // needs to filter state to get cappsCode
    const state = this.airportStore.states.find(_state => _state.id === city.state?.id);
    this.getField('airportLocation.state').set(state);
    this.airportStore.cities = this.airportStore.cities.filter(_city => _city.state?.id === city.state?.id);

    // clear dropdown if
    const key = fieldKey === 'airportLocation.closestCity' ? 'airportLocation.city' : 'airportLocation.closestCity';
    this.getField(key).clear();
  }

  /* istanbul ignore next */
  // Validate Airport Codes 75700
  // Validate Airport icaoCode uwaCode and iataCode
  private validateAirportCodes(): void {
    const {
      icaoCode,
      uwaAirportCode,
      regionalAirportCode,
      iataCode,
      faaCode,
      airportOfEntry,
      appliedAirportUsageType,
      airportDataSource,
      sourceLocationId,
    } = this.form.values();
    const request: IAPIValidateAirport = {
      faaCode,
      iataCode,
      sourceLocationId,
      id: this.airportId || 0,
      icaoCodeId: icaoCode?.id,
      regionalAirportCodeId: regionalAirportCode?.id,
      uwaAirportCodeId: uwaAirportCode?.id,
      airportOfEntryId: airportOfEntry?.id,
      airportDataSourceId: airportDataSource?.id,
      appliedAirportUsageType: appliedAirportUsageType.map(x => {
        return {
          id: x.id,
          airportUsageTypeId: x.entityId,
        };
      }),
    };
    UIStore.setPageLoader(true);
    this.airportStore
      .validateAirportCodes(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ errors }) => {
        this.codeFields.forEach(key => {
          const message = errors.find(x => Utilities.isEqual(x.propertyName, key))?.errorMessage;
          this.$codeErrorsMap.set(key, message || '');
        });
      });
  }

  /* istanbul ignore next */
  // Load Airports based on Country State and City
  private loadAirports(): void {
    const countryId: string = this.getField('airportLocation.country').value?.id;
    const closestCityId: string = this.getField('airportLocation.closestCity').value?.id;
    const cityId: string = this.getField('airportLocation.city').value?.id;
    if (!countryId || !(cityId || closestCityId)) {
      this.airportStore.airports = [];
      this.validateAirportName();
      return;
    }

    // validated based on city or closest city 62948
    const filterCollection = [
      Utilities.getFilter('AirportLocation.City.CityId', cityId || closestCityId),
      Utilities.getFilter('AirportLocation.ClosestCity.CityId', cityId || closestCityId, 'or'),
      { propertyName: 'AirportId', propertyValue: this.airportId, operator: 'and', filterType: 'ne' },
    ];
    this.observeSearch(
      this.airportStore
        .getAirports({
          pageSize: 0,
          filterCollection: JSON.stringify(filterCollection),
          specifiedFields: baseEntitySearchFilters[SEARCH_ENTITY_TYPE.AIRPORT].specifiedFields,
        })
        .pipe(
          tapWithAction(({ results }) => {
            this.airportStore.airports = results;
            this.validateAirportName();
          })
        )
    );
  }

  /* istanbul ignore next */
  private upsertAirport(): void {
    if (!this.hasRetailUsageType) {
      this.showAlert('Retail Type is required in Airport Usage Type', 'upsertAirportBase');
      return;
    }

    const { airportLocation, ...otherFields } = this.form.values();
    const airport = new AirportModel({
      ...this.airportsDetails,
      ...otherFields,
      airportLocation: {
        ...this.airportsDetails?.airportLocation,
        ...airportLocation,
        distanceToDowntown: new UOMValueModel({
          ...this.airportsDetails?.airportLocation?.distanceToDowntown,
          ...airportLocation.distanceToDowntown,
        }),
        elevation: new UOMValueModel({
          ...this.airportsDetails?.airportLocation.elevation,
          ...airportLocation.elevation,
        }),
      },
    });
    UIStore.setPageLoader(true);
    this.airportStore
      .upsertAirport(airport.serialize())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: updatedAirport => {
          if (updatedAirport.errors?.length) {
            this.showAlert(updatedAirport.errors[0].errorMessage, 'upsertAirportBase');
            return;
          }
          const { selectedAirport } = this.airportStore;
          this.airportStore.setSelectedAirport({
            ...updatedAirport,
            runways: selectedAirport?.runways,
            airportFrequencies: selectedAirport?.airportFrequencies,
            timezoneInformation: selectedAirport?.timezoneInformation,
          });
          this.airportsDetails = updatedAirport;
          this.form.reset();
          this.setFormValues(updatedAirport);
          this.setUOMsOption();
          // if new airport then redirect to edit screen
          if (!airport.id) {
            this.props.navigate(`/airports/upsert/${updatedAirport.id}/${this.airportCodes}/edit`, this.noBlocker);
          }
        },
        error: error => this.showAlert(error.message, 'upsertAirportBase'),
      });
  }

  /* istanbul ignore next */
  private updateStatus(): void {
    ModalStore.open(
      <ConfirmDeactivateDialog
        isActive={this.airportStatus}
        onNoClick={() => ModalStore.close()}
        onYesClick={(inactiveReason: string) => {
          this.airportStore
            .updateAirportStatus({
              airportId: this.airportId,
              status: this.airportStatus ? MODEL_STATUS.IN_ACTIVE : MODEL_STATUS.ACTIVE,
              inactiveReason,
            })
            .pipe(
              takeUntil(this.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe({
              next: (updatedAirport: AirportModel) => {
                const { selectedAirport } = this.airportStore;
                this.airportStore.setSelectedAirport({
                  ...updatedAirport,
                  runways: selectedAirport?.runways,
                  timezoneInformation: selectedAirport?.timezoneInformation,
                });
                this.airportsDetails = this.airportStore.selectedAirport as AirportModel;
                this.form.reset();
                this.setFormValues(this.airportStore.selectedAirport as AirportModel);
                this.setUOMsOption();
                ModalStore.close();
              },
              error: (error: AxiosError) => {
                AlertStore.critical(error.message);
                Logger.error(error.message);
              },
            });
        }}
      />
    );
  }

  private onAction(action: GRID_ACTIONS): void {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        this.upsertAirport();
        break;
      case GRID_ACTIONS.EDIT:
        this.setViewMode(VIEW_MODE.EDIT);
        this.loadStates();
        this.loadAirports();
        break;
      case GRID_ACTIONS.TOGGLE_STATUS:
        this.updateStatus();
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(this.props.params?.viewMode || '', VIEW_MODE.DETAILS)) {
          this.form.reset();
          this.setFormValues(this.airportsDetails);
          this.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        this.props.navigate(this.backNavLink);
        break;
    }
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'icaoCode':
        // clear dropdown
        if (!value) {
          this.airportSettingsStore.ICAOCodes = [];
        }
        this.validateAirportCodes();
        break;
      case 'iataCode':
        if ((value as string).length > 2) {
          this.debounce$.next();
        }
        break;
      case 'faaCode':
      case 'uwaAirportCode':
      case 'regionalAirportCode':
        this.debounce$.next();
        break;
      case 'name':
      case 'cappsAirportName':
        this.validateAirportName();
        break;
      case 'airportLocation.city':
      case 'airportLocation.closestCity':
        // clear cities
        if (!value) {
          this.airportStore.cities = [];
        }
        this.populateState(value as CityModel, fieldKey);
        this.loadAirports();
        this.validateCity();
        break;
      case 'airportLocation.country':
        // clear countries
        if (!value) {
          this.airportStore.countries = [];
        }
        this.airportStore.cities = [];
        this.airportStore.states = [];
        this.airportStore.islands = [];
        this.clearFormFields(this.locationFields.concat('airportLocation.state'));
        this.loadAirports();
        this.loadStates();
        break;
      case 'airportLocation.state':
        this.airportStore.cities = [];
        this.clearFormFields(this.locationFields);
        this.loadAirports();
        break;
      case 'airportLocation.distanceToDowntown.value':
        if (!value) {
          this.getField('airportLocation.airportDirection').clear();
        }
        break;
      case 'appliedAirportUsageType':
        if (this.isAddNew) {
          this.setAppliedAirportUsageType();
        }
        if (this.isOnlyOperationalAirport && this.shouldClearRetailFields) {
          this.clearFormFields([ 'airportDataSource', 'sourceLocationId' ]);
        }
        // #81193
        if (this.airportId && this.hasRetailUsageType) {
          const { sourceLocationId, airportDataSource } = this.airportsDetails;
          this.getField('airportDataSource').set(airportDataSource);
          this.getField('sourceLocationId').set(sourceLocationId);
        }
        this.validateCity();
        this.validateAirportCodes();
        break;
      case 'appliedAirportType':
        // clear military types
        if (value) {
          this.getField('militaryUseType').clear();
        }
        break;
      case 'sourceLocationId':
        this.debounce$.next();
        break;
      default:
        this.getField(fieldKey).set(value);
    }
    // validate input fields on value change
    this.validateInputFields();
  }

  private validateInputFields(): void {
    this.defaultRulesForCodes();

    // validate City and Closest City
    this.setFormRules('airportLocation.city', !Boolean(this.getField('airportLocation.closestCity').value?.id));
    this.setFormRules('airportLocation.closestCity', !Boolean(this.getField('airportLocation.city').value?.id));

    // validate Distance to Downtown
    const distanceToDowntown = this.getField('airportLocation.distanceToDowntown.value').value;
    this.setFormRules('airportLocation.distanceUOM', Boolean(distanceToDowntown));

    // validate Elevation
    const elevation = this.getField('airportLocation.elevation.value').value;
    this.setFormRules('airportLocation.elevationUOM', Boolean(elevation));

    // validate airport Facility Type
    const usageType = this.getField('appliedAirportUsageType').value || [];
    this.setFormRules(
      'airportFacilityType',
      usageType.some(({ label }) => Utilities.isEqual(label, 'Retail'))
    );

    // validate fields based on selected Airport Usage Type
    this.setCodeFieldRules();
    this.setSourceFieldRules();
  }

  /* istanbul ignore next */
  // default rules for ICAO and UWA code
  private defaultRulesForCodes(): void {
    const { uwaAirportCode, regionalAirportCode, icaoCode, appliedAirportUsageType } = this.form.values();
    this.setFormRules('uwaAirportCode', !Boolean(icaoCode?.label || regionalAirportCode?.label));
    this.setFormRules('icaoCode', !Boolean(uwaAirportCode?.label || regionalAirportCode?.label));
    this.setFormRules(
      'regionalAirportCode',
      !Boolean(icaoCode?.label || uwaAirportCode?.label) &&
        appliedAirportUsageType?.map(x => x.name).includes('Operational')
    );
  }

  /* istanbul ignore next */
  // 73001 set all code rules based on Retail airport
  private setCodeFieldRules(): void {
    if (this.isOnlyRetailAirport) {
      this.codeFields.forEach(fieldKey => this.setFormRules(fieldKey, !this.hasCodeValue));
      return;
    }
    this.codeFields.forEach(fieldKey => this.setFormRules(fieldKey, false));
    this.defaultRulesForCodes();
  }

  /* istanbul ignore next */
  // set rules for DataSource and SourceLocationId based on Operational airport
  private setSourceFieldRules(): void {
    this.setFormRules('airportDataSource', !this.isOnlyOperationalAirport);
    this.setFormRules('sourceLocationId', !this.isOnlyOperationalAirport);
  }

  // Search Entity based on field value
  @action
  private onSearch(searchValue: string, fieldKey: string, entityType: SEARCH_ENTITY_TYPE): void {
    const request = {
      filterCollection: JSON.stringify([{ statusId: MODEL_STATUS.ACTIVE }]),
    };
    switch (entityType) {
      case SEARCH_ENTITY_TYPE.COUNTRY:
        if (!searchValue) {
          this.airportStore.countries = [];
          return;
        }
        const countryRequest: IAPIGridRequest = this.getSearchRequest(searchValue, entityType);
        this.observeSearch(this.airportStore.getCountries(countryRequest));
        break;
      case SEARCH_ENTITY_TYPE.CITY:
        this.loadCities(searchValue);
        break;
      case SEARCH_ENTITY_TYPE.ICAO_CODE:
        this.observeSearch(this.airportSettingsStore.searchIcaoCode(searchValue));
        break;
      case SEARCH_ENTITY_TYPE.UWA_CODE:
        if (!Boolean(searchValue)) {
          this.airportSettingsStore.uwaCodes = [];
          return;
        }
        this.observeSearch(
          this.airportSettingsStore.loadUwaCodes(request).pipe(
            tapWithAction(response => {
              const _codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              this.airportSettingsStore.uwaCodes = _codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
      case SEARCH_ENTITY_TYPE.REGIONAL_CODE:
        if (!Boolean(searchValue)) {
          this.airportSettingsStore.regionalCodes = [];
          return;
        }
        this.observeSearch(
          this.airportSettingsStore.loadRegionalCodes(request).pipe(
            tapWithAction(response => {
              const codes = response.results.filter(x => !Boolean(x.airport?.airportId));
              this.airportSettingsStore.regionalCodes = codes.filter(y =>
                y.code.toLowerCase().includes(searchValue.toLowerCase())
              );
            })
          )
        );
        break;
    }
  }

  @action
  private onFocus(fieldKey: string): void {
    const countryId: string = this.getField('airportLocation.country').value?.id;
    switch (fieldKey) {
      case 'island':
        if (!countryId) {
          this.airportStore.islands = [];
          return;
        }
        const isLandFilters = [ Utilities.getFilter('Country.CountryId', countryId) ];
        const isLandRequest = this.getFilterRequest(SEARCH_ENTITY_TYPE.ISLAND, isLandFilters);
        this.observeSearch(this.airportStore.getIslands(isLandRequest));
        break;
      case 'airportFacilityType':
        this.observeSearch(this.airportSettingsStore.loadAirportFacilityTypes());
        break;
      case 'airportFacilityAccessLevel':
        this.observeSearch(this.airportSettingsStore.loadAirportFacilityAccessLevels());
        break;
      case 'airportOfEntry':
        this.observeSearch(this.airportSettingsStore.loadAirportOfEntries());
        break;
      case 'primaryRunway':
        this.observeSearch(
          this.airportStore
            .getRunways(this.airportId || 0)
            .pipe(tapWithAction((response: AirportRunwayModel[]) => (this.runways = response)))
        );
        break;
      case 'airportDataSource':
        this.observeSearch(this.airportSettingsStore.loadAirportDataSources());
        break;
      case 'appliedAirportType':
        this.observeSearch(
          this.airportSettingsStore.loadAirportTypes().pipe(
            tapWithAction(response => {
              this.airportTypes = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
            })
          )
        );
        break;
      case 'militaryUseType':
        this.observeSearch(this.airportSettingsStore.loadMilitaryUseTypes());
        break;
      case 'elevationUOM':
      case 'distanceUOM':
        this.observeSearch(this.airportSettingsStore.loadDistanceUOMs());
        break;
      case 'airportDirection':
        this.observeSearch(this.airportSettingsStore.loadAirportDirections());
        break;
      case 'accessLevel':
        this.observeSearch(this.airportSettingsStore.getAccessLevels());
        break;
      case 'sourceType':
        this.observeSearch(this.airportSettingsStore.getSourceTypes());
        break;
    }
  }

  /* istanbul ignore next */
  private openMapViewDialog(model: AirportModel): void {
    const title: string = `${model.name} (LAT: ${model.latitudeCoordinate?.latitude},  LON: ${model.longitudeCoordinate?.longitude})`;
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
                latitude: model.latitudeCoordinate?.latitude,
                longitude: model.longitudeCoordinate?.longitude,
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
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.title}
        backNavLink={this.backNavLink}
        backNavTitle="Airports"
        disableActions={this.disableSaveButton}
        isEditMode={this.isEditable}
        hasEditPermission={AirportModuleSecurity.isEditable}
        onAction={action => this.onAction(action)}
        showStatusButton={this.isDetailView}
        isActive={this.isAddNew || this.airportsDetails?.isActive}
        customActionButtons={() => (
          <ViewPermission
            hasPermission={Boolean(
              this.airportsDetails?.latitudeCoordinate?.latitude && this.airportsDetails?.longitudeCoordinate?.longitude
            )}
          >
            <PrimaryButton
              className={this.props.classes?.mapButton}
              variant="contained"
              onClick={() => this.openMapViewDialog(this.airportsDetails)}
              startIcon={<AirportLocationIcon />}
            >
              View Map
            </PrimaryButton>
          </ViewPermission>
        )}
      />
    );
  }

  public render(): ReactNode {
    const classes = this.props.classes as IClasses;
    return (
      <ConfirmNavigate isBlocker={this.form.changed}>
        <DetailsEditorWrapper
          headerActions={this.headerActions}
          isEditMode={this.isEditable}
          classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
        >
          <ViewInputControlsGroup
            groupInputControls={this.groupInputControls}
            field={fieldKey => this.getField(fieldKey)}
            isEditing={this.isEditable}
            isLoading={this.loader.isLoading}
            onValueChange={(option: IOptionValue, fieldKey: string) => this.onValueChange(option, fieldKey)}
            onFocus={(fieldKey: string) => this.onFocus(fieldKey)}
            onSearch={this.onSearch.bind(this)}
          />
          <AuditFields
            isNew={this.isAddNew}
            isEditable={this.isEditable}
            fieldControls={this.auditFields}
            onGetField={(fieldKey: string) => this.getField(fieldKey)}
          />
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
}

export default withRouter(withStyles(styles)(AirportGeneralInformation));
export { AirportGeneralInformation as PureAirportGeneralInformation };
