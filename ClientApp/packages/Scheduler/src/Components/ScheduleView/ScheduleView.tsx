import React, { Component, Ref } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import MobxReactForm, { Field } from 'mobx-react-form';
import { fields } from './Fields';
import { styles } from './ScheduleView.styles';
import {
  RecurrenceModel,
  RecurrenceRangeModel,
  ScheduleModel,
} from '../../Models';
import {
  IClasses,
  IOptionValue,
  Utilities,
  getFormValidation,
  SettingsTypeModel,
} from '@wings-shared/core';
import { dateTimeTypeOptions } from '../fields';
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
  stddstTypes: SettingsTypeModel[];
  onChange?: (updatedData: ScheduleModel, callback: Function) => void;
}

@observer
class ScheduleView extends Component<Props> {
  @observable public form: MobxReactForm = getFormValidation(fields);

  componentDidMount() {
    this.setFormValues(this.props.scheduleData);
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  private get inputControls(): IViewInputControl[] {
    return [
      {
        fieldKey: 'timeType',
        type: EDITOR_TYPES.DROPDOWN,
        options: dateTimeTypeOptions,
        isDisabled: true,
      },
      {
        fieldKey: 'stddstType',
        type: EDITOR_TYPES.DROPDOWN,
        options: this.props.stddstTypes || [],
      },
      {
        fieldKey: 'includeHoliday',
        type: EDITOR_TYPES.CHECKBOX,
      },
    ];
  }

  public setFormValues(scheduleData: ScheduleModel): void {
    if (!scheduleData) {
      return;
    }
    this.form.set(scheduleData);
  }

  private onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    const { scheduleData } = this.props;
    const { recurrenceRange } = scheduleData.patternedRecurrence;
    let recurrenceRangeData: RecurrenceRangeModel = new RecurrenceRangeModel({
      ...recurrenceRange,
    });

    if (Utilities.isEqual(fieldKey, 'stddstType') && value) {
      recurrenceRangeData = new RecurrenceRangeModel({
        id: recurrenceRange.id,
        patternedRecurrenceId: recurrenceRange.patternedRecurrenceId,
        startDate: null,
      });
    }

    const schedule = new ScheduleModel({
      ...scheduleData,
      patternedRecurrence: new RecurrenceModel({
        ...scheduleData.patternedRecurrence,
        recurrenceRange: recurrenceRangeData,
      }),
      ...this.form.values(),
    });
    this.props.onChange(schedule, (cancel: boolean) => {
      if (cancel) {
        this.setFormValues(this.props.scheduleData);
      }
    });
  }

  render() {
    const { classes, isEditable } = this.props;
    return (
      <div className={classes.flexRow}>
        {this.inputControls.map((inputControl: IViewInputControl, index: number) => (
          <ViewInputControl
            {...inputControl}
            key={index}
            field={this.getField(inputControl.fieldKey)}
            isEditable={isEditable}
            isDisabled={inputControl.isDisabled}
            onValueChange={(option, _fieldKey) => this.onValueChange(option, inputControl.fieldKey)}
          />
        ))}
      </div>
    );
  }
}

export default withStyles(styles)(ScheduleView);
export { ScheduleView as PureScheduleView };
