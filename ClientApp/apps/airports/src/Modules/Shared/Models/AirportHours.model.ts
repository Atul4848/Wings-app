import { CoreModel, modelProtection, SettingsTypeModel, Utilities } from '@wings-shared/core';
import { ScheduleModel } from '@wings-shared/scheduler';
import { AirportModel } from '@wings/shared';
import { IAPIAirportHours, IAPIAirportHoursSubTypes, IAPICondition } from '../Interfaces';
import { AirportHoursSubTypeModel } from './AirportHourSubType.model';
import { AirportHoursTypeModel } from './AirportHourType.model';
import { ConditionModel } from './Condition.model';

@modelProtection
export class AirportHoursModel extends CoreModel {
  schedule: ScheduleModel;
  isDst: boolean;
  includeHoliday: boolean = false;
  sequenceId: number;
  icao: string = ''; // as per 125301 Not using ICAO now
  cappsComment: string;
  scheduleSummary: string;
  cappsSequenceId: number;
  notam: string;
  dmSourceNotes: string;

  // View Only fields
  isOTORApplicable?: boolean;
  airportHoursRemark?: SettingsTypeModel;
  airportHoursType?: AirportHoursTypeModel;
  cappsSequence?: SettingsTypeModel;
  airportHoursSubType?: AirportHoursSubTypeModel;
  condition?: ConditionModel;
  conditions?: ConditionModel[] = []; // as per 162324
  airport?: AirportModel;
  tempId?: string;

  constructor(data?: Partial<AirportHoursModel>) {
    super(data);
    Object.assign(this, data);
    this.condition = data?.condition || new ConditionModel();
    this.conditions = data?.conditions?.map(x => new ConditionModel({ ...x })) || [];
    this.schedule = data?.schedule || new ScheduleModel();
  }

  public static deserialize(apiData: IAPIAirportHours): AirportHoursModel {
    if (!apiData) {
      return new AirportHoursModel();
    }
    const data: Partial<AirportHoursModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.airportHourId || apiData.id,
      condition: ConditionModel.deserialize(apiData.condition as IAPICondition),
      conditions: ConditionModel.deserializeList(apiData.conditions as IAPICondition[]),
      airportHoursType: AirportHoursTypeModel.deserialize({
        id: apiData.airportHoursType?.airportHoursTypeId,
        name: apiData.airportHoursType?.name,
      }),
      airportHoursSubType: AirportHoursSubTypeModel.deserialize(
        apiData.airportHoursSubType as IAPIAirportHoursSubTypes
      ),
      airportHoursRemark: SettingsTypeModel.deserialize({
        id: apiData.airportHoursRemark?.airportHoursRemarkId,
        name: apiData.airportHoursRemark?.name,
      }),
      schedule: ScheduleModel.deserialize(apiData.schedule),
      sequenceId: apiData.sequenceId,
      isDst: apiData.isDst || false,
      statusId: apiData.statusId,
      icao: apiData.icao,
      cappsComment: apiData.cappsComment || '',
      dmSourceNotes: apiData.dmSourceNotes,
      scheduleSummary: apiData.scheduleSummary,
      cappsSequenceId: apiData.cappsSequenceId,
      notam: apiData.notam,
      airport: AirportModel.deserialize({
        ...apiData.airport,
        icao: apiData.airport?.displayCode,
      }),
    };
    return new AirportHoursModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportHours {
    return {
      ...this._serialize(),
      id: this.id || 0,
      airportId: this.airport?.id,
      icao: this.airport?.operationalCode,
      airportHoursTypeId: this.airportHoursType?.id,
      airportHoursSubTypeId: this.airportHoursSubType?.id,
      airportHoursRemarkId: this.airportHoursRemark?.id,
      cappsSequenceId: this.cappsSequenceId,
      notam: this.notam,
      isDst: this.isDst || false,
      sequenceId: this.sequenceId,
      closureTypeId: 1,
      cappsComment: this.cappsComment,
      dmSourceNotes: this.dmSourceNotes,
      scheduleSummary: this.scheduleSummary,
      conditions:
        [ 'ppr', 'slot', 'ciq' ].includes(
          this.airportHoursType?.label?.toLocaleLowerCase()
        ) ||
        [ 'operational hours', 'closure hours', 'ot/or hours' ].includes(
          this.airportHoursSubType?.label?.toLocaleLowerCase()
        )
          ? this.conditions?.map((x) => x?.serialize())
          : [],
      schedule: this.schedule?.serialize(this.sourceType?.id, this.accessLevel?.id, this.status?.id),
    };
  }

  public static deserializeList(operatingHoursList: IAPIAirportHours[]): AirportHoursModel[] {
    return operatingHoursList
      ? operatingHoursList.map((operatingHours: IAPIAirportHours) => AirportHoursModel.deserialize(operatingHours))
      : [];
  }
}
