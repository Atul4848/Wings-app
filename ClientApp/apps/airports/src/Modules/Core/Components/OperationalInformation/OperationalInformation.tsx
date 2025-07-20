import { BaseUpsertComponent, IBaseModuleProps, VIEW_MODE } from '@wings/shared';
import { Tooltip, withStyles } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { ReactNode } from 'react';
import { NavigateFunction } from 'react-router';
import {
  AgentProfileModel,
  AirportARFFCertificationModel,
  AirportDiagramModel,
  AirportFuelModel,
  AirportModel,
  AirportOperationalInfoModel,
  AirportParkingModel,
  AirportSettingsStore,
  AirportStore,
  EntityMapStore,
} from '../../../Shared';
import { AirportModuleSecurity } from '../../../Shared/Tools';
import { fields, monthOptions } from './Fields';
import { styles } from './OperationalInformation.styles';
import { AlertStore } from '@uvgo-shared/alert';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CloudUpload } from '@material-ui/icons';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Observable, of } from 'rxjs';
import {
  DATE_FORMAT,
  IAPIGridRequest,
  IClasses,
  IOptionValue,
  ISelectOption,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  regex,
  withRouter,
  IdNameCodeModel,
  SettingsTypeModel,
  GRID_ACTIONS,
  tapWithAction,
  EntityMapModel,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, ImportDialog } from '@wings-shared/layout';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  airportStore?: AirportStore;
  entityMapStore?: EntityMapStore;
  airportSettingsStore?: AirportSettingsStore;
  params?: { viewMode: VIEW_MODE; airportId: string };
  navigate: NavigateFunction;
  classes?: IClasses;
}

@inject('airportStore', 'airportSettingsStore')
@observer
export class OperationalInformation extends BaseUpsertComponent<Props, AirportOperationalInfoModel> {
  private readonly backNavLink: string = '/airports';
  private entityMapStore = new EntityMapStore();
  @observable private file: File | null = null;
  @observable private profileFile: File | null = null;
  @observable private fuelTypes: EntityMapModel[] = [];
  @observable private oilTypes: EntityMapModel[] = [];
  @observable private largeAircraftRestriction: EntityMapModel[] = [];

  constructor(p: Props) {
    super(p, fields, baseEntitySearchFilters);
    this.setViewMode((p.params?.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }

  componentDidMount() {
    this.setFormValues(this.selectedAirport.airportOperationalInfo);
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
    return this.props.airportStore?.selectedAirport as AirportModel;
  }

  /* istanbul ignore next */
  private get airportSettingsStore(): AirportSettingsStore {
    return this.props.airportSettingsStore as AirportSettingsStore;
  }

  /* istanbul ignore next */
  private get isProprietary(): boolean {
    // TODO: Enable in Release v1.14
    // return Utilities.isEqual(this.selectedAirport.appliedAirportType?.label, 'Proprietary');
    return false;
  }

  /* istanbul ignore next */
  private get jurisdictionOptions(): ISelectOption[] {
    return this.airportStore.countries.map(
      jurisdiction =>
        new IdNameCodeModel({ ...jurisdiction, name: jurisdiction.commonName, code: jurisdiction.isO2Code })
    );
  }

  /* istanbul ignore next */
  private get metroOptions(): ISelectOption[] {
    return this.airportStore.metros.map(metro => new SettingsTypeModel({ ...metro, name: metro.name }));
  }

  /* istanbul ignore next */
  private get pictureUrl(): string {
    return this.getField('airportDiagramBlobUrl').value || '';
  }

  /* istanbul ignore next */
  private get profileUrl(): string {
    return this.getField('airportA2GAgentProfileBlobUrl').value || '';
  }

  /* istanbul ignore next */
  private get hasPicture(): boolean {
    const { airportDiagramBlobUrl } = this.form.values();
    return Boolean(airportDiagramBlobUrl);
  }

  /* istanbul ignore next */
  private get hasProfile(): boolean {
    const { airportA2GAgentProfileBlobUrl } = this.form.values();
    return Boolean(airportA2GAgentProfileBlobUrl);
  }

  private getOptionDisabled(option: ISelectOption, value: ISelectOption | ISelectOption[]): boolean {
    if (Array.isArray(value) && option?.label !== 'None') {
      return value.some(x => x.label === 'None');
    }
    return false;
  }

  /* istanbul ignore next */
  private get groupInputControls(): IGroupInputControls[] {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'isGAFriendly',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: this.props.classes?.containerClass,
          },
          {
            fieldKey: 'customers',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: [],
            isDisabled: !this.isProprietary,
          },
          {
            fieldKey: 'isMandatoryHandling',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: this.props.classes?.containerClass,
          },
          {
            fieldKey: 'airportCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportCategory,
          },
          {
            fieldKey: 'airportA2GAgentProfileBlobUrl',
            type: EDITOR_TYPES.TEXT_FIELD,
            isReadOnly: true,
            endAdormentValue: this.profileEndAdornment(),
            customLabel: field => {
              if (!this.airportId || !this.hasProfile) {
                return field.label;
              }
              return (
                <>
                  <span>{field.label}</span>
                  <Tooltip title="View Agent Profile">
                    <InsertPhotoIcon className={this.props.classes?.imageIcon} onClick={() => this.showProfile()} />
                  </Tooltip>
                </>
              );
            },
          },
          {
            fieldKey: 'weightLimit',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'wingspanLimit',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weatherReportingSystem',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.weatherReportingSystem,
          },
          {
            fieldKey: 'worldAwareLocationId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'isRuralAirport',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'isDesignatedPointOfEntry',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'unattended',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: this.props.classes?.containerClass,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'isForeignBasedEntity',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'jurisdiction',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.jurisdictionOptions,
            isDisabled: !this.getField('isForeignBasedEntity').value,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'commercialTerminalAddress',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'tdWeekdayMorningRushHour',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins',
          },
          {
            fieldKey: 'tdWeekdayAfternoonRushHour',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins',
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'tdWeekend',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins',
          },
          {
            fieldKey: 'allOtherTimes',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins',
          },
          {
            fieldKey: 'metro',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.metroOptions,
            isDisabled: true,
          },
          {
            fieldKey: 'appliedLargeAircraftRestrictions',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.largeAircraftRestriction,
            multiple: true,
            getOptionDisabled: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) =>
              this.getOptionDisabled(option, selectedOption),
          },
        ],
      },
      {
        title: 'ARFF Certification',
        inputControls: [
          {
            fieldKey: 'airportARFFCertification.classCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportClassCode,
          },
          {
            fieldKey: 'airportARFFCertification.certificateCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportCertificateCode,
          },
          {
            fieldKey: 'airportARFFCertification.serviceCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.airportServiceCode,
          },
          {
            fieldKey: 'airportARFFCertification.certificationDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.ARFF_CERTIFICATION_DATE,
            datePickerViews: [ 'month', 'year' ],
            dateInputMask: regex.dateInputMaskARFF,
          },
          {
            fieldKey: 'airportARFFCertification.isHigherCategoryAvailableOnRequest',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: this.props.classes?.containerClass,
          },
        ],
      },
      {
        title: 'Noise',
        inputControls: [
          {
            fieldKey: 'noise.noiseAbatementProcedure',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            excludeEmptyOption: true,
            containerClass: this.props.classes?.containerClass,
          },
          {
            fieldKey: 'noise.noiseAbatementContact',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Fuel',
        inputControls: [
          {
            fieldKey: 'fuel.appliedFuelTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: this.fuelTypes,
          },
          {
            fieldKey: 'fuel.appliedOilTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: this.oilTypes,
          },
          {
            fieldKey: 'fuel.fuelingFacilities',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 4,
            isFullFlex: true,
          },
          {
            fieldKey: 'fuel.fuelingHours',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 4,
            isFullFlex: true,
          },
        ],
      },
      {
        title: 'Equipment',
        inputControls: [
          {
            fieldKey: 'isOwnTowbarRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: this.props.classes?.containerClass,
          },
        ],
      },
      {
        title: 'Airport Parking',
        inputControls: [
          {
            fieldKey: 'airportParking.airportSeasonalParking',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: monthOptions()
          },
          {
            fieldKey: 'airportParking.overnightParking',
            type: EDITOR_TYPES.DROPDOWN,
            options: this.airportSettingsStore.overnightParkings,
          },
          {
            fieldKey: 'airportParking.maximumParkingDuration',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins'
          },
          {
            fieldKey: 'airportParking.appliedParkingAlternateAirports',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: this.entityMapStore.airports.map(x => new EntityMapModel({ ...x, id: 0, entityId: x.id }))
          },
        ],
      },
    ];
  }

  /* istanbul ignore next */
  private endAdornment(): ReactNode {
    const classes = this.props.classes as IClasses;
    return <CloudUpload onClick={() => this.openUploadDialog()} className={classes.buttonStyle} />;
  }

  private profileEndAdornment(): ReactNode {
    const classes = this.props.classes as IClasses;
    return <CloudUpload onClick={() => this.openAgentProfileDialog()} className={classes.buttonStyle} />;
  }

  /* istanbul ignore next */
  private showImage(): void {
    const { airportDiagramBlobAccessTokenUrl } = this.selectedAirport?.airportOperationalInfo;
    ModalStore.open(
      <Dialog
        title={this.selectedAirport.title}
        open={true}
        onClose={() => ModalStore.close()}
        isLoading={() => this.loader.isLoading}
        dialogContent={() => (
          <img
            height="100%"
            width="100%"
            src={this.file ? URL.createObjectURL(this.file) : airportDiagramBlobAccessTokenUrl}
          />
        )}
        dialogActions={() => (
          <PrimaryButton variant="contained" onClick={() => ModalStore.close()}>
            Close
          </PrimaryButton>
        )}
      />
    );
  }

  /* istanbul ignore next */
  private showProfile(): void {
    const classes = this.props.classes as IClasses;
    const { airportA2GAgentProfileBlobAccessTokenUrl } = this.selectedAirport?.airportOperationalInfo;
    ModalStore.open(
      <Dialog
        title={this.selectedAirport.title}
        open={true}
        onClose={() => ModalStore.close()}
        isLoading={() => this.loader.isLoading}
        classes={{ paperSize: classes.modalWidth, content: classes.content }}
        dialogContent={() => (
          <iframe
            src={this.profileFile ? URL.createObjectURL(this.profileFile) : airportA2GAgentProfileBlobAccessTokenUrl}
            className={classes.iFrame}
            frameBorder="0"
          />
        )}
        dialogActions={() => (
          <PrimaryButton variant="contained" onClick={() => ModalStore.close()}>
            Close
          </PrimaryButton>
        )}
      />
    );
  }

  /* istanbul ignore next */
  private uploadAirportDiagram(): Observable<AirportDiagramModel> {
    if (!this.file) {
      return of(new AirportDiagramModel({ diagramUrl: this.pictureUrl }));
    }
    return this.props.airportStore?.uploadAirportDiagram(this.file, this.props?.params?.airportId || '') || of();
  }

  /* istanbul ignore next */
  private uploadAgentProfile(): Observable<AgentProfileModel> {
    const airportId = this.props.params?.airportId;
    if (!this.profileFile) {
      return of(new AgentProfileModel({ profileUrl: this.profileUrl }));
    }
    return this.props.airportStore?.uploadAgentProfile(this.profileFile, airportId || '') || of();
  }

  /* istanbul ignore next */
  private openUploadDialog(): void {
    ModalStore.open(
      <ImportDialog
        title="Select Image"
        fileType="jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF"
        isLoading={() => this.isLoading}
        onUploadFile={file => {
          this.file = file;
          this.getField('airportDiagramBlobUrl').sync();
          this.getField('airportDiagramBlobUrl').set(file.name);
          ModalStore.close();
          return;
        }}
      />
    );
  }

  /* istanbul ignore next */
  private openAgentProfileDialog(): void {
    ModalStore.open(
      <ImportDialog
        title="Select Document"
        fileType="pdf"
        isLoading={() => this.isLoading}
        onUploadFile={file => {
          this.profileFile = file;
          this.getField('airportA2GAgentProfileBlobUrl').sync();
          this.getField('airportA2GAgentProfileBlobUrl').set(file.name);
          ModalStore.close();
          return;
        }}
      />
    );
  }

  /* istanbul ignore next */
  private upsertAirportOperationalInfo(): void {
    const { airportOperationalInfo } = this.selectedAirport;
    const values = this.form.values();

    const _fuelId = airportOperationalInfo?.fuel?.id;
    const _noiseId = airportOperationalInfo?.noise?.id;

    const _isHigherCategoryAvailable = values.airportARFFCertification.isHigherCategoryAvailableOnRequest;
    const _isHigherCategory = typeof _isHigherCategoryAvailable === 'string' ? null : _isHigherCategoryAvailable;

    const _arff = Utilities.objectHasValues(values?.airportARFFCertification)
      ? new AirportARFFCertificationModel({
        ...values.airportARFFCertification,
        id: airportOperationalInfo?.airportARFFCertification?.id,
        isHigherCategoryAvailableOnRequest: _isHigherCategory,
      })
      : null;

    const _fuel = Utilities.objectHasValues(values.fuel)
      ? new AirportFuelModel({ ...values.fuel, id: _fuelId || 0 })
      : null;

    const _airportParking = Utilities.objectHasValues(values?.airportParking)
      ? new AirportParkingModel({
        ...values.airportParking,
        id: airportOperationalInfo?.airportParking?.id || 0,
      }) : null;

    const request = new AirportOperationalInfoModel({
      ...airportOperationalInfo,
      ...values,
      fuel: _fuel,
      noise: { ...values.noise, id: _noiseId },
      airportARFFCertification: _arff,
      airportParking: _airportParking,
      airportId: this.airportId,
    });

    UIStore.setPageLoader(true);
    this.uploadAgentProfile()
      .pipe(
        switchMap(profileResponse =>
          this.airportStore.upsertAirportOperationalInfo({
            ...request.serialize(),
            airportA2GAgentProfileBlobUrl: profileResponse.profileUrl || '',
          })
        ),
        takeUntil(this.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          this.airportStore.setSelectedAirport({
            ...this.selectedAirport,
            airportOperationalInfo: response,
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
        this.upsertAirportOperationalInfo();
        break;
      case GRID_ACTIONS.EDIT:
        this.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(this.props.params?.viewMode || '', VIEW_MODE.DETAILS)) {
          this.form.reset();
          this.setFormValues(this.selectedAirport?.airportOperationalInfo);
          this.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        this.props.navigate(this.backNavLink, this.noBlocker);
        break;
    }
  }

  @action
  protected onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);

    if (Utilities.isEqual(fieldKey, 'isForeignBasedEntity')) {
      // clear field
      this.getField('jurisdiction').clear();
    }
    if (Utilities.isEqual(fieldKey, 'appliedLargeAircraftRestrictions')) {
      const _value = value as ISelectOption[]
      const isNone = _value.some(item => Utilities.isEqual(item.label, 'None'));
      if (isNone) {
        const filteredValue = _value.filter(item => Utilities.isEqual(item.label, 'None'));
        this.getField(fieldKey).set(filteredValue);
      }
    }
  }

  @action
  private onFocus(fieldKey: string): void {
    switch (fieldKey) {
      case 'airportCategory':
        this.observeSearch(this.airportSettingsStore.loadAirportCategory());
        break;
      case 'weatherReportingSystem':
        this.observeSearch(this.airportSettingsStore.loadWeatherReportingSystem());
        break;
      case 'classCode':
        this.observeSearch(this.airportSettingsStore.loadClassCode());
        break;
      case 'certificateCode':
        this.observeSearch(this.airportSettingsStore.loadCertificateCode());
        break;
      case 'serviceCode':
        this.observeSearch(this.airportSettingsStore.loadServiceCode());
        break;
      case 'appliedFuelTypes':
        this.observeSearch(
          this.airportSettingsStore.loadFuelTypes().pipe(
            tapWithAction(response => {
              this.fuelTypes = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
            })
          )
        );
        break;
      case 'appliedOilTypes':
        this.observeSearch(
          this.airportSettingsStore.loadOilTypes().pipe(
            tapWithAction(response => {
              this.oilTypes = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
            })
          )
        );
        break;
      case 'appliedLargeAircraftRestrictions':
        this.observeSearch(
          this.airportSettingsStore.loadLargeAircraftRestriction().pipe(
            tapWithAction(response => {
              this.largeAircraftRestriction = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
            })
          )
        );
        break;
      case 'overnightParking':
        this.observeSearch(this.airportSettingsStore.loadOvernightParkings());
        break;
    }
  }

  // Search Entity based on field value
  @action
  private onSearch(searchValue: string, fieldKey: string): void {
    switch (fieldKey) {
      case 'jurisdiction':
        if (!searchValue) {
          this.airportStore.countries = [];
          return;
        }
        const countryRequest: IAPIGridRequest = this.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        this.observeSearch(this.airportStore.getCountries(countryRequest));
        break;
      case 'metro':
        const metroRequest: IAPIGridRequest = this.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.METRO);
        this.observeSearch(this.airportStore.getMetros(metroRequest));
        break;
      case 'appliedParkingAlternateAirports':
        if (!searchValue) {
          this.entityMapStore.airports = [];
          return;
        }
        this.observeSearch(this.entityMapStore.searchEntities(searchValue, fieldKey));
        break;
    }
  }

  private get headerActions(): ReactNode {
    return (
      <DetailsEditorHeaderSection
        title={this.selectedAirport.title}
        backNavLink={this.backNavLink}
        backNavTitle="Airports"
        isActive={this.selectedAirport?.isActive}
        disableActions={this.form.hasError || UIStore.pageLoading || !this.form.changed}
        isEditMode={this.isEditable}
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
          <ViewInputControlsGroup
            groupInputControls={this.groupInputControls}
            field={fieldKey => this.getField(fieldKey)}
            isEditing={this.isEditable}
            isLoading={this.loader.isLoading}
            onValueChange={(option: IOptionValue, fieldKey: string) => this.onValueChange(option, fieldKey)}
            onFocus={(fieldKey: string) => this.onFocus(fieldKey)}
            onSearch={(searchValue: string, fieldKey: string) => this.onSearch(searchValue, fieldKey)}
          />
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
}

export default withRouter(withStyles(styles)(OperationalInformation));
export { OperationalInformation as PureOperationalInformation };
