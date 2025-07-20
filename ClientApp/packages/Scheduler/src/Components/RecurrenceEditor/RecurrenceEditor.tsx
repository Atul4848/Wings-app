import React, { Component, ReactNode, Ref, RefObject } from 'react';
import { withStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import { styles } from './RecurrenceEditor.styles';
import DateTimeWidget from '../DateTimeWidget/DateTimeWidget';
import { ScheduleModel } from '../../Models';
import RecurrenceRangeView, { PureRecurrenceRangeView } from '../RecurrenceRangeView/RecurrenceRangeView';
import RecurrencePatternView, { PureRecurrencePatternView } from '../RecurrencePatternView/RecurrencePatternView';
import { PureDateTimeWidget } from '../DateTimeWidget/DateTimeWidget';
import { PureScheduleView } from '../ScheduleView/ScheduleView';
import { IClasses, SettingsTypeModel } from '@wings-shared/core';

interface Props {
  ref?: Ref<any>;
  classes?: IClasses;
  scheduleData: ScheduleModel;
  isEditable?: boolean;
  stddstTypes?: SettingsTypeModel[];
  onChange: (scheduleData: ScheduleModel, callback: Function) => void;
}

@observer
class RecurrenceEditor extends Component<Props> {
  public recurrenceRangeViewRef: RefObject<PureRecurrenceRangeView> = React.createRef<PureRecurrenceRangeView>();
  public recurrencePatternViewRef: RefObject<PureRecurrencePatternView> = React.createRef<PureRecurrencePatternView>();
  public dateTimeWidgetRef: RefObject<PureDateTimeWidget> = React.createRef<PureDateTimeWidget>();
  public scheduleViewRef: RefObject<PureScheduleView> = React.createRef<PureScheduleView>();

  /* istanbul ignore next */
  public get hasStdDstType(): boolean {
    return this.props.scheduleData?.stddstType?.id ? true : false;
  }

  /* istanbul ignore next */
  public get hasError(): boolean {
    return (
      this.recurrenceRangeViewRef.current?.hasError ||
      this.recurrencePatternViewRef.current?.hasError ||
      this.dateTimeWidgetRef.current?.hasError
    );
  }

  /* istanbul ignore next */
  public resetScheduleData(scheduleData: ScheduleModel): void {
    this.scheduleViewRef.current?.setFormValues(scheduleData);
    this.dateTimeWidgetRef.current?.setFormValues(scheduleData);
    this.recurrenceRangeViewRef.current?.setFormValues(scheduleData.patternedRecurrence?.recurrenceRange);
    this.recurrencePatternViewRef.current?.setFormValues(scheduleData.patternedRecurrence?.recurrencePattern);
  }

  public render(): ReactNode {
    const { classes, scheduleData, isEditable } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.flexRow}>
          <RecurrenceRangeView
            ref={this.recurrenceRangeViewRef}
            isEditable={isEditable}
            scheduleData={scheduleData}
            onChange={(updatedData, callback) => this.props.onChange(updatedData, callback)}
          />
        </div>
        <div className={classes.flexRow}>
          <DateTimeWidget
            ref={this.dateTimeWidgetRef}
            isEditable={isEditable}
            scheduleData={scheduleData}
            onChange={(updatedData, callback) => this.props.onChange(updatedData, callback)}
          />
        </div>
        <div className={classes.flexRow}>
          <Typography variant="h6" className={classes.groupTitle}>
            Recurrence Pattern
          </Typography>
          <RecurrencePatternView
            ref={this.recurrencePatternViewRef}
            isEditable={isEditable}
            scheduleData={scheduleData}
            onChange={(updatedData, callback) => this.props.onChange(updatedData, callback)}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(RecurrenceEditor);
export { RecurrenceEditor as PureRecurrenceEditor };
