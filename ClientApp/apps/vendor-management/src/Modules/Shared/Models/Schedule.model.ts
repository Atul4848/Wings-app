import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPIScheduleResponse } from '../Interfaces/Response/API-Response-VendorLocation';
import { PatternedRecurrence } from './PatternedRecurrence.model';
import { HoursTimeModel, RecurrenceModel, SCHEDULE_TYPE } from '@wings-shared/scheduler';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class ScheduleModel extends CoreModel implements ISelectOption {
  startDate: Date;
  endDate: Date;
  startTime: HoursTimeModel;
  endTime: HoursTimeModel;
  is24Hours: boolean = false;
  patternedRecurrenceResponse?: PatternedRecurrence;
  scheduleTypeId: SCHEDULE_TYPE = SCHEDULE_TYPE.RECURRENCE;
  includeHoliday: boolean = false;

  constructor(data?: Partial<ScheduleModel>) {
    super(data);
    Object.assign(this, data);
    this.patternedRecurrenceResponse = data?.patternedRecurrenceResponse || new PatternedRecurrence();
  }

  static deserialize(apiData: IAPIScheduleResponse): ScheduleModel {
    if (!apiData) {
      return new ScheduleModel();
    }
    const data: Partial<ScheduleModel> = {
      id: apiData.id,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      startTime: apiData.startTime,
      endTime: apiData.endTime,
      scheduleType: SettingBaseModel.deserialize({
        id: apiData.hoursScheduleType?.id,
        name: apiData.hoursScheduleType?.name,
      }),
      is24Hours: apiData.is24Hours,
      includeHoliday: apiData.includeHoliday || false,
      patternedRecurrence: PatternedRecurrence.deserialize(
        apiData.patternedRecurrence || apiData.patternedRecurrenceResponse
      ),
    };
    return new ScheduleModel(data);
  }

  static deserializeList(apiDataList: IAPIScheduleResponse[]): ScheduleModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => ScheduleModel.deserialize(apiData)) : [];
  }

  public get isRecurring(): boolean {
    return this.scheduleType?.id === SCHEDULE_TYPE.RECURRENCE;
  }

  public serialize(isRecurring: boolean) {
    return {
      id: this.id || 0,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      startTime: this.startTime,
      endTime: this.endTime,
      is24Hours: this.is24Hours || false,
      includeHoliday: this.includeHoliday,
      patternedRecurrenceRequest: isRecurring
        ? this.patternedRecurrence?.serialize()
        : new PatternedRecurrence({
          id: this.patternedRecurrence.id || 0,
          patternedRecurrenceDaysofWeekRequest: null,
        }),
    };
  }
  // required in auto complete
  public get label(): string {
    return `${this.id}`;
  }

  public get value(): string | number {
    return this.id;
  }
}
