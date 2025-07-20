import React from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { withStyles } from '@material-ui/core';
import { styles } from './AgGridDateTimePicker.styles';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';
import { IBaseEditorProps } from '../../Interfaces';
import { action, observable } from 'mobx';
import { Utilities, DATE_FORMAT, DATE_TIME_PICKER_TYPE } from '@wings-shared/core';
import { DateTimePicker } from '@wings-shared/form-controls';

interface Props extends Partial<IBaseEditorProps> {
  size?: string;
  pickerType?: DATE_TIME_PICKER_TYPE;
  format?: string;
  allowKeyboardInput?: boolean;
  isStartDateTime?: boolean;
  disablePast?: boolean;
  datePickerViews?: Array<'year' | 'date' | 'month'>;
}

@observer
class AgGridDateTimePicker extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  @observable private selectedDateTime: string = '';

  /* istanbul ignore next */
  public static defaultProps = {
    isStartDateTime: true,
  };

  constructor(props) {
    super(props);
    this.selectedDateTime = this.props.value;
  }

  public setValue(value: string): void {
    this.selectedDateTime = value;
  }

  public getValue(): string {
    return this.selectedDateTime;
  }

  public isCancelAfterEnd(): boolean {
    return this.hasError;
  }

  private get momentDate(): moment.Moment {
    if (!this.selectedDateTime) {
      return null;
    }
    return moment(this.selectedDateTime, DATE_FORMAT.API_FORMAT);
  }

  private get isDatePicker(): boolean {
    return Utilities.isEqual(this.props.pickerType, DATE_TIME_PICKER_TYPE.DATE);
  }

  public get errorMessage(): string {
    const currentDateTime = moment().format(DATE_FORMAT.API_FORMAT);
    const { colDef, isStartDateTime, pickerType, disablePast } = this.props;

    // check if date is required and not provided
    if (this.isRequired && !this.momentDate) {
      return `${colDef.headerName} is Required`;
    }

    // Check has date value is valid or not
    if (this.momentDate && !this.momentDate.isValid()) {
      return `${colDef.headerName} has Invalid Date`;
    }

    if (disablePast && this.momentDate.isBefore(currentDateTime)) {
      return `${colDef.headerName} should be after the current date and time.`;
    }

    // check if min/max date provided or not
    const compareDateTime = isStartDateTime ? this.maxDate : this.minDate;
    const selectedDateTime: string = this.momentDate?.format(DATE_FORMAT.API_FORMAT);
    return this.validDateTime(selectedDateTime, compareDateTime, isStartDateTime, pickerType, this.isDatePicker);
  }

  // needs to access from parent component
  public get hasError(): boolean {
    return Boolean(this.errorMessage);
  }

  @action
  private onChange(value: string, date: any): void {
    this.selectedDateTime = date ? date.format(DATE_FORMAT.API_FORMAT) : null;
    this.parentOnChange(this.selectedDateTime);
  }

  render() {
    const { pickerType, format, classes, allowKeyboardInput, datePickerViews } = this.props;
    const hasError = this.showError && this.hasError;
    return (
      <AgGridTooltip arrow open={hasError} title={this.errorMessage} placement="bottom-start" >
        <DateTimePicker
          pickerType={pickerType}
          format={format}
          disabled={this.isDisable}
          containerClass={classes.root}
          onChange={(value: string, date: any) => this.onChange(value, date)}
          value={this.selectedDateTime}
          allowKeyboardInput={allowKeyboardInput}
          datePickerViews={datePickerViews}
          error={hasError}
          minDate={this.minDate}
          maxDate={this.maxDate}
          onBlur={() => (this.showError = true)}
        />
      </AgGridTooltip>
    );
  }
}

export default withStyles(styles)(AgGridDateTimePicker);
export { AgGridDateTimePicker as PureAgGridDateTimePicker };
