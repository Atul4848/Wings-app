import { Checkbox, FormLabel } from '@material-ui/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPIPageResponse,
  IOptionValue,
  ISelectOption,
  IdNameCodeModel,
  SEARCH_ENTITY_TYPE,
  SettingsTypeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  tapWithAction,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import {
  AirportModel,
  BaseAirportStore,
  CountryModel,
  FARTypeModel,
  FIRModel,
  ModelStatusOptions,
  StateModel,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Observable, forkJoin, of } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  SCHEDULE_RESTRICTIONS_LEVEL,
  ScheduleRestrictionEntityModel,
  ScheduleRestrictionsModel,
  ScheduleRestrictionsStore,
  SettingsStore,
  updateRestrictionSidebarOptions,
  useRestrictionModuleSecurity,
} from '../../Shared';
import { fields } from './Fields';
import { useStyles } from './UpsertScheduleRestrictions.styles';

export type LevelEntityType =
  | ScheduleRestrictionEntityModel
  | ISelectOption
  | CountryModel
  | StateModel
  | AirportModel
  | FARTypeModel
  | FIRModel;

interface Props {
  viewMode?: VIEW_MODE;
  scheduleRestrictionsStore?: ScheduleRestrictionsStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const UpsertScheduleRestrictions: FC<Props> = ({ ...props }) => {
  const backNavLink: string = '/restrictions/schedule-restrictions';
  const [ scheduleRestriction, setScheduleRestriction ] = useState<ScheduleRestrictionsModel>(
    new ScheduleRestrictionsModel()
  );
  const _baseAirportStore = useMemo(() => new BaseAirportStore(), []);
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _scheduleRestrictionsStore = props.scheduleRestrictionsStore as ScheduleRestrictionsStore;
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<ScheduleRestrictionsModel>(params, fields, baseEntitySearchFilters);
  const scheduleRestrictionId = Utilities.getNumberOrNullValue(params.scheduleRestrictionId);
  const classes = useStyles();
  const restrictionModuleSecurity = useRestrictionModuleSecurity()

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    _sidebarStore.setNavLinks(updateRestrictionSidebarOptions('Schedule Restrictions'), 'restrictions');
    loadData();
  }, []);

  /* istanbul ignore next */
  const arrivalLevel = (): SCHEDULE_RESTRICTIONS_LEVEL => {
    return useUpsert.getField('arrivalLevel').value?.label;
  };

  /* istanbul ignore next */
  const departureLevel = (): SCHEDULE_RESTRICTIONS_LEVEL => {
    return useUpsert.getField('departureLevel').value?.label;
  };

  /* istanbul ignore next */
  const overFlightLevel = (): SCHEDULE_RESTRICTIONS_LEVEL => {
    return useUpsert.getField('overFlightLevel').value?.label;
  };

  /* istanbul ignore next */
  const startAdornment = (fieldKey: string, disabled: boolean): ReactNode => {
    return (
      <div className={classNames({ [classes.labelRoot]: true, [classes.labelRootDisable]: disabled })}>
        <FormLabel>All</FormLabel>
        <Checkbox
          disabled={disabled}
          checked={useUpsert.getField(fieldKey).value}
          value={useUpsert.getField(fieldKey).value}
          onChange={(e, checked) => {
            onValueChange(checked, fieldKey);
            useUpsert.getField(fieldKey).sync(e);
          }}
          className={classes.checkboxRoot}
        />
      </div>
    );
  };

  /* istanbul ignore next */
  const requestModel = (): ScheduleRestrictionsModel => {
    const modelData: ScheduleRestrictionsModel = useUpsert.form.values();
    return new ScheduleRestrictionsModel({
      ...scheduleRestriction,
      ...modelData,
      farTypes: modelData.farTypes?.map(entity => mapEntity(entity, SCHEDULE_RESTRICTIONS_LEVEL.FAR_TYPE)),
      restrictingEntities: modelData.restrictingEntities?.map(entity =>
        mapEntity(entity, SCHEDULE_RESTRICTIONS_LEVEL.COUNTRY)
      ),
      arrivalLevelEntities: modelData.arrivalLevelEntities?.map(entity => mapEntity(entity, arrivalLevel())),
      departureLevelEntities: modelData.departureLevelEntities?.map(entity => mapEntity(entity, departureLevel())),
      overFlightLevelEntities: modelData.overFlightLevelEntities?.map(entity => mapEntity(entity, overFlightLevel())),
      departureEntityExceptions: modelData.departureEntityExceptions?.map(entity =>
        mapEntity(entity, departureLevel())
      ),
      arrivalEntityExceptions: modelData.arrivalEntityExceptions?.map(entity => mapEntity(entity, arrivalLevel())),
      overFlightEntityExceptions: modelData.overFlightEntityExceptions?.map(entity =>
        mapEntity(entity, overFlightLevel())
      ),
    });
  };

  /* istanbul ignore next */
  // Get Level Entities based on related level field
  const getEntitiesOptions = (fieldLevel: SCHEDULE_RESTRICTIONS_LEVEL): LevelEntityType[] => {
    switch (fieldLevel) {
      case SCHEDULE_RESTRICTIONS_LEVEL.STATE:
        return _scheduleRestrictionsStore.states;
      case SCHEDULE_RESTRICTIONS_LEVEL.AIRPORT:
        return _baseAirportStore.wingsAirports;
      case SCHEDULE_RESTRICTIONS_LEVEL.COUNTRY:
        return _scheduleRestrictionsStore.countries;
      case SCHEDULE_RESTRICTIONS_LEVEL.FIR:
        return _scheduleRestrictionsStore.firs;
      default:
        return [];
    }
  };

  /* istanbul ignore next */
  // Get Level Entities based on related level field
  const getEntityLabel = (entity: LevelEntityType, fieldKey: SCHEDULE_RESTRICTIONS_LEVEL): string => {
    if ((entity as ScheduleRestrictionEntityModel).entityId) {
      return entity.label;
    }
    switch (fieldKey) {
      case SCHEDULE_RESTRICTIONS_LEVEL.STATE:
        return (entity as StateModel).entityCode;
      case SCHEDULE_RESTRICTIONS_LEVEL.AIRPORT:
        return (entity as AirportModel).displayCode;
      case SCHEDULE_RESTRICTIONS_LEVEL.COUNTRY:
        return (entity as CountryModel).isO2Code;
      case SCHEDULE_RESTRICTIONS_LEVEL.FAR_TYPE:
        return (entity as FARTypeModel).cappsCode;
      case SCHEDULE_RESTRICTIONS_LEVEL.FIR:
        return (entity as FIRModel).code;
      default:
        return '';
    }
  };

  /* istanbul ignore next */
  // get selected option for AUTO Complete
  const getOptionSelected = (currentOption: ISelectOption, values: ISelectOption | ISelectOption[]): boolean => {
    if (!values) {
      return false;
    }
    if (Array.isArray(values)) {
      return values.map(options => options.value).includes(currentOption.value);
    }
    const { id, entityId } = values as ScheduleRestrictionEntityModel;
    return Utilities.isEqual((currentOption as IdNameCodeModel)?.id, entityId || id);
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'restrictionType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.restrictionTypes,
          },
          {
            fieldKey: 'restrictingEntities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: _scheduleRestrictionsStore.countries,
            isDisabled: !Boolean(useUpsert.getField('restrictionType').value?.label),
            getChipLabel: option => getEntityLabel(option, SCHEDULE_RESTRICTIONS_LEVEL.COUNTRY),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'departureLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.scheduleDepartureLevels,
          },
          {
            fieldKey: 'departureLevelEntities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(departureLevel()),
            isDisabled: !Boolean(departureLevel()) || useUpsert.getField('isAllDeparture').value,
            getChipLabel: option => getEntityLabel(option, departureLevel()),
            getOptionSelected: (option, value) => getOptionSelected(option, value),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
            startAdornment: startAdornment('isAllDeparture', !Boolean(departureLevel())),
            isAllOptionsSelected: useUpsert.getField('isAllDeparture').value,
          },
          {
            fieldKey: 'departureEntityExceptions',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(departureLevel()),
            isDisabled: !useUpsert.getField('isAllDeparture').value,
            getChipLabel: option => getEntityLabel(option, departureLevel()),
            getOptionSelected: (option, value) => getOptionSelected(option, value),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'arrivalLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.arrivalLevels,
          },
          {
            fieldKey: 'arrivalLevelEntities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(arrivalLevel()),
            isDisabled: !Boolean(arrivalLevel()) || useUpsert.getField('isAllArrival').value,
            getChipLabel: option => getEntityLabel(option, arrivalLevel()),
            getOptionSelected: (option, value) => getOptionSelected(option, value),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
            startAdornment: startAdornment('isAllArrival', !Boolean(arrivalLevel())),
            isAllOptionsSelected: useUpsert.getField('isAllArrival').value,
          },
          {
            fieldKey: 'arrivalEntityExceptions',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(arrivalLevel()),
            isDisabled: !useUpsert.getField('isAllArrival').value,
            getChipLabel: option => getEntityLabel(option, arrivalLevel()),
            getOptionSelected: (option, value) => getOptionSelected(option, value),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'overFlightLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.overflightLevels,
          },
          {
            fieldKey: 'overFlightLevelEntities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(overFlightLevel()),
            isDisabled: !Boolean(overFlightLevel()) || useUpsert.getField('isAllOverFlight').value,
            getChipLabel: option => getEntityLabel(option, overFlightLevel()),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
            startAdornment: startAdornment('isAllOverFlight', !Boolean(overFlightLevel())),
            isAllOptionsSelected: useUpsert.getField('isAllOverFlight').value,
          },
          {
            fieldKey: 'overFlightEntityExceptions',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            showChipTooltip: true,
            isLoading: useUpsert.loader.isLoading,
            options: getEntitiesOptions(overFlightLevel()),
            isDisabled: !Boolean(useUpsert.getField('isAllOverFlight').value),
            getChipLabel: option => getEntityLabel(option, overFlightLevel()),
            getOptionSelected: (option, value) => getOptionSelected(option, value),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'farTypes',
            multiple: true,
            showChipTooltip: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.farTypes,
            getChipLabel: option => getEntityLabel(option, SCHEDULE_RESTRICTIONS_LEVEL.FAR_TYPE),
            getChipTooltip: option => (option as ScheduleRestrictionEntityModel)?.entityName,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('endDate').value,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('startDate').value,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'validatedDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
          },
          {
            fieldKey: 'validatedBy',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: '',
        inputControlClassName: classes.validationNotes,
        inputControls: [
          {
            fieldKey: 'validationNotes',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 3,
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

  /* istanbul ignore next */
  const loadData = (): void => {
    UIStore.setPageLoader(true);
    forkJoin([
      loadScheduleRestriction(),
      _settingsStore.getRestrictionTypes(),
      _settingsStore.getScheduleDepartureLevels(),
      _settingsStore.getArrivalLevels(),
      _settingsStore.getOverflightLevels(),
      loadBaseOptions(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadBaseOptions = (): Observable<[SettingsTypeModel[], SettingsTypeModel[], FARTypeModel[]]> => {
    /* eslint-disable max-len */
    return forkJoin([ _settingsStore.getAccessLevels(), _settingsStore.getSourceTypes(), _settingsStore.getFarTypes() ]);
  };

  /* istanbul ignore next */
  const loadScheduleRestriction = (): Observable<IAPIPageResponse<ScheduleRestrictionsModel>> | Observable<null> => {
    if (!scheduleRestrictionId) {
      return of(null);
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        { propertyName: 'ScheduleRestrictionId', propertyValue: scheduleRestrictionId },
      ]),
    };

    return _scheduleRestrictionsStore.getScheduleRestrictions(request).pipe(
      tapWithAction((response: IAPIPageResponse) => {
        setScheduleRestriction(response.results[0]);
        useUpsert.setFormValues(response.results[0]);
        setRestrictionsRules();
      })
    );
  };

  /* istanbul ignore next */
  const upsertScheduleRestriction = (): void => {
    UIStore.setPageLoader(true);
    _scheduleRestrictionsStore
      .upsertScheduleRestrictions(requestModel().serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (_scheduleRestriction: ScheduleRestrictionsModel) => {
          const _requestId = scheduleRestriction?.id;
          setScheduleRestriction(_scheduleRestriction);
          useUpsert.form.reset();
          useUpsert.form.set(_scheduleRestriction);
          const viewMode = params.viewMode?.toUpperCase();
          // if new schedule restriction then redirect to edit screen
          if (!Boolean(_requestId) && viewMode === VIEW_MODE.NEW) {
            navigate(`${backNavLink}/${_scheduleRestriction.id}/edit`);
            return;
          }
          if (viewMode === VIEW_MODE.DETAILS) {
            useUpsert.setViewMode(VIEW_MODE.DETAILS);
          }
        },
        error: error => useUpsert.showAlert(error.message, 'upsertScheduleRestriction'),
      });
  };

  // map Different Entities models to the ScheduleRestrictionEntityModel
  /* istanbul ignore next */
  const mapEntity = (
    entity: ScheduleRestrictionEntityModel,
    entityType: SCHEDULE_RESTRICTIONS_LEVEL
  ): ScheduleRestrictionEntityModel => {
    if (entity.entityId) {
      return entity;
    }
    return new ScheduleRestrictionEntityModel({
      entityId: entity.id,
      code: getEntityLabel(entity, entityType), // get entity code based on the entity type
    });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertScheduleRestriction();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        confirmClose();
        break;
    }
  };

  const confirmClose = (): void => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode !== VIEW_MODE.DETAILS) {
      navigate(backNavLink, useUpsert.noBlocker);
      return;
    }
    if (!(useUpsert.form.touched || useUpsert.form.changed)) {
      onCancel();
      return;
    }
    _useConfirmDialog.confirmAction(() => {
      onCancel();
      ModalStore.close();
    }, {});
  };

  const onCancel = () => {
    const viewMode = params.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(scheduleRestriction);
      return;
    }
    navigate(backNavLink);
  };

  /* istanbul ignore next */
  const clearEntityOptions = () => {
    _scheduleRestrictionsStore.states = [];
    _scheduleRestrictionsStore.wingsAirports = [];
    _scheduleRestrictionsStore.countries = [];
    _scheduleRestrictionsStore.firs = [];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    switch (fieldKey) {
      case 'restrictionType':
        useUpsert.getField('restrictingEntities').set([]);
        setRestrictionsRules();
        break;
      case 'departureLevel':
        if (!value) {
          useUpsert.getField('isAllDeparture').set(false);
        }
        useUpsert.getField('departureLevelEntities').set([]);
        useUpsert.getField('departureEntityExceptions').set([]);
        break;
      case 'arrivalLevel':
        if (!value) {
          useUpsert.getField('isAllArrival').set(false);
        }
        useUpsert.getField('arrivalLevelEntities').set([]);
        useUpsert.getField('arrivalEntityExceptions').set([]);
        break;
      case 'overFlightLevel':
        if (!value) {
          useUpsert.getField('isAllOverFlight').set(false);
        }
        useUpsert.getField('overFlightLevelEntities').set([]);
        useUpsert.getField('overFlightEntityExceptions').set([]);
        break;
      case 'isAllDeparture':
        useUpsert.getField('departureLevelEntities').set([]);
        useUpsert.getField('departureEntityExceptions').set([]);
        clearEntityOptions();
        break;
      case 'isAllArrival':
        useUpsert.getField('arrivalLevelEntities').set([]);
        useUpsert.getField('arrivalEntityExceptions').set([]);
        clearEntityOptions();
        break;
      case 'isAllOverFlight':
        useUpsert.getField('overFlightLevelEntities').set([]);
        useUpsert.getField('overFlightEntityExceptions').set([]);
        clearEntityOptions();
        break;
    }
  };

  /* istanbul ignore next */
  const setRestrictionsRules = (): void => {
    const restrictionType = useUpsert.getField('restrictionType').value?.label;
    const isLanding = Utilities.isEqual(restrictionType, 'Landing');
    const isOverflight = Utilities.isEqual(restrictionType, 'Overflight');
    useUpsert.setFormRules('arrivalLevel', isLanding, fields.arrivalLevel.label);
    useUpsert.setFormRules('overFlightLevel', isOverflight, fields.overFlightLevel.label);
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string): void => {
    // Related Field field from fields
    const relatedField = fields[fieldKey]?.relatedField;
    const fieldLevel: string = relatedField ? useUpsert.getField(relatedField).value?.label : fieldKey;
    const request: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, fieldLevel as SEARCH_ENTITY_TYPE);

    switch (fieldLevel) {
      case SEARCH_ENTITY_TYPE.STATE:
        useUpsert.observeSearch(_scheduleRestrictionsStore.getStates(request, true));
        break;
      case SEARCH_ENTITY_TYPE.AIRPORT:
        useUpsert.observeSearch(_baseAirportStore.searchWingsAirports(searchValue, true));
        break;
      case SEARCH_ENTITY_TYPE.COUNTRY:
      case 'restrictingEntities':
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        useUpsert.observeSearch(_scheduleRestrictionsStore.getCountries(countryRequest, true));
        break;
      case SEARCH_ENTITY_TYPE.FAR_TYPE:
        useUpsert.observeSearch(_settingsStore.getFarTypes());
        break;
      case SEARCH_ENTITY_TYPE.FIR:
        useUpsert.observeSearch(_scheduleRestrictionsStore.getFIRs(request));
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavLink={backNavLink}
        backNavTitle="Schedule Restrictions"
        disableActions={useUpsert.form.hasError || UIStore.pageLoading || !useUpsert.form.changed}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={restrictionModuleSecurity.isEditable}
        onAction={onAction}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed || useUpsert.form.touched}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={useUpsert.isEditable}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
        />
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'scheduleRestrictionsStore',
  'settingsStore',
  'sidebarStore'
)(observer(UpsertScheduleRestrictions));
