import React, { Component, ChangeEvent, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { TextField, withStyles } from '@material-ui/core';
import { Field } from 'mobx-react-form';
import { conformToMask } from 'react-text-mask';
import moment from 'moment';
import { styles } from './SurveyHoursEditor.styles';
import { IClasses } from '@wings-shared/core';

interface timeTypes {
  timeFrom: string;
  timeTo: string;
}

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class SurveyHoursEditor extends Component<Props> {
  private readonly timeTypes: timeTypes = {
    timeFrom: 'timeFrom',
    timeTo: 'timeTo',
  };
  private readonly timeMask = [ /\d/, /\d/, ':', /\d/, /\d/ ];
  private readonly format: string = 'HH:mm';

  @action
  private onChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    timeFromField: Field,
    timeToField: Field,
    type: string
  ): void {
    const { value } = event.target;
    const time = conformToMask(value, this.timeMask, { guide: false });
    const field: Field = type === this.timeTypes.timeFrom ? timeFromField : timeToField;

    let setValue = time.conformedValue;
    if (field.value === time.conformedValue) {
      if (setValue.slice(-1) !== ':') {
        return;
      }
      setValue = setValue.substring(0, setValue.length - 2);
    }

    field.set('value', setValue);

    if (setValue.length === 5 && !moment(setValue, this.format).isValid()) {
      field.value = '';
    }

    if (timeFromField.value.length === 5 && timeToField.value.length === 5) {
      const timeFrom = moment(timeFromField.value, this.format).toString();
      const timeTo = moment(timeToField.value, this.format).toString();
      if (timeTo <= timeFrom) {
        field.value = '';
      }
    }
  }

  private getTime(field: Field, index: number): ReactNode {
    const { classes } = this.props;
    const timeFromField: Field = field.select('timeFrom');
    const timeToField: Field = field.select('timeTo');
    timeFromField.value || timeToField.value
      ? (timeFromField.set('rules', 'required|string|min:5'), timeToField.set('rules', 'required|string|min:5'))
      : (timeFromField.set('rules', 'string'), timeToField.set('rules', 'string'));
    return (
      <div className={classes.container} key={index}>
        <div className={classes.label}>{field.select('day').value}</div>
        <TextField
          {...field.select('timeFrom').bind()}
          className={classes.timeFrom}
          type="text"
          margin="none"
          variant="outlined"
          onChange={event => this.onChange(event, timeFromField, timeToField, this.timeTypes.timeFrom)}
        />
        <TextField
          {...field.select('timeTo').bind()}
          className={classes.timeTo}
          type="text"
          margin="none"
          variant="outlined"
          onChange={event => this.onChange(event, timeFromField, timeToField, this.timeTypes.timeTo)}
        />
      </div>
    );
  }

  render() {
    return <Fragment>{this.props.field.map((field: Field, index: number) => this.getTime(field, index))}</Fragment>;
  }
}

export default withStyles(styles)(SurveyHoursEditor);
