import { ICAOCodeModel } from '@wings/airports/src/Modules/Shared';
import { CityModel, StateModel, AirportModel, CountryModel, RegionModel } from '@wings/shared';
import { IAPIEvent } from '../Interfaces';
import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { ScheduleModel, scheduleTypeOptions } from '@wings-shared/scheduler';

@modelProtection
export class EventModel extends CoreModel {
  id: number = 0;
  description: string = '';
  url: string = '';
  notes: string = '';
  beginPlanning: number = null;
  isMajorEvent: boolean = false;
  country: CountryModel;
  region: RegionModel;
  uaOffice: SettingsTypeModel;
  eventSchedule: ScheduleModel;
  eventType: SettingsTypeModel;
  eventCategory: SettingsTypeModel;
  cities: CityModel[] = [];
  airports: AirportModel[] = [];
  states: StateModel[] = [];
  specialConsiderations: SettingsTypeModel[];

  constructor(data?: Partial<EventModel>) {
    super(data);
    Object.assign(this, data);
    this.eventType = data?.eventType ? new SettingsTypeModel(data?.eventType) : null;
    this.eventCategory = data?.eventCategory ? new SettingsTypeModel(data?.eventCategory) : null;
    this.uaOffice = data?.uaOffice ? new SettingsTypeModel(data?.uaOffice) : null;
    this.country = data?.country ? new CountryModel(data?.country) : null;
    this.region = data?.region ? new RegionModel(data?.region) : null;
    this.eventSchedule = new ScheduleModel({
      scheduleType: scheduleTypeOptions[2], // change default type to single instance
      ...data?.eventSchedule,
    });
    this.specialConsiderations = data?.specialConsiderations?.map(x => new SettingsTypeModel(x)) || [];
    this.airports = data?.airports?.map(x => new AirportModel(x)) || [];
    this.states = data?.states?.map(x => new StateModel(x)) || [];
    this.cities = data?.cities?.map(x => new CityModel(x)) || [];
  }

  static deserialize(apiData: IAPIEvent): EventModel {
    if (!apiData) {
      return new EventModel();
    }

    const data: Partial<EventModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.worldEventId || apiData.id,
      beginPlanning: apiData.beginPlanning,
      name: apiData.name,
      url: apiData.url,
      notes: apiData.notes,
      description: apiData.description,
      isMajorEvent: apiData.isMajorEvent,
      airports: apiData.worldEventAirports?.map(
        x =>
          new AirportModel({
            referenceId: x.id,
            id: x.airportId,
            name: x.airportName,
            icao: new ICAOCodeModel({ code: x.icaoCode }),
            uwaCode: x.uwaCode,
          })
      ),
      country: apiData.countries?.length
        ? new CountryModel({
          referenceId: apiData.countries[0].id,
          id: apiData.countries[0].countryId,
          commonName: apiData.countries[0].name,
          isO2Code: apiData.countries[0].code,
        })
        : null,
      region: apiData.regions?.length
        ? new RegionModel({
          referenceId: apiData.regions[0].id,
          id: apiData.regions[0].regionId,
          name: apiData.regions[0].name,
          code: apiData.regions[0].code,
        })
        : null,
      states: apiData.states?.map(
        x => new StateModel({ referenceId: x.id, id: x.stateId, commonName: x.name, isoCode: x.code })
      ),
      cities: apiData.cities?.map(
        x => new CityModel({ referenceId: x.id, id: x.cityId, commonName: x.name, cappsCode: x.code })
      ),
      eventSchedule: ScheduleModel.deserialize({
        ...apiData.eventSchedule,
        id: apiData.eventSchedule?.eventScheduleId || apiData.eventSchedule?.id,
        is24Hours: apiData.eventSchedule?.isAllDay || false,
        startTime: { solarTimeId: null, offSet: null, id: 0, time: apiData.eventSchedule?.startTime },
        endTime: { solarTimeId: null, offSet: null, id: 0, time: apiData.eventSchedule?.endTime },
        scheduleType: { ...apiData.eventSchedule?.eventScheduleType },
      }),
      eventType: apiData.worldEventType
        ? new SettingsTypeModel({
          ...apiData.worldEventType,
          id: apiData.worldEventType?.worldEventTypeId,
        })
        : null,
      eventCategory: apiData.worldEventCategory
        ? new SettingsTypeModel({
          ...apiData.worldEventCategory,
          id: apiData.worldEventCategory?.worldEventCategoryId,
        })
        : null,
      specialConsiderations: apiData.appliedWorldEventSpecialConsiderations?.map(
        w =>
          new SettingsTypeModel({
            referenceId: w.id,
            id: w.worldEventSpecialConsideration?.worldEventSpecialConsiderationId,
            name: w.worldEventSpecialConsideration?.name,
          })
      ),
      uaOffice: apiData.worldEventUAOffices?.length
        ? new SettingsTypeModel({
          referenceId: apiData.worldEventUAOffices[0].id,
          id: apiData.worldEventUAOffices[0].uaOffice?.uaOfficeId,
          name: apiData.worldEventUAOffices[0].uaOffice?.name,
        })
        : null,
    };
    return new EventModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIEvent {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      notes: this.notes,
      description: this.description,
      beginPlanning: this.beginPlanning === '' ? null : this.beginPlanning,
      worldEventTypeId: this.eventType?.id || null,
      worldEventCategoryId: this.eventCategory?.id || null,
      isMajorEvent: this.isMajorEvent || false,
      worldEventUAOffices: this.uaOffice?.id ? [{ id: this.uaOffice.referenceId, uaOfficeId: this.uaOffice.id }] : [],
      appliedWorldEventSpecialConsiderations: this.specialConsiderations?.map(entity => ({
        id: entity.referenceId,
        worldEventSpecialConsiderationId: entity.id,
      })),
      worldEventAirports: this.airports?.map(airport => ({
        id: airport.referenceId,
        airportId: airport.id,
        airportName: airport.name,
        icaoCode: airport.icao.code,
        uwaCode: airport.uwaCode,
      })),
      countries: this.country?.id
        ? [
          {
            id: this.country.referenceId,
            countryId: this.country.id,
            code: this.country.isO2Code,
            name: this.country.commonName,
          },
        ]
        : [],
      states: this.states?.map(state => ({
        id: state.referenceId,
        stateId: state.id,
        code: state.isoCode,
        name: state.commonName,
      })),
      cities: this.cities?.map(city => ({
        id: city.referenceId,
        cityId: city.id,
        code: city.cappsCode,
        name: city.commonName,
      })),
      regions: this.region?.id
        ? [
          {
            id: this.region.referenceId,
            regionId: this.region.id,
            code: this.region.code,
            name: this.region.name,
          },
        ]
        : [],
      eventSchedule: this.eventSchedule.serializeEvent(
        this.eventSchedule?.id,
        this.sourceType?.id,
        this.accessLevel?.id,
        this.status?.id
      ),
      ...this._serialize(),
    };
  }

  static deserializeList(apiEvents: IAPIEvent[]): EventModel[] {
    return apiEvents ? apiEvents.map((event: IAPIEvent) => EventModel.deserialize(event)) : [];
  }
}
