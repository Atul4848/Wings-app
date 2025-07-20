import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Palette } from '@material-ui/core/styles/createPalette';
import { Field } from 'mobx-react-form';
import moment from 'moment';

type Props = {
  field: Field;
  palette?: Palette;
  minDate?: string;
  maxDate?: string;
  allowKeyboardInput?: boolean;
};

@observer
class SurveyDatePickerEditor extends Component<Props> {

  @action
  private changeHandler(date: string, field: Field): void {
    const momentDate: moment.Moment = moment(date);
    const formmatedDate = momentDate.isValid() ? momentDate.format('DD-MMM-YYYY') : '';
    field.set('value', formmatedDate);
  }

  private onKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
    const { allowKeyboardInput } = this.props;
    if (!allowKeyboardInput) {
      event.preventDefault();
    }
  }
  render() {
    const { minDate, maxDate, field } = this.props;

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          {...field.bind()}
          disableToolbar
          autoOk={true}
          variant="inline"
          format="MM/dd/yyyy"
          margin="none"
          KeyboardButtonProps={{
            'aria-label': field.placeholder,
          }}
          minDate={minDate}
          maxDate={maxDate}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => this.onKeyPress(e)}
          onChange={(date: string) => this.changeHandler(date, field)}
        />
      </MuiPickersUtilsProvider>
    );
  }
}

export default SurveyDatePickerEditor;
