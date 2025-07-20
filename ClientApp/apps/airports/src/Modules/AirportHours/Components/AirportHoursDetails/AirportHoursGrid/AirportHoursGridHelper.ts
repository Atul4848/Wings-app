import { HoursTimeModel } from '@wings-shared/scheduler';
import {
  AirportHoursModel,
  AirportSettingsStore,
  CONDITION_EDITOR,
  ConditionModel,
  ConditionValueModel,
} from '../../../../Shared';
import moment from 'moment';
import { Utilities } from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export class AirportHoursGridHelper {
  // Reset to Default on No Schedule and Continues
  /* istanbul ignore next */
  public resetToDefault(instance, data: AirportHoursModel): void {
    instance.getComponentInstance('schedule.includeHoliday').setValue(false);
    instance.getComponentInstance('schedule.startDate').setValue('');
    instance.getComponentInstance('schedule.endDate').setValue('');
    instance
      .getComponentInstance('schedule.startTime')
      .setValue(new HoursTimeModel({ id: data.schedule?.startTime.id }));
    instance
      .getComponentInstance('schedule.endTime')
      .setValue(new HoursTimeModel({ id: data.schedule?.endTime.id }));
    instance.getComponentInstance('schedule.is24Hours').setValue(false);
    instance.getComponentInstance('schedule.stddstType').setValue(false);
    instance
      .getComponentInstance(
        'schedule.patternedRecurrence.recurrencePattern.daysOfWeeks'
      )
      .setValue([]);
  }

  public getDateTime(hours: number, mins: number): string {
    return moment().utc().hour(hours).minutes(mins).seconds(0).format();
  }

  public getOTORCondition(
    airportSettingsStore: AirportSettingsStore
  ): Observable<ConditionModel | null> {
    return airportSettingsStore.loadOvertime().pipe(
      switchMap((response: any) => {
        const conditionValue = response.find((x) =>
          Utilities.isEqual(x.label, 'On Request')
        );

        if (!conditionValue) {
          AlertStore.important('On Request not found');
          return of(null);
        }

        const { conditionTypes, conditionalOperators } = airportSettingsStore;
        const condition = new ConditionModel({
          conditionValues: [
            new ConditionValueModel({
              entityValue: conditionValue?.name,
              entityValueId: conditionValue?.id,
            }),
          ],
          conditionType: conditionTypes.find(({ name }) =>
            Utilities.isEqual(name, 'overtime')
          ),
          conditionalOperator: conditionalOperators.find(
            ({ operator }) =>
              Utilities.isEqual(operator, 'Equal') ||
              Utilities.isEqual(operator, '=')
          ),
        });
        return of(condition);
      })
    );
  }
}

export const integerFields = [
  CONDITION_EDITOR.DECIBEL,
  CONDITION_EDITOR.WEIGHT,
  CONDITION_EDITOR.WEIGHT_MTOW_METRICTONS,
  CONDITION_EDITOR.WEIGHT_MTOW_LBS,
  CONDITION_EDITOR.WINGSPAN,
  CONDITION_EDITOR.SEATING_CONFIGURATION,
  CONDITION_EDITOR.PAX_SEAT_CAPACITY,
  CONDITION_EDITOR.CREW_SEAT_CAPACITY,
  CONDITION_EDITOR.TOTAL_SEAT_CAPACITY,
  CONDITION_EDITOR.EPN_DB,
].map((x) => x.toString());

export const booleanFields = [
  CONDITION_EDITOR.ARRIVAL,
  CONDITION_EDITOR.DEPARTURE,
  CONDITION_EDITOR.USE_AS_ALTERNATE,
  CONDITION_EDITOR.EVENT,
];

const airportHoursGridHelper = new AirportHoursGridHelper();
export default airportHoursGridHelper;
