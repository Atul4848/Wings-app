import { CoreModel, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { ScheduleModel } from './Schedule.model';
import { SCHEDULE_TYPE } from '@wings-shared/scheduler';
import moment from 'moment';
import { Airports } from './Airports.model';

@modelProtection
export class LocationHoursModel extends CoreModel {
  id: number = 0;
  sequence: number;
  airportReferenceId: number;
  hoursType: SettingBaseModel = new SettingBaseModel();
  airportHoursType: SettingBaseModel = new SettingBaseModel();
  hoursScheduleType: SettingBaseModel = new SettingBaseModel();
  airportHoursScheduleType: SettingBaseModel = new SettingBaseModel();
  airportHoursSubType: SettingBaseModel = new SettingBaseModel();
  status: SettingBaseModel = new SettingBaseModel();
  accessLevel: SettingBaseModel = new SettingBaseModel();
  schedule: ScheduleModel = new ScheduleModel();
  airportReference: Airports = new Airports();

  constructor(data?: Partial<LocationHoursModel>) {
    super(data);
    Object.assign(this, data);
    this.schedule = data?.schedule || new ScheduleModel();
  }

  static deserialize(apiData: LocationHoursModel): LocationHoursModel {
    if (!apiData) {
      return new LocationHoursModel();
    }
    const data: Partial<LocationHoursModel> = {
      ...apiData,
      sequence: apiData.sequence,
      hoursType: SettingBaseModel.deserialize(apiData.hoursType || apiData.airportHoursType),
      hoursScheduleType: SettingBaseModel.deserialize(apiData.hoursScheduleType || apiData.airportHoursScheduleType),
      status: SettingBaseModel.deserialize(apiData.status),
      accessLevel: SettingBaseModel.deserialize(apiData.accessLevel),
      schedule: ScheduleModel.deserialize(apiData.scheduleResponse || apiData.schedule),
      airportReference: Airports.deserializeAirportReference(apiData?.airportReference),
    };
    return new LocationHoursModel(data);
  }

  static deserializeList(apiDataList: LocationHoursModel[]): LocationHoursModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => LocationHoursModel.deserialize(apiData)) : [];
  }

  public serialize(locationId: number) {
    return {
      id: this.id || 0,
      userId: '',
      vendorLocationId: locationId,
      sequence: parseInt(this.sequence),
      hoursTypeId: this.hoursType.id,
      hoursScheduleTypeId: this.hoursScheduleType.id,
      statusId: this.status.id,
      accessLevelId: this.accessLevel.id,
      scheduleRequest: this.schedule.serialize(this.isRecurring),
    };
  }

  public get isRecurring(): boolean {
    return this.hoursScheduleType?.id === SCHEDULE_TYPE.RECURRENCE;
  }

  // required in auto complete
  public get label(): string {
    return `${this.id}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
