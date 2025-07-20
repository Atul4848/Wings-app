import React, { Component, Ref } from 'react';
import { observer } from 'mobx-react';
import { MobxReactForm, Field } from 'mobx-react-form';
import { styles } from './RecurrencePatternView.styles';
import { withStyles, InputLabel } from '@material-ui/core';
import { recurrencePatternOptions, recurrencePatternViews } from '../fields';
import WeeklyView from '../WeeklyView/WeeklyView';
import MonthlyView from '../MonthlyView/MonthlyView';
import YearlyView from '../YearlyView/YearlyView';
import RecurrenceTabs from '../RecurrenceTabs/RecurrenceTabs';
import { RecurrenceModel, RecurrencePatternModel, ScheduleModel } from '../../Models';
import { fields } from './Fields';
import { action, observable } from 'mobx';
import { RECURRENCE_PATTERN_TYPE } from '../../Enums';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { IOptionValue, IClasses, getFormValidation, SelectOption } from '@wings-shared/core';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  onChange: (updatedData: ScheduleModel, callback: Function) => void;
  classes?: IClasses;
}

@observer
class RecurrencePatternView extends Component<Props> {
  @observable private activeTab: number = 0;
  private readonly tabs: string[] = recurrencePatternOptions.map(x => x.name);
  @observable protected form: MobxReactForm = getFormValidation(fields);

  componentDidMount() {
    this.setFormValues();
  }

  @action
  public setFormValues(recurrencePatternData?: RecurrencePatternModel): void {
    if (!this.recurrencePattern) {
      return;
    }
    this.form.set(recurrencePatternData || this.recurrencePattern);
    const recurrencePatternTypeId: RECURRENCE_PATTERN_TYPE =
      recurrencePatternData?.recurrencePatternTypeId || this.recurrencePattern.recurrencePatternTypeId;
    this.activeTab = this.getDefaultActiveTab(recurrencePatternTypeId);
    this.setRecurrencePatternTypeField(recurrencePatternViews.find(({ value }) => value === recurrencePatternTypeId));
  }

  // get default active tab based on the recurrencePatternTypeId
  private getDefaultActiveTab(id: RECURRENCE_PATTERN_TYPE): number {
    switch (id) {
      case RECURRENCE_PATTERN_TYPE.DAILY:
        return 0;
      case RECURRENCE_PATTERN_TYPE.WEEKLY:
        return 1;
      case RECURRENCE_PATTERN_TYPE.MONTHLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
        return 2;
      case RECURRENCE_PATTERN_TYPE.YEARLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
        return 3;
    }
  }

  private get recurrencePattern(): RecurrencePatternModel {
    return this.props.scheduleData?.patternedRecurrence?.recurrencePattern;
  }

  // needs to access using ref
  public get hasError(): boolean {
    return this.form.hasError;
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  private isDisable(_tabIndex: number): boolean {
    if (!this.props.isEditable) {
      return true;
    }
    return false;
  }

  private onValueChange(value: IOptionValue, filedKey: string): void {
    this.getField(filedKey).set(value);

    const schedule: ScheduleModel = new ScheduleModel({
      ...this.props.scheduleData,
      patternedRecurrence: new RecurrenceModel({
        ...this.props.scheduleData?.patternedRecurrence,
        recurrencePattern: new RecurrencePatternModel({
          ...this.recurrencePattern,
          ...this.form.values(),
        }),
      }),
    });
    this.props.onChange(schedule, (cancelChanges: boolean) => {
      if (!cancelChanges) {
        return;
      }
      this.setFormValues();
    });
  }

  private onTabChange(tabIndex: number, tabName: string): void {
    this.activeTab = tabIndex;
    this.form.reset();
    this.getField('interval').set(1);
    this.setRecurrencePatternTypeField(recurrencePatternOptions.find(({ name }) => name === tabName));
    const recurrencePatternTypeField: Field = this.getField('recurrencePatternTypeId');
    this.onValueChange(recurrencePatternTypeField.value, 'recurrencePatternTypeId');
  }

  private setRecurrencePatternTypeField(tab: SelectOption): void {
    const recurrencePatternTypeField: Field = this.getField('recurrencePatternTypeId');
    const intervalField: Field = this.getField('interval');
    switch (tab.value) {
      case RECURRENCE_PATTERN_TYPE.DAILY:
        intervalField.set('label', 'Every Day(s)*');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.DAILY);
        break;
      case RECURRENCE_PATTERN_TYPE.WEEKLY:
        intervalField.set('label', 'Every Week(s)*');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.WEEKLY);
        break;
      case RECURRENCE_PATTERN_TYPE.MONTHLY:
        intervalField.set('label', 'Every Month(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.MONTHLY);
        recurrencePatternTypeField.set('label', 'Month Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
        intervalField.set('label', 'Every Month(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY);
        recurrencePatternTypeField.set('label', 'Month Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.YEARLY:
        intervalField.set('label', 'Every Year(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.YEARLY);
        recurrencePatternTypeField.set('label', 'Year Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
        intervalField.set('label', 'Every Year(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY);
        recurrencePatternTypeField.set('label', 'Year Type*');
        break;
    }
  }

  render() {
    const { classes, isEditable } = this.props;
    return (
      <div className={classes.root}>
        <InputLabel className={classes.title}>Period</InputLabel>
        <RecurrenceTabs
          tabs={this.tabs}
          activeTab={this.activeTab}
          isDisable={index => this.isDisable(index)}
          onTabChange={(tabIndex, tabName) => this.onTabChange(tabIndex, tabName)}
        >
          <div className={classes.flex}>
            <ViewInputControl
              type={EDITOR_TYPES.TEXT_FIELD}
              isEditable={isEditable}
              field={this.getField('interval')}
              onValueChange={(value, fieldKey) => this.onValueChange(value, fieldKey)}
            />
          </div>
          <WeeklyView
            recurrencePatternId={this.recurrencePattern.id}
            getField={key => this.getField(key)}
            isEditable={isEditable}
            onChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
          />
          <MonthlyView
            isEditable={isEditable}
            getField={key => this.getField(key)}
            onChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
          />
          <YearlyView
            isEditable={isEditable}
            getField={key => this.getField(key)}
            onChange={(option, fieldKey) => this.onValueChange(option, fieldKey)}
          />
        </RecurrenceTabs>
      </div>
    );
  }
}

export default withStyles(styles)(RecurrencePatternView);
export { RecurrencePatternView as PureRecurrencePatternView };
