import { BaseUpsertComponent, CityModel, CountryModel, IBaseModuleProps, StateModel, VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { withStyles, Paper } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { NavigateFunction } from 'react-router';
import { AirportAddressModel, AirportManagementModel, AirportModel, AirportStore } from '../../../Shared';
import { AirportModuleSecurity } from '../../../Shared/Tools';
import { fields } from './Fields';
import { styles } from './Ownership.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { action, observable } from 'mobx';
import {
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
  withRouter,
  IClasses,
  IOptionValue,
  IAPIGridRequest,
  IAPISearchFilter,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, Collapsable } from '@wings-shared/layout';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  airportStore?: AirportStore;
  params?: { viewMode: VIEW_MODE; airportId: string };
  navigate: NavigateFunction;
  classes?: IClasses;
}

@inject('airportStore')
@observer
export class Ownership extends BaseUpsertComponent<Props, AirportManagementModel> {
  private readonly backNavLink: string = '/airports';
  @observable private managerState: StateModel[] = [];
  @observable private ownerState: StateModel[] = [];
  @observable private managerCity: CityModel[] = [];
  @observable private ownerCity: CityModel[] = [];
  @observable $cityErrorMap: Map<string, string> = new Map<string, string>();

  constructor(p: Props) {
    super(p, fields, baseEntitySearchFilters);
    this.setViewMode((p.params?.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }

  componentDidMount() {
    this.loadInitialData();
    this.validateCity();
  }

  private loadInitialData(): void {
    this.setFormValues(this.selectedAirport?.airportManagement);
    this.airportStore.getCountries();
    const { airportManagement } = this.selectedAirport;
    if (airportManagement?.airportManagerAddress?.country?.id) {
      this.loadStates('airportManagerAddress.country');
    }
    if (airportManagement?.airportOwnerAddress?.country?.id) {
      this.loadStates('airportOwnerAddress.country');
    }
  }

  /* istanbul ignore next */
  private get airportId(): number {
    return Utilities.getNumberOrNullValue(this.props.params?.airportId) as number;
  }

  /* istanbul ignore next */
  private get airportStore(): AirportStore {
    return this.props.airportStore as AirportStore;
  }

  /* istanbul ignore next */
  private get selectedAirport(): AirportModel {
    return this.airportStore.selectedAirport as AirportModel;
  }

  /* istanbul ignore next */
  private get disableSaveButton(): boolean {
    return (
      this.form.hasError || UIStore.pageLoading || !this.form.changed || [ ...this.$cityErrorMap.values() ].some(v => v)
    );
  }

  /* istanbul ignore next */
  private get isManagerCountrySelected(): boolean {
    const { value } = this.getField('airportManagerAddress.country');
    return Boolean((value as CountryModel)?.id);
  }

  /* istanbul ignore next */
  private get isOwnerCountrySelected(): boolean {
    const { value } = this.getField('airportOwnerAddress.country');
    return Boolean((value as CountryModel)?.id);
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls[] {
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
            options: this.airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'airportManagerAddress.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.managerState,
            isDisabled: !this.isManagerCountrySelected,
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'airportManagerAddress.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.managerCity,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !this.isManagerCountrySelected,
            getOptionLabel: city => (city as CityModel)?.label,
            customErrorMessage: this.$cityErrorMap.get('airportManagerAddress.city'),
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
            options: this.airportStore.countries,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          },
          {
            fieldKey: 'airportOwnerAddress.state',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.ownerState,
            isDisabled: !this.isOwnerCountrySelected,
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'airportOwnerAddress.city',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.ownerCity,
            searchEntityType: SEARCH_ENTITY_TYPE.CITY,
            isDisabled: !this.isOwnerCountrySelected,
            getOptionLabel: city => (city as CityModel)?.label,
            customErrorMessage: this.$cityErrorMap.get('airportOwnerAddress.city'),
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
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'airportManagerAddress.country':
        // clear countries
        if (!value) {
          this.airportStore.countries = [];
        }
        this.managerCity = [];
        this.managerState = [];
        this.clearFormFields([ 'airportManagerAddress.city', 'airportManagerAddress.state' ]);
        this.loadStates(fieldKey);
        break;
      case 'airportOwnerAddress.country':
        // clear countries
        if (!value) {
          this.airportStore.countries = [];
        }
        this.ownerCity = [];
        this.ownerState = [];
        this.clearFormFields([ 'airportOwnerAddress.city', 'airportOwnerAddress.state' ]);
        this.loadStates(fieldKey);
        break;
      case 'airportManagerAddress.state':
        this.airportStore.cities = [];
        this.clearFormFields([ 'airportManagerAddress.city' ]);
        break;
      case 'airportOwnerAddress.state':
        this.airportStore.cities = [];
        this.clearFormFields([ 'airportOwnerAddress.city' ]);
        break;
      case 'airportOwnerAddress.city':
      case 'airportManagerAddress.city':
        this.validateCity();
        break;
      default:
        this.getField(fieldKey).set(value);
    }
  }

  // Search Entity based on field value
  @action
  private onSearch(searchValue: string, fieldKey: string, entityType: SEARCH_ENTITY_TYPE): void {
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
        this.loadCities(searchValue, fieldKey);
        break;
    }
  }

  // implemented as per 92638
  /* istanbul ignore next */
  private validateCity(): void {
    const { appliedAirportUsageType } = this.selectedAirport;
    const { airportManagerAddress, airportOwnerAddress } = this.form.values();
    const cityFields = [ 'airportManagerAddress.city', 'airportOwnerAddress.city' ];
    const errorMessage = 'Please select City having CAPPS Code.';
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    if (!hasOperationalAirport || !airportManagerAddress?.city || !airportOwnerAddress?.city) {
      cityFields.forEach(key => this.$cityErrorMap.set(key, ''));
    }
    if (hasOperationalAirport && Boolean(airportManagerAddress?.city?.id)) {
      this.$cityErrorMap.set(cityFields[0], !Boolean(airportManagerAddress?.city?.cappsCode) ? errorMessage : '');
    }
    if (hasOperationalAirport && Boolean(airportOwnerAddress?.city?.id)) {
      this.$cityErrorMap.set(cityFields[1], !Boolean(airportOwnerAddress?.city?.cappsCode) ? errorMessage : '');
    }
  }

  /* istanbul ignore next */
  // load cities based on state or country
  private loadCities(searchValue: string, fieldKey: string): void {
    const { appliedAirportUsageType } = this.selectedAirport;
    const hasOperationalAirport = appliedAirportUsageType?.map(x => x?.name).includes('Operational');
    const [ prefix ] = fieldKey.split('.');
    const isOwner = prefix === 'airportOwnerAddress';
    const countryId: number = this.getField(`${prefix}.country`).value?.id;
    if (!countryId || !searchValue) {
      this.airportStore.cities = [];
      return;
    }
    const stateId: number = this.getField(`${prefix}.state`).value?.id;
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
        tapWithAction(response => {
          if (isOwner) {
            this.ownerCity = response;
            return;
          }
          this.managerCity = response;
        })
      )
    );
  }

  /* istanbul ignore next */
  private loadStates(fieldKey: string): void {
    const [ prefix ] = fieldKey.split('.');
    const isOwner = prefix === 'airportOwnerAddress';
    const countryId: string = this.getField(`${prefix}.country`).value?.id;
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
    this.observeSearch(
      this.airportStore.getStates(stateRequest).pipe(
        tapWithAction(response => {
          if (isOwner) {
            this.ownerState = response.results;
            return;
          }
          this.managerState = response.results;
        })
      )
    );
  }

  /* istanbul ignore next */
  private upsertAirportManagement(): void {
    const { airportManagerAddress, airportOwnerAddress, ...rest } = this.form.values();
    const request = new AirportManagementModel({
      ...this.selectedAirport.airportManagement,
      ...rest,
      airportManagerAddress: new AirportAddressModel({
        ...this.selectedAirport.airportManagement.airportManagerAddress,
        ...airportManagerAddress,
      }),
      airportOwnerAddress: new AirportAddressModel({
        ...this.selectedAirport.airportManagement.airportOwnerAddress,
        ...airportOwnerAddress,
      }),
      airportId: this.airportId,
    });
    UIStore.setPageLoader(true);
    this.airportStore
      .upsertAirportManagementInfo(request.serialize())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.airportStore.setSelectedAirport({
            ...this.selectedAirport,
            airportManagement: response,
          });
          this.form.reset();
          this.setFormValues(response);
        },
        error: error => AlertStore.critical(error.message),
      });
  }

  private onAction(action: GRID_ACTIONS): void {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        this.upsertAirportManagement();
        break;
      case GRID_ACTIONS.EDIT:
        this.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(this.props.params?.viewMode || '', VIEW_MODE.DETAILS)) {
          this.form.reset();
          this.setFormValues(this.selectedAirport?.airportManagement);
          this.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        this.props.navigate(this.backNavLink, this.noBlocker);
        break;
    }
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.selectedAirport.title}
        backNavLink={this.backNavLink}
        backNavTitle="Airports"
        disableActions={this.disableSaveButton}
        isEditMode={this.isEditable}
        isActive={this.selectedAirport?.isActive}
        hasEditPermission={AirportModuleSecurity.isEditable}
        onAction={action => this.onAction(action)}
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
          <div className={classes.flexRow}>
            {this.groupInputControls.map(groupInputControl => {
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
                            field={this.getField(inputControl.fieldKey || '')}
                            isEditable={this.isEditable}
                            isExists={inputControl.isExists}
                            classes={{
                              flexRow: classes.inputControl,
                            }}
                            onValueChange={(option, fieldKey) =>
                              this.onValueChange(option, inputControl.fieldKey || '')
                            }
                            onSearch={(searchValue, fieldKey) =>
                              this.onSearch(
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
  }
}

export default withRouter(withStyles(styles)(Ownership));
export { Ownership as PureOwnership };
