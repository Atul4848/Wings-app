import React, { ReactNode, Component } from 'react';
import { withStyles } from '@material-ui/core';
import { Filed } from 'mobx-react-form';
import { RECURRENCE_PATTERN_TYPE } from '../../Enums';
import { monthOptions, weekIndexOptions, daysOfWeekOptions, yearTypeOptions } from '../fields';
import { styles } from './YearlyView.styles';
import { IOptionValue, IClasses } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';

interface Props {
  isEditable?: boolean;
  onChange: (updatedData: IOptionValue, fieldKey: string) => void;
  getField: (fieldKey: string) => Filed;
  classes?: IClasses;
}

class YearlyView extends Component<Props> {
  /* istanbul ignore next */
  private get recurrencePatternLabel(): string {
    const { value } = this.props.getField('recurrencePatternTypeId');
    return value === RECURRENCE_PATTERN_TYPE.YEARLY ? yearTypeOptions[1].label : yearTypeOptions[0].label;
  }

  /* istanbul ignore next */
  private get monthLabel(): string {
    const month = this.props.getField('month')?.value;
    return monthOptions.find(x => x.value === month)?.label;
  }

  /* istanbul ignore next */
  private get weekIndexLabel(): string {
    const week = this.props.getField('weekIndexId')?.value;
    return weekIndexOptions.find(x => x.value === week)?.label;
  }

  /* istanbul ignore next */
  private get dayOfWeekLabel(): string {
    const day = this.props.getField('firstDayOfWeekId')?.value;
    return daysOfWeekOptions.find(x => x.value === day)?.label;
  }

  get absoluteYearly(): ReactNode {
    const { classes, getField, onChange, isEditable } = this.props;
    return (
      <div className={classes.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('month')}
          options={monthOptions}
          getOptionLabel={option => (isEditable ? option?.label : this.monthLabel)}
          onValueChange={(value, fieldKey) => onChange(value && value['value'], fieldKey)}
        />
        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={this.props.getField('dayOfMonth')}
          options={monthOptions}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />
      </div>
    );
  }

  get relativeYearly(): ReactNode {
    const { classes, getField, onChange, isEditable } = this.props;
    return (
      <div className={classes.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('weekIndexId')}
          options={weekIndexOptions}
          getOptionLabel={option => (isEditable ? option?.label : this.weekIndexLabel)}
          onValueChange={(value, fieldKey) => onChange(value && value['value'], fieldKey)}
        />
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('firstDayOfWeekId')}
          options={daysOfWeekOptions}
          getOptionLabel={option => (isEditable ? option?.label : this.dayOfWeekLabel)}
          onValueChange={(value, fieldKey) => onChange(value && value['value'], fieldKey)}
        />
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('month')}
          options={monthOptions}
          getOptionLabel={option => (isEditable ? option?.label : this.monthLabel)}
          onValueChange={(value, fieldKey) => onChange(value && value['value'], fieldKey)}
        />
      </div>
    );
  }

  render() {
    const { classes, onChange, getField, isEditable } = this.props;
    const { value } = getField('recurrencePatternTypeId');
    return (
      <div className={classes.root}>
        <div className={classes.flex}>
          <ViewInputControl
            type={EDITOR_TYPES.TEXT_FIELD}
            isEditable={isEditable}
            field={getField('interval')}
            onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
          />
          <ViewInputControl
            type={EDITOR_TYPES.DROPDOWN}
            isEditable={isEditable}
            field={getField('recurrencePatternTypeId')}
            options={yearTypeOptions}
            getOptionLabel={option => (isEditable ? option?.label : this.recurrencePatternLabel)}
            onValueChange={(value, fieldKey) => onChange(value['value'], fieldKey)}
          />
        </div>
        {value === RECURRENCE_PATTERN_TYPE.YEARLY ? this.absoluteYearly : this.relativeYearly}
      </div>
    );
  }
}

export default withStyles(styles)(YearlyView);
