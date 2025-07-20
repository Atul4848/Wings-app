import React, { Component, ReactNode, Ref } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { styles } from './RecurrenceRangeView.styles';
import { RECURRENCE_RANGE_TYPE } from '../../Enums';
import { RecurrenceModel, RecurrenceRangeModel, ScheduleModel } from '../../Models';
import MobxReactForm, { Field } from 'mobx-react-form';
import { fields } from './Fields';
import { action, observable } from 'mobx';
import { regex, Utilities, DATE_FORMAT, IOptionValue, IClasses, getFormValidation } from '@wings-shared/core';
import moment from 'moment';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  onChange: (updatedData: ScheduleModel, callback: Function) => void;
  classes?: IClasses;
}

@observer
class RecurrenceRangeView extends Component<Props> {
  @observable protected form: MobxReactForm = getFormValidation(fields);

  componentDidMount() {
    this.setFormValues();
  }

  /* istanbul ignore next */
  public setFormValues(recurrenceRangeData?: RecurrenceRangeModel): void {
    if (!this.recurrenceRange) {
      return;
    }
    this.form.set(recurrenceRangeData || this.recurrenceRange);
    const rangeTypeId: number =
      recurrenceRangeData?.recurrenceRangeType?.id || this.recurrenceRange.recurrenceRangeType?.id;
    this.setRecurrenceRangeField(rangeTypeId);
  }

  private get recurrenceRange(): RecurrenceRangeModel {
    return this.props.scheduleData?.patternedRecurrence?.recurrenceRange;
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  private get hasStartDate(): boolean {
    return Boolean(this.getField('startDate').value);
  }

  // needs to access using ref
  /* istanbul ignore next */
  public get hasError(): boolean {
    const { recurrenceRangeType }: RecurrenceRangeModel = this.form.values();
    if (recurrenceRangeType) {
      return recurrenceRangeType.id === RECURRENCE_RANGE_TYPE.NO_END ? false : this.form.hasError;
    }
    return true;
  }

  private get endDate(): string {
    const { value } = this.getField('startDate');
    const numberOfOccurrences = this.getField('numberOfOccurrences').value;
    const startDate = moment(value, DATE_FORMAT.API_FORMAT);
    return startDate.isValid() ? startDate.add(numberOfOccurrences, 'days').format(DATE_FORMAT.API_FORMAT) : '';
  }

  @action
  private onValueChange(value: IOptionValue, fieldKey: string): void {
    this.getField(fieldKey).set(value);
    if (Utilities.isEqual(fieldKey, 'recurrenceRangeType')) {
      this.getField('numberOfOccurrences').set(1);
      const { recurrenceRangeType }: RecurrenceRangeModel = this.form.values();
      if (recurrenceRangeType) {
        this.getField('endDate').set(
          Utilities.isEqual(recurrenceRangeType.id, RECURRENCE_RANGE_TYPE.NO_END) ? '' : this.endDate
        );

        this.setRecurrenceRangeField(recurrenceRangeType.id);
      }
    }

    if (Utilities.isEqual(fieldKey, 'numberOfOccurrences')) {
      this.getField('endDate').set(this.endDate);
    }

    const schedule: ScheduleModel = new ScheduleModel({
      ...this.props.scheduleData,
      startDate: this.getField('startDate').value,
      endDate: this.getField('endDate').value,
      patternedRecurrence: new RecurrenceModel({
        ...this.props.scheduleData?.patternedRecurrence,
        recurrenceRange: new RecurrenceRangeModel({ ...this.recurrenceRange, ...this.form.values() }),
      }),
    });
    this.props.onChange(schedule, (cancelChanges: boolean) => {
      if (!cancelChanges) {
        return;
      }
      this.setFormValues();
    });
  }

  private setRecurrenceRangeField(recurrenceRangeTypeId: number): void {
    switch (recurrenceRangeTypeId) {
      case RECURRENCE_RANGE_TYPE.END_DATE:
        this.setFieldRules('endDate', 'required');
        this.setFieldRules('numberOfOccurrences', '');
        break;
      case RECURRENCE_RANGE_TYPE.NUMBERED:
        this.setFieldRules('numberOfOccurrences', `required|regex:${regex.numeric}`);
        this.setFieldRules('endDate', '');
        break;
    }
  }

  private setFieldRules(fieldKey: string, rule: string): void {
    const requiredField: Field = this.getField(fieldKey);
    requiredField.set('rules', rule);
  }

  private getLabel(labelValue: RECURRENCE_RANGE_TYPE): ReactNode {
    switch (labelValue) {
      case RECURRENCE_RANGE_TYPE.NUMBERED:
        return (
          <ViewInputControl
            type={EDITOR_TYPES.TEXT_FIELD}
            isEditable={this.props.isEditable}
            field={this.getField('numberOfOccurrences')}
            isDisabled={!this.hasStartDate}
            onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
          />
        );
      case RECURRENCE_RANGE_TYPE.END_DATE:
        return (
          <ViewInputControl
            type={EDITOR_TYPES.DATE}
            field={this.getField('endDate')}
            minDate={this.getField('startDate').value}
            isEditable={this.props.isEditable}
            isDisabled={!this.hasStartDate}
            dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
            onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { classes, isEditable } = this.props;
    return (
      <div className={classes.root}>
        <ViewInputControl
          type={EDITOR_TYPES.DATE}
          isEditable={isEditable}
          field={this.getField('startDate')}
          maxDate={this.getField('endDate').value}
          dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
          onValueChange={(value, fieldKey) => this.onValueChange(value, fieldKey)}
        />
        <ViewInputControl
          type={EDITOR_TYPES.DATE}
          field={this.getField('endDate')}
          minDate={this.getField('startDate').value}
          isEditable={this.props.isEditable}
          isDisabled={!this.hasStartDate}
          dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
          onValueChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
        />
        {this.getLabel(this.getField('recurrenceRangeType').value?.id)}
      </div>
    );
  }
}

export default withStyles(styles)(RecurrenceRangeView);
export { RecurrenceRangeView as PureRecurrenceRangeView };
