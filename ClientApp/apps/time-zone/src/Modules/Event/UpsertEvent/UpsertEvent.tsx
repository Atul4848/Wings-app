import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPIPageResponse,
  IAPISearchFilter,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  BaseAirportStore,
  CityModel,
  IBaseModuleProps,
  ModelStatusOptions,
  StateModel,
  VIEW_MODE,
  useBaseUpsertComponent,
} from '@wings/shared';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { EventModel, EventStore, TimeZoneSettingsStore, updateTimezoneSidebarOptions } from '../../Shared';
import { useNavigate, useParams } from 'react-router';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { fields } from './Fields';
import { useGeographicModuleSecurity } from '../../Shared/Tools';
import { useStyles } from './UpsertEvent.styles';
import { EventRepeatIcon } from '@uvgo-shared/icons';
import { PrimaryButton } from '@uvgo-shared/buttons';
import {
  HoursTimeModel,
  RecurrenceDialogV2,
  RecurrenceModel,
  RecurrencePatternModel,
  RecurrenceRangeModel,
  SCHEDULE_TYPE,
  ScheduleModel,
  scheduleTypeOptions,
} from '@wings-shared/scheduler';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props extends IBaseModuleProps {
  viewMode?: VIEW_MODE;
  params?: { viewMode: VIEW_MODE; eventId: string };
  eventStore?: EventStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const UpsertEvent: FC<Props> = ({ viewMode, eventStore, timeZoneSettingsStore, sidebarStore }: Props) => {
  const navigate = useNavigate();
  const _eventStore = eventStore as EventStore;
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const params = useParams();
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const backNavLink: string = '/geographic/events';
  const useUpsert = useBaseUpsertComponent<EventModel>(params, fields, baseEntitySearchFilters);
  const baseAirportStore = useMemo(() => new BaseAirportStore(), []);
  const [ eventDetails, setEventDetails ] = useState(new EventModel());
  const _useConfirmDialog = useConfirmDialog();
  const geographicModuleSecurity = useGeographicModuleSecurity();
  const errorMessage = 'Combination of Name, Start Date, End Date, Country and Region should be unique.';

  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('World Events'), 'geographic');
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadEvents();
  }, []);

  // used to implement logic on start date
  const hasStartDate = (): boolean => {
    return Boolean(useUpsert.getField('eventSchedule.startDate').value);
  };

  /* istanbul ignore next */
  const setFormData = (model: EventModel): void => {
    useUpsert.setFormValues(model);
    useUpsert.getField('eventSchedule.isRecurrence').set(model?.eventSchedule?.isRecurring);
  };

  /* istanbul ignore next */
  const citySearchFilters = (): IAPISearchFilter[] => {
    const countryId: number = useUpsert.getField('country').value?.id;
    const stateIds: number[] = useUpsert.getField('states').value?.map(state => state.id);
    if (stateIds.length) {
      return [{ propertyName: 'State.StateId', propertyValue: stateIds, filterType: 'in' }];
    }
    return countryId ? [ Utilities.getFilter('Country.CountryId', countryId) ] : [];
  };

  /* istanbul ignore next */
  const updatedEventSchedule = (): ScheduleModel => {
    const schedule = new ScheduleModel({
      ...eventDetails.eventSchedule,
      ...useUpsert.getField('eventSchedule').value,
      isRecurrence: undefined,
      startTime: new HoursTimeModel({ ...useUpsert.getField('eventSchedule.startTime').value }),
      endTime: new HoursTimeModel({ ...useUpsert.getField('eventSchedule.endTime').value }),
      patternedRecurrence: new RecurrenceModel({
        ...eventDetails.eventSchedule?.patternedRecurrence,
        recurrenceRange: new RecurrenceRangeModel({
          ...eventDetails.eventSchedule?.patternedRecurrence?.recurrenceRange,
          startDate: useUpsert.getField('eventSchedule.startDate').value,
          endDate: useUpsert.getField('eventSchedule.endDate').value,
        }),
      }),
    });
    return schedule;
  };

  /* istanbul ignore next */
  const invalidTimeMessage = (): string => {
    const startTime = useUpsert.getField('eventSchedule.startTime.time').value;
    const endTime = useUpsert.getField('eventSchedule.endTime.time').value;
    const isValidTime = Utilities.compareDateTime(
      Utilities.getformattedDate(startTime, DATE_FORMAT.APPOINTMENT_TIME),
      Utilities.getformattedDate(endTime, DATE_FORMAT.APPOINTMENT_TIME),
      DATE_FORMAT.APPOINTMENT_TIME
    );
    return isValidTime ? '' : 'End Time Should be after the Start Time.';
  };

  const validateEvent = (): void => {
    const { name, region, country, eventSchedule } = useUpsert.form.values();
    const startDate = Utilities.getformattedDate(eventSchedule.startDate, DATE_FORMAT.API_DATE_FORMAT);
    const endDate = Utilities.getformattedDate(eventSchedule.endDate, DATE_FORMAT.API_DATE_FORMAT);
    if (
      !Boolean(name) ||
      !Boolean(region?.name) ||
      !Boolean(country?.commonName) ||
      !Boolean(startDate) ||
      !Boolean(endDate)
    )
      return;
    const filters: IAPISearchFilter[] = [
      Utilities.getFilter('Name', name),
      Utilities.getFilter('Regions.Name', region.name),
      Utilities.getFilter('Countries.Name', country.commonName),
    ];
    _eventStore
      .getEvents({
        pageSize: 0,
        filterCollection: JSON.stringify(filters),
      })
      .pipe()
      .subscribe(({ results }) => {
        const filterExistingEvent = results.filter(x => x.id !== Number(params.eventId));
        const isExist = filterExistingEvent.some(
          x =>
            Utilities.isEqual(
              startDate,
              Utilities.getformattedDate(x.eventSchedule?.startDate, DATE_FORMAT.API_DATE_FORMAT)
            ) &&
            Utilities.isEqual(
              endDate,
              Utilities.getformattedDate(x.eventSchedule?.endDate, DATE_FORMAT.API_DATE_FORMAT)
            )
        );
        useUpsert.setIsAlreadyExistMap(new Map(useUpsert.isAlreadyExistMap.set('event', isExist)));
      });
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General Information',
        inputControls: [
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('event') ? errorMessage : '',
          },
          {
            fieldKey: 'description',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'eventType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.worldEventTypes,
          },
          {
            fieldKey: 'eventCategory',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.worldEventCategories,
          },
          {
            fieldKey: 'specialConsiderations',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.worldEventSpecialConsiderations,
            multiple: true,
          },
          {
            fieldKey: 'uaOffice',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneSettingsStore.uaOffices,
          },
          {
            fieldKey: 'region',
            type: EDITOR_TYPES.DROPDOWN,
            options: _eventStore.regions,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('event') ? errorMessage : '',
          },
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            options: _eventStore.countries,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('event') ? errorMessage : '',
          },
          {
            fieldKey: 'states',
            type: EDITOR_TYPES.DROPDOWN,
            options: _eventStore.states,
            getChipLabel: option => (option as StateModel)?.commonName,
            multiple: true,
          },
          {
            fieldKey: 'cities',
            type: EDITOR_TYPES.DROPDOWN,
            options: _eventStore.cities,
            getChipLabel: city => (city as CityModel)?.commonName,
            multiple: true,
          },
          {
            fieldKey: 'airports',
            type: EDITOR_TYPES.DROPDOWN,
            options: baseAirportStore.wingsAirports,
            multiple: true,
          },
          {
            fieldKey: 'url',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'isMajorEvent',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
      {
        title: 'Time Details',
        inputControls: [
          {
            fieldKey: 'beginPlanning',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: '(days prior)',
          },
          {
            fieldKey: 'eventSchedule.startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('eventSchedule.endDate').value,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('event') ? errorMessage : '',
          },
          {
            fieldKey: 'eventSchedule.endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('eventSchedule.startDate').value,
            isDisabled: !hasStartDate,
            customErrorMessage: useUpsert.isAlreadyExistMap.get('event') ? errorMessage : '',
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'eventSchedule.is24Hours',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'eventSchedule.startTime.time',
            type: EDITOR_TYPES.TIME,
            dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
            maxDate: updatedEventSchedule()?.endDateTime,
            isDisabled: Boolean(useUpsert.getField('eventSchedule.is24Hours').value),
            allowKeyboardInput: false,
          },
          {
            fieldKey: 'eventSchedule.endTime.time',
            type: EDITOR_TYPES.TIME,
            dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
            minDate: updatedEventSchedule()?.startDateTime,
            isDisabled: Boolean(useUpsert.getField('eventSchedule.is24Hours').value),
            customErrorMessage: invalidTimeMessage(),
            allowKeyboardInput: false,
          },
          {
            fieldKey: 'eventSchedule.isRecurrence',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: !updatedEventSchedule()?.isRecurring,
          },
          {
            fieldKey: 'eventSchedule.recurrenceMessage',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 4,
            isDisabled: true,
          },
          {
            fieldKey: 'notes',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 4,
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

  // Set Cities and states references for validation
  /* istanbul ignore next */
  const setCitiesMappedWithStates = () => {
    if (!useUpsert.isEditable) {
      return;
    }
    // City related filters
    const cityIds: number[] = useUpsert.getField('cities').value.map(city => city.id);
    const cityFilters = useUpsert.getFilterRequest(SEARCH_ENTITY_TYPE.CITY, [
      { propertyName: 'CityId', propertyValue: cityIds, filterType: 'in' },
    ]);
    UIStore.setPageLoader(true);
    _eventStore
      .getCities({ ...cityFilters, specifiedFields: [] })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(({ results }) => useUpsert.getField('cities').set(results));
  };

  /* istanbul ignore next */
  const loadEvents = (): void => {
    if (!params.eventId) {
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'WorldEventId', propertyValue: params.eventId }]),
    };
    UIStore.setPageLoader(true);
    _eventStore
      .getEvents(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        setEventDetails(response.results[0]);
        setFormData(response.results[0]);
        setCitiesMappedWithStates();
      });
  };

  const upsertEvent = (): void => {
    const model = new EventModel({
      ...eventDetails,
      ...useUpsert.form.values(),
      eventSchedule: updatedEventSchedule(),
    });
    UIStore.setPageLoader(true);
    _eventStore
      .upsertEvent(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (responseModel: EventModel) => {
          setEventDetails(responseModel);
          useUpsert.form.reset();
          setFormData(responseModel);
        },
        error: error => useUpsert.showAlert(error.message, 'upsertEvent'),
      });
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertEvent();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        setCitiesMappedWithStates();
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode, VIEW_MODE.DETAILS)) {
          useUpsert.form.reset();
          setFormData(eventDetails);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate(backNavLink);
        break;
    }
  };

  /* istanbul ignore next */
  const updateSchedule = (eventSchedule: ScheduleModel): void => {
    const updateSetEventDetails = new EventModel({
      ...eventDetails,
      ...useUpsert.form.values(),
      eventSchedule,
    });
    setEventDetails(updateSetEventDetails);
    useUpsert.getField('eventSchedule.isRecurrence').sync();
    setFormData(updateSetEventDetails);
    useUpsert.form.validate();
  };

  /* istanbul ignore next */
  const showRecurrenceDialog = (): void => {
    ModalStore.open(
      <RecurrenceDialogV2
        scheduleData={
          new ScheduleModel({
            ...updatedEventSchedule(),
            scheduleType: scheduleTypeOptions[0], // Make Event recurrence type
          })
        }
        isLoading={() => false}
        isEditable={useUpsert.isEditable}
        hasPermission={geographicModuleSecurity.isEventEditable}
        onSave={(scheduleTypeId: SCHEDULE_TYPE, eventSchedule: ScheduleModel) => {
          updateSchedule(eventSchedule);
          ModalStore.close();
        }}
      />
    );
  };

  /* istanbul ignore next */
  const confirmRemoveRecurrence = (): void => {
    _useConfirmDialog.confirmAction(
      () => {
        {
          const patternedRecurrence = eventDetails.eventSchedule?.patternedRecurrence;
          updateSchedule(
            new ScheduleModel({
              ...eventDetails.eventSchedule,
              scheduleType: ScheduleModel.getScheduleType(SCHEDULE_TYPE.SINGLE_INSTANCE),
              patternedRecurrence: new RecurrenceModel({
                id: patternedRecurrence?.id,
                recurrencePattern: new RecurrencePatternModel({
                  id: patternedRecurrence?.recurrencePattern?.id,
                  patternedRecurrenceId: patternedRecurrence?.recurrencePattern?.patternedRecurrenceId,
                }),
                recurrenceRange: new RecurrenceRangeModel({
                  id: patternedRecurrence?.recurrenceRange?.id,
                  patternedRecurrenceId: patternedRecurrence?.recurrenceRange?.patternedRecurrenceId,
                }),
              }),
            })
          );
          ModalStore.close();
        }
      },
      {
        onNo: () => {
          useUpsert.getField('eventSchedule.isRecurrence').set(true);
          ModalStore.close();
        },
        title: 'Confirm Remove',
        message: 'Are you sure you want to remove the Recurrence?',
      }
    );
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);

    switch (fieldKey) {
      case 'name':
      case 'eventSchedule.endDate':
        validateEvent();
        break;
      case 'eventSchedule.is24Hours':
        if (value) {
          useUpsert.getField('eventSchedule.startTime.time').set(Utilities.getDateTime(0, 1));
          useUpsert.getField('eventSchedule.endTime.time').set(Utilities.getDateTime(23, 59));
        }
        break;
      case 'eventSchedule.startDate':
        if (!value) {
          useUpsert.getField('eventSchedule.endDate').clear();
        }
        validateEvent();
        break;
      case 'eventSchedule.startTime.time':
        if (!value) {
          useUpsert.getField('eventSchedule.endTime.time').clear();
        }
        break;
      case 'region':
        // clear region
        if (!value) {
          _eventStore.regions = [];
        }
        validateEvent();
        break;
      case 'country':
        // clear countries
        if (!value) {
          _eventStore.countries = [];
        }
        _eventStore.cities = [];
        _eventStore.states = [];
        useUpsert.clearFormFields([ 'states', 'cities' ]);
        validateEvent();
        break;
      case 'states':
        if (!value) {
          _eventStore.states = [];
        }
        _eventStore.cities = [];
        const selectedStates = (value as StateModel[]).map(x => x.id);
        const filterCities = useUpsert
          .getField('cities')
          .value?.filter(({ state }: CityModel) => selectedStates.includes(state.id));
        useUpsert.getField('cities').set(filterCities);
        break;
      case 'eventSchedule.isRecurrence':
        if (!value) {
          confirmRemoveRecurrence();
        }
        break;
      default:
        useUpsert.getField(fieldKey).set(value);
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'eventCategory':
        useUpsert.observeSearch(_timeZoneSettingsStore.getWorldEventCategory());
        break;
      case 'eventType':
        useUpsert.observeSearch(_timeZoneSettingsStore.getWorldEventTypes());
        break;
      case 'uaOffice':
        useUpsert.observeSearch(_timeZoneSettingsStore.loadUAOffices());
        break;
      case 'specialConsiderations':
        useUpsert.observeSearch(_timeZoneSettingsStore.getWorldEventSpecialConsiderations());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_timeZoneSettingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_timeZoneSettingsStore.getSourceTypes());
        break;
    }
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'states':
        if (!searchValue) {
          _eventStore.states = [];
          return;
        }
        const countryId: number = useUpsert.getField('country').value?.id;
        const stateRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.STATE, [
          Utilities.getNotFilter('CappsCode'),
          ...(countryId ? [ Utilities.getFilter('Country.CountryId', countryId) ] : []),
        ]);
        useUpsert.observeSearch(_eventStore.getStates(stateRequest));
        break;
      case 'cities':
        if (!searchValue) {
          _eventStore.cities = [];
          return;
        }
        const cityRequest = useUpsert.getSearchRequest(
          searchValue, SEARCH_ENTITY_TYPE.CITY, [ ...citySearchFilters() ]);
        useUpsert.observeSearch(_eventStore.getCities({ ...cityRequest, specifiedFields: [] }));
        break;
      case 'airports':
        if (!searchValue) {
          baseAirportStore.wingsAirports = [];
          return;
        }
        useUpsert.observeSearch(baseAirportStore.searchWingsAirports(searchValue));
        break;
      case 'country':
        if (!searchValue) {
          _eventStore.countries = [];
          return;
        }
        const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
        useUpsert.observeSearch(_eventStore.getCountries(countryRequest));
        break;
      case 'region':
        if (!searchValue) {
          _eventStore.regions = [];
          return;
        }
        const regionRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.REGION);
        useUpsert.observeSearch(_eventStore.getRegions(regionRequest));
        break;
    }
  };

  /* istanbul ignore next */
  const disableSaveButton = (): boolean => {
    return (
      useUpsert.form.hasError ||
      UIStore.pageLoading ||
      !useUpsert.form.changed ||
      invalidTimeMessage() ||
      useUpsert.isAlreadyExistMap.get('event')
    );
  };

  /* istanbul ignore next */
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavLink={backNavLink}
        backNavTitle="Events"
        disableActions={disableSaveButton()}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={geographicModuleSecurity.isEventEditable}
        onAction={action => onAction(action)}
        customActionButtons={() => (
          <PrimaryButton
            className={classes.scheduleButton}
            variant="contained"
            onClick={() => showRecurrenceDialog()}
            startIcon={<EventRepeatIcon />}
          >
            Schedule
          </PrimaryButton>
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
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
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

export default inject('eventStore', 'timeZoneSettingsStore', 'sidebarStore')(observer(UpsertEvent));
