import React, { Component, Ref } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import MobxReactForm, { Field } from 'mobx-react-form';
import moment from 'moment';
import { fields } from './fields';
import { styles } from './DateTimeWidget.styles';
import { ScheduleModel } from '../../Models';
import { seunsetSunriseOptions } from '../fields';
import { HoursTimeModel } from '../../Models';
import {
  Utilities,
  DATE_FORMAT,
  IClasses,
  IOptionValue,
  getFormValidation,
} from '@wings-shared/core';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IViewInputControl,
} from '@wings-shared/form-controls';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  classes?: IClasses;
  scheduleData: ScheduleModel;
  isEventSchedule?: boolean;
  onChange?: (updatedData: ScheduleModel, callback: Function) => any;
}

@observer
class DateTimeWidget extends Component<Props> {
  /* istanbul ignore next */
  public static defaultProps = {
    showDuration: false,
    showDates: true,
    isEventSchedule: true,
    onChange: () => {},
  };

  @observable public form: MobxReactForm = getFormValidation(fields);

  componentDidMount() {
    this.setFormValues(this.props.scheduleData);
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  // needs to access using ref
  public get hasError(): boolean {
    return this.form.hasError || Boolean(this.invalidTimeMessage);
  }

  private get invalidTimeMessage(): string {
    const startTime = this.getField('startTime.time').value;
    const endTime = this.getField('endTime.time').value;
    const isValidTime = Utilities.compareDateTime(
      Utilities.getformattedDate(startTime, DATE_FORMAT.APPOINTMENT_TIME),
      Utilities.getformattedDate(endTime, DATE_FORMAT.APPOINTMENT_TIME),
      DATE_FORMAT.APPOINTMENT_TIME
    );
    return isValidTime ? '' : 'End Time Should be after the Start Time';
  }

  private get hasValueStartSolarTime(): boolean {
    const { value } = this.getField('startTime.solarTime');
    return value ? !Utilities.isEqual(value?.id, 1) : false;
  }

  private get hasValueEndSolarTime(): boolean {
    const { value } = this.getField('endTime.solarTime');
    return value ? !Utilities.isEqual(value?.id, 1) : false;
  }

  private get is24Hours(): boolean {
    const { value } = this.getField('is24Hours');
    return Boolean(value);
  }

  private get startTimeInputControls(): IViewInputControl[] {
    return [
      {
        fieldKey: 'startTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: this.hasValueStartSolarTime || this.is24Hours,
        is12HoursFormat: false,
      },
      {
        fieldKey: 'startTime.solarTime',
        type: EDITOR_TYPES.DROPDOWN,
        options: seunsetSunriseOptions,
        isDisabled: this.is24Hours,
      },
      {
        fieldKey: 'startTime.offSet',
        type: EDITOR_TYPES.TEXT_FIELD,
        isDisabled: !this.hasValueStartSolarTime || this.is24Hours,
      },
    ];
  }

  private get endTimeInputControls(): IViewInputControl[] {
    return [
      {
        fieldKey: 'endTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: this.hasValueEndSolarTime || this.is24Hours,
        is12HoursFormat: false,
        customErrorMessage: this.invalidTimeMessage,
      },
      {
        fieldKey: 'endTime.solarTime',
        type: EDITOR_TYPES.DROPDOWN,
        options: seunsetSunriseOptions,
        isDisabled: this.is24Hours,
      },
      {
        fieldKey: 'endTime.offSet',
        type: EDITOR_TYPES.TEXT_FIELD,
        isDisabled: !this.hasValueEndSolarTime || this.is24Hours,
      },
    ];
  }

  // input controls for event schedule type
  private get eventScheduleControls(): IViewInputControl[] {
    return [
      {
        fieldKey: 'startTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: this.is24Hours,
        is12HoursFormat: false,
      },
      {
        fieldKey: 'endTime.time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        isDisabled: this.is24Hours,
        is12HoursFormat: false,
        customErrorMessage: this.invalidTimeMessage,
      },
      {
        fieldKey: 'is24Hours',
        type: EDITOR_TYPES.CHECKBOX,
      },
    ];
  }

  public setFormValues(scheduleData: ScheduleModel): void {
    if (!scheduleData) {
      return;
    }
    this.form.set(scheduleData);
    this.form.$('durationInMinutes').set(this.timeDifferenceInMinutes || '');
  }

  private get timeDifferenceInMinutes(): number {
    const { startTime, endTime } = this.form.values();
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
  }

  private onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    this.form.$('durationInMinutes').set(this.timeDifferenceInMinutes || '');
    switch (fieldKey) {
      case 'startTime.solarTime':
        this.getField('startTime.time').set('');
        this.getField('startTime.offSet').set('');
        break;
      case 'endTime.solarTime':
        this.getField('endTime.time').set('');
        this.getField('endTime.offSet').set('');
        break;
      case 'is24Hours':
        if (value) {
          this.getField('startTime.time').set(Utilities.getDateTime(0, 1));
          this.getField('endTime.time').set(Utilities.getDateTime(23, 59));
        }
        break;
    }
    const { scheduleData } = this.props;
    const schedule = new ScheduleModel({
      ...scheduleData,
      ...this.form.values(),
      startTime: new HoursTimeModel({
        ...scheduleData.startTime,
        ...this.form.values()['startTime'],
      }),
      endTime: new HoursTimeModel({
        ...scheduleData.endTime,
        ...this.form.values()['endTime'],
      }),
    });
    this.props.onChange(schedule, (cancelChanges: boolean) => {
      if (!cancelChanges) {
        return;
      }
      this.setFormValues(schedule);
    });
  }

  render() {
    const { classes, isEditable, isEventSchedule } = this.props;
    if (isEventSchedule) {
      return (
        <div className={classes.flexRow}>
          {this.eventScheduleControls.map(
            (inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey)}
                isEditable={isEditable}
                isDisabled={inputControl.isDisabled}
                onValueChange={(option, _fieldKey) =>
                  this.onValueChange(option, inputControl.fieldKey)
                }
              />
            )
          )}
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <div className={classes.flexRow}>
          <ViewInputControl
            field={this.getField('is24Hours')}
            isEditable={isEditable}
            type={EDITOR_TYPES.CHECKBOX}
            onValueChange={(value, fieldKey) =>
              this.onValueChange(value, fieldKey)
            }
          />
        </div>
        <div className={classes.flexRow}>
          {this.startTimeInputControls.map(
            (inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey)}
                isEditable={isEditable}
                isDisabled={inputControl.isDisabled}
                onValueChange={(option, _fieldKey) =>
                  this.onValueChange(option, inputControl.fieldKey)
                }
              />
            )
          )}
        </div>
        <div className={classes.flexRow}>
          {this.endTimeInputControls.map(
            (inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                field={this.getField(inputControl.fieldKey)}
                isEditable={isEditable}
                isDisabled={inputControl.isDisabled}
                onValueChange={(option, _fieldKey) =>
                  this.onValueChange(option, inputControl.fieldKey)
                }
              />
            )
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DateTimeWidget);
export { DateTimeWidget as PureDateTimeWidget };
