import React, { FC, Ref, useEffect } from 'react';
import moment from 'moment';
import { fields } from './fields';
import { ScheduleModel } from '../../Models';
import { seunsetSunriseOptions } from '../fields';
import { HoursTimeModel } from '../../Models';
import {
  Utilities,
  DATE_FORMAT,
  IClasses,
  IOptionValue,
  baseEntitySearchFilters,
  ViewPermission,
} from '@wings-shared/core';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IViewInputControl,
} from '@wings-shared/form-controls';
import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';
import { useStyles } from './DateTimeWidget.styles';
import { observer } from 'mobx-react';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  classes?: IClasses;
  scheduleData: ScheduleModel;
  isEventSchedule?: boolean;
  onChange?: (updatedData: ScheduleModel, callback: Function) => any;
}

const DateTimeWidgetV2: FC<Props> = ({
  isEventSchedule = true,
  scheduleData,
  ...props
}) => {
  const params = useParams();
  const styles = useStyles();

  const useUpsert = useBaseUpsertComponent<ScheduleModel>(
    params,
    fields,
    baseEntitySearchFilters
  );

  useEffect(() => {
    setFormValues(scheduleData);
  }, []);

  const invalidTimeMessage = (): string => {
    const startTime = useUpsert.getField('startTime.time').value;
    const endTime = useUpsert.getField('endTime.time').value;
    const isValidTime = Utilities.compareDateTime(
      Utilities.getformattedDate(startTime, DATE_FORMAT.APPOINTMENT_TIME),
      Utilities.getformattedDate(endTime, DATE_FORMAT.APPOINTMENT_TIME),
      DATE_FORMAT.APPOINTMENT_TIME
    );
    return isValidTime ? '' : 'End Time Should be after the Start Time';
  };

  const hasValueStartSolarTime = (): boolean => {
    const { value } = useUpsert.getField('startTime.solarTime');
    return value ? !Utilities.isEqual(value?.id, 1) : false;
  };

  const hasValueEndSolarTime = (): boolean => {
    const { value } = useUpsert.getField('endTime.solarTime');
    return value ? !Utilities.isEqual(value?.id, 1) : false;
  };

  const is24Hours = (): boolean => {
    const { value } = useUpsert.getField('is24Hours');
    return Boolean(value);
  };

  const startTimeInputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'startTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: hasValueStartSolarTime() || is24Hours(),
        is12HoursFormat: false,
      },
      {
        fieldKey: 'startTime.solarTime',
        type: EDITOR_TYPES.DROPDOWN,
        options: seunsetSunriseOptions,
        isDisabled: is24Hours(),
      },
      {
        fieldKey: 'startTime.offSet',
        type: EDITOR_TYPES.TEXT_FIELD,
        isDisabled: !hasValueStartSolarTime() || is24Hours(),
      },
    ];
  };

  const endTimeInputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'endTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: hasValueEndSolarTime() || is24Hours(),
        is12HoursFormat: false,
        customErrorMessage: invalidTimeMessage(),
      },
      {
        fieldKey: 'endTime.solarTime',
        type: EDITOR_TYPES.DROPDOWN,
        options: seunsetSunriseOptions,
        isDisabled: is24Hours(),
      },
      {
        fieldKey: 'endTime.offSet',
        type: EDITOR_TYPES.TEXT_FIELD,
        isDisabled: !hasValueEndSolarTime() || is24Hours(),
      },
    ];
  };

  // input controls for event schedule type
  const eventScheduleControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'startTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: is24Hours(),
        is12HoursFormat: false,
      },
      {
        fieldKey: 'endTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: is24Hours(),
        is12HoursFormat: false,
        customErrorMessage: invalidTimeMessage(),
      },
      {
        fieldKey: 'is24Hours',
        type: EDITOR_TYPES.CHECKBOX,
      },
    ];
  };

  const setFormValues = (scheduleData: ScheduleModel) => {
    if (!scheduleData) {
      return;
    }
    useUpsert.form.set(scheduleData);
    useUpsert.form.$('durationInMinutes').set(timeDifferenceInMinutes() || '');
  };

  const timeDifferenceInMinutes = (): number => {
    const { startTime, endTime } = useUpsert.form.values();
    const _startDateTime: moment.Moment = moment(
      startTime?.time,
      moment.defaultFormat
    );
    const _endDateTime: moment.Moment = moment(
      endTime?.time,
      moment.defaultFormat
    );
    const duration: moment.Duration = moment.duration(
      _endDateTime.diff(_startDateTime)
    );
    return duration.asMinutes();
  };

  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    useUpsert.form.$('durationInMinutes').set(timeDifferenceInMinutes() || '');
    switch (fieldKey) {
      case 'startTime.solarTime':
        useUpsert.getField('startTime.time').set('');
        useUpsert.getField('startTime.offSet').set('');
        break;
      case 'endTime.solarTime':
        useUpsert.getField('endTime.time').set('');
        useUpsert.getField('endTime.offSet').set('');
        break;
      case 'is24Hours':
        if (value) {
          useUpsert.getField('startTime.time').set(Utilities.getDateTime(0, 1));
          useUpsert.getField('endTime.time').set(Utilities.getDateTime(23, 59));
        }
        break;
    }
    const schedule = new ScheduleModel({
      ...scheduleData,
      ...useUpsert.form.values(),
      startTime: new HoursTimeModel({
        ...scheduleData.startTime,
        ...useUpsert.form.values()['startTime'],
      }),
      endTime: new HoursTimeModel({
        ...scheduleData.endTime,
        ...useUpsert.form.values()['endTime'],
      }),
    });
    props.onChange(schedule, (cancelChanges: boolean) => {
      if (!cancelChanges) {
        return;
      }
      setFormValues(schedule);
    });
  };

  return (
    <>
      <ViewPermission hasPermission={isEventSchedule}>
        <div className={styles.flexRow}>
          {eventScheduleControls().map(
            (inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={useUpsert.getField(inputControl.fieldKey)}
                isEditable={props.isEditable}
                isDisabled={inputControl.isDisabled}
                onValueChange={(option, _fieldKey) =>
                  onValueChange(option, inputControl.fieldKey)
                }
              />
            )
          )}
        </div>
      </ViewPermission>
      <ViewPermission hasPermission={!isEventSchedule}>
        <div className={styles.root}>
          <div className={styles.flexRow}>
            <ViewInputControl
              field={useUpsert.getField('is24Hours')}
              isEditable={props.isEditable}
              type={EDITOR_TYPES.CHECKBOX}
              onValueChange={(value, fieldKey) =>
                onValueChange(value, fieldKey)
              }
            />
          </div>
          <div className={styles.flexRow}>
            {startTimeInputControls().map(
              (inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  field={useUpsert.getField(inputControl.fieldKey)}
                  isEditable={props.isEditable}
                  isDisabled={inputControl.isDisabled}
                  onValueChange={(option, _fieldKey) =>
                    onValueChange(option, inputControl.fieldKey)
                  }
                />
              )
            )}
          </div>
          <div className={styles.flexRow}>
            {endTimeInputControls().map(
              (inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  field={useUpsert.getField(inputControl.fieldKey)}
                  isEditable={props.isEditable}
                  isDisabled={inputControl.isDisabled}
                  onValueChange={(option, _fieldKey) =>
                    onValueChange(option, inputControl.fieldKey)
                  }
                />
              )
            )}
          </div>
        </div>
      </ViewPermission>
    </>
  );
};

export default observer(DateTimeWidgetV2);
