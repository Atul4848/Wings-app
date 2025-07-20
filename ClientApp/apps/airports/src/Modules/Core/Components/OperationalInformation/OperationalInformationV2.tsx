import { IBaseModuleProps, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { Tooltip } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AgentProfileModel,
  AirportARFFCertificationModel,
  airportBasePath,
  AirportFuelModel,
  AirportModel,
  AirportOperationalInfoModel,
  AirportParkingModel,
  AirportSettingsStore,
  AirportStore,
  EntityMapStore,
  updateAirportSidebarOptions,
  useAirportModuleSecurity,
} from '../../../Shared';
import { fields, monthOptions } from './Fields';
import { useStyles } from './OperationalInformation.styles';
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
  IOptionValue,
  ISelectOption,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  regex,
  IdNameCodeModel,
  SettingsTypeModel,
  GRID_ACTIONS,
  EntityMapModel,
  tapWithAction,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControlsGroup, IGroupInputControls } from '@wings-shared/form-controls';
import {
  ConfirmNavigate,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  ImportDialog,
  SidebarStore,
} from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props extends Partial<IBaseModuleProps> {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  entityMapStore?: EntityMapStore;
  sidebarStore?: typeof SidebarStore;
}

const OperationalInformation: FC<Props> = ({ airportStore, airportSettingsStore, entityMapStore, sidebarStore }) => {
  const backNavLink: string = '/airports';
  const params = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const useUpsert = useBaseUpsertComponent(params, fields, baseEntitySearchFilters);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const _airportSettingStore = airportSettingsStore as AirportSettingsStore;
  const _entityMapStore = entityMapStore as EntityMapStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();
  const [ customError, setCustomError ] = useState('');
  const profileUrl = useUpsert.getField('airportA2GAgentProfileBlobUrl').value || '';
  const [ agentProfile, setAgentProfile ] = useState(null);
  const [ largeAircraftOptions, setLargeAircraftOptions ] = useState<EntityMapModel[]>([]);

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    useUpsert.setViewMode((viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Operational Information', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    useUpsert.setFormValues(_selectedAirport.airportOperationalInfo);
    setRequiredRule();
  }, []);

  /* istanbul ignore next */
  const isProprietary = (): boolean => {
    // TODO: Enable in Release v1.14
    // return Utilities.isEqual(this.selectedAirport.appliedAirportType?.label, 'Proprietary');
    return false;
  };

  const jurisdictionOptions = (): ISelectOption[] => {
    return _airportStore.countries.map(
      jurisdiction =>
        new IdNameCodeModel({ ...jurisdiction, name: jurisdiction.commonName, code: jurisdiction.isO2Code })
    );
  };

  const metroOptions = (): ISelectOption[] => {
    return _airportStore.metros.map(metro => new SettingsTypeModel({ ...metro, name: metro.name }));
  };

  const getOptionDisabled = (option: ISelectOption, value: ISelectOption | ISelectOption[]) => {
    if (Array.isArray(value) && option?.label !== 'None') {
      return value.some(x => x.label === 'None');
    }
    return false;
  };

  const setRequiredRule = () => {
    const weightLimit = useUpsert.getField('weightLimit').value;
    if (!Boolean(weightLimit)) {
      useUpsert.getField('weightUOM').clear();
    }
    useUpsert.getField('weightUOM').set('rules', Boolean(weightLimit) ? 'required' : '');
    useUpsert.getField('weightUOM').validate();
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'isGAFriendly',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'customers',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: [],
            isDisabled: !isProprietary(),
          },
          {
            fieldKey: 'isMandatoryHandling',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            containerClass: classes.containerClass,
          },
          {
            fieldKey: 'airportCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportCategory,
          },
          {
            fieldKey: 'airportA2GAgentProfileBlobUrl',
            type: EDITOR_TYPES.TEXT_FIELD,
            isReadOnly: true,
            customErrorMessage: customError,
            endAdormentValue: <CloudUpload onClick={openAgentProfileDialog} className={classes.buttonStyle} />,
            customLabel: field => {
              if (!params.airportId || !Boolean(profileUrl)) {
                return field.label;
              }
              return (
                <>
                  <span>{field.label}</span>
                  <Tooltip title="View Agent Profile">
                    <InsertPhotoIcon className={classes.imageIcon} onClick={showProfile} />
                  </Tooltip>
                </>
              );
            },
          },
          {
            fieldKey: 'worldAwareLocationId',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'wingspanLimit',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weatherReportingSystem',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.weatherReportingSystem,
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
            containerClass: classes.containerClass,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'weightLimit',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'weightUOM',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.weightUOM,
            isDisabled: !useUpsert.getField('weightLimit').value,
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
            options: jurisdictionOptions(),
            isDisabled: !useUpsert.getField('isForeignBasedEntity').value,
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
            options: metroOptions(),
            isDisabled: true,
          },
          {
            fieldKey: 'appliedLargeAircraftRestrictions',
            type: EDITOR_TYPES.DROPDOWN,
            options: largeAircraftOptions,
            multiple: true,
            getOptionDisabled: (option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) =>
              getOptionDisabled(option, selectedOption),
          },
        ],
      },
      {
        title: 'ARFF Certification',
        inputControls: [
          {
            fieldKey: 'airportARFFCertification.classCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportClassCode,
          },
          {
            fieldKey: 'airportARFFCertification.certificateCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportCertificateCode,
          },
          {
            fieldKey: 'airportARFFCertification.serviceCode',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.airportServiceCode,
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
            containerClass: classes.containerClass,
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
            containerClass: classes.containerClass,
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
            options: _entityMapStore.fuelTypes,
          },
          {
            fieldKey: 'fuel.appliedOilTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _entityMapStore.oilTypes,
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
            containerClass: classes.containerClass,
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
            options: monthOptions(),
          },
          {
            fieldKey: 'airportParking.overnightParking',
            type: EDITOR_TYPES.DROPDOWN,
            options: _airportSettingStore.overnightParkings,
          },
          {
            fieldKey: 'airportParking.maximumParkingDuration',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Mins',
          },
          {
            fieldKey: 'airportParking.appliedParkingAlternateAirports',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _entityMapStore.airports.map(x => new EntityMapModel({ ...x, id: 0, entityId: x.id })),
          },
        ],
      },
    ];
  };

  /* istanbul ignore next */
  const showProfile = (): void => {
    const { airportA2GAgentProfileBlobAccessTokenUrl } = _selectedAirport.airportOperationalInfo;
    ModalStore.open(
      <Dialog
        title={_selectedAirport.title}
        open={true}
        onClose={() => ModalStore.close()}
        isLoading={() => useUpsert.loader.isLoading}
        classes={{ paperSize: classes.modalWidth, content: classes.content }}
        dialogContent={() => (
          <iframe
            src={agentProfile ? URL.createObjectURL(agentProfile) : airportA2GAgentProfileBlobAccessTokenUrl}
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
  };

  const uploadAgentProfile = (): Observable<AgentProfileModel> => {
    if (!agentProfile) {
      return of(new AgentProfileModel({ profileUrl }));
    }
    return _airportStore?.uploadAgentProfile(agentProfile, params.airportId || '') || of();
  };

  const checkIsFileTooLarge = file => {
    const isTooLarge = file.size > 10 * 1024 * 1024;
    setCustomError(isTooLarge ? 'File size must not exceed 10MB.' : '');
  };

  /* istanbul ignore next */
  const openAgentProfileDialog = (): void => {
    ModalStore.open(
      <ImportDialog
        title="Select Document"
        fileType="pdf"
        isLoading={() => useUpsert.isLoading}
        onUploadFile={file => {
          setAgentProfile(file);
          useUpsert.getField('airportA2GAgentProfileBlobUrl').sync();
          useUpsert.getField('airportA2GAgentProfileBlobUrl').set(file.name);
          ModalStore.close();
          checkIsFileTooLarge(file);
          return;
        }}
      />
    );
  };

  const upsertAirportOperationalInfo = (): void => {
    const { airportOperationalInfo } = _selectedAirport;
    const values = useUpsert.form.values();

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
      })
      : null;

    const request = new AirportOperationalInfoModel({
      ...airportOperationalInfo,
      ...values,
      fuel: _fuel,
      noise: { ...values.noise, id: _noiseId },
      airportARFFCertification: _arff,
      airportParking: _airportParking,
      airportId: params.airportId,
    });

    UIStore.setPageLoader(true);
    uploadAgentProfile()
      .pipe(
        switchMap(profileResponse =>
          _airportStore.upsertAirportOperationalInfo({
            ...request.serialize(),
            airportA2GAgentProfileBlobUrl: profileResponse.profileUrl || '',
          })
        ),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          _airportStore.setSelectedAirport({
            ..._selectedAirport,
            airportOperationalInfo: response,
          });
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
          setRequiredRule();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirportOperationalInfo();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params?.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          useUpsert.setFormValues(_selectedAirport?.airportOperationalInfo);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink, useUpsert.noBlocker);
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'isForeignBasedEntity':
        useUpsert.getField('jurisdiction').clear();
        break;
      case 'appliedLargeAircraftRestrictions':
        const _value = value as ISelectOption[];
        const isNone = _value.some(item => Utilities.isEqual(item.label, 'None'));
        if (isNone) {
          const filteredValue = _value.filter(item => Utilities.isEqual(item.label, 'None'));
          useUpsert.getField(fieldKey).set(filteredValue);
        }
        break;
      case 'weightLimit':
        setRequiredRule();
        break;
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'airportCategory':
        useUpsert.observeSearch(_airportSettingStore.loadAirportCategory());
        break;
      case 'weatherReportingSystem':
        useUpsert.observeSearch(_airportSettingStore.loadWeatherReportingSystem());
        break;
      case 'classCode':
        useUpsert.observeSearch(_airportSettingStore.loadClassCode());
        break;
      case 'certificateCode':
        useUpsert.observeSearch(_airportSettingStore.loadCertificateCode());
        break;
      case 'weightUOM':
        useUpsert.observeSearch(_airportSettingStore.getWeightUOM());
        break;
      case 'serviceCode':
        useUpsert.observeSearch(_airportSettingStore.loadServiceCode());
        break;
      case 'appliedFuelTypes':
      case 'appliedOilTypes':
        useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
        break;
      case 'appliedLargeAircraftRestrictions':
        useUpsert.observeSearch(
          _airportSettingStore.loadLargeAircraftRestriction().pipe(
            tapWithAction(response => {
              const options = response.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
              setLargeAircraftOptions(options);
            })
          )
        );
        break;
      case 'overnightParking':
        useUpsert.observeSearch(_airportSettingStore.loadOvernightParkings());
        break;
    }
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'jurisdiction':
        if (!searchValue) {
          _airportStore.countries = [];
          return;
        }
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        useUpsert.observeSearch(_airportStore.getCountries(countryRequest));
        break;
      case 'metro':
        const metroRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.METRO);
        useUpsert.observeSearch(_airportStore.getMetros(metroRequest));
        break;
      case 'appliedParkingAlternateAirports':
        if (!searchValue) {
          _entityMapStore.airports = [];
          return;
        }
        useUpsert.observeSearch(_entityMapStore.searchEntities(searchValue, fieldKey));
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport.title}
        backNavLink={backNavLink}
        backNavTitle="Airports"
        isActive={_selectedAirport.isActive}
        disableActions={
          useUpsert.form.hasError ||
          UIStore.pageLoading ||
          !useUpsert.form.changed ||
          Boolean(customError)
        }
        isEditMode={useUpsert.isEditable}
        hasEditPermission={airportModuleSecurity.isEditable}
        onAction={onAction}
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
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'airportStore',
  'airportSettingsStore',
  'entityMapStore',
  'sidebarStore'
)(observer(OperationalInformation));
