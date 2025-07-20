import React, { Component, RefObject, ReactNode } from 'react';
import { observer } from 'mobx-react';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { withStyles } from '@material-ui/core/styles';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { styles } from './DateTimePicker.styles';
import MomentUtils from '@date-io/moment';
import { WrapperVariant } from '@material-ui/pickers/wrappers/Wrapper';
import moment from 'moment';
import { Field } from 'mobx-react-form';
// Disable False Warning for TEMP find other solution
moment.suppressDeprecationWarnings = true;

import { computed } from 'mobx';
import { Utilities, DATE_FORMAT, regex, DATE_TIME_PICKER_TYPE, IClasses } from '@wings-shared/core';
import { conformToMask } from 'react-text-mask';
import { TextFieldProps } from '@material-ui/core';

interface PickerProps {
  field?: Field;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (dateValue: string, date?: Date) => void;
  innerRef?: RefObject<HTMLInputElement>;
  format?: string;
  variant?: WrapperVariant;
  rightArrowIcon?: ReactNode;
  minDate?: string;
  maxDate?: string;
  allowKeyboardInput?: boolean;
  errorMessage?: string;
  is12HoursFormat?: boolean;
  showTooltip?: boolean;
  datePickerViews?: Array<'year' | 'date' | 'month'>;
  dateInputMask?: (string | RegExp)[];
  onFocus?: TextFieldProps['onFocus'];
  onBlur?: TextFieldProps['onFocus'];
  // If Dialog Ui Used
  clearable?: boolean;
  okLabel?: string;
  cancelLabel?: string;
  error?: boolean;
}

interface Props extends PickerProps {
  children?: typeof React.Children;
  classes?: IClasses;
  containerClass?: string;
  pickerType: DATE_TIME_PICKER_TYPE;
}

@observer
class DateTimePicker extends Component<Props> {
  /* istanbul ignore next */
  static defaultProps: Props = {
    pickerType: DATE_TIME_PICKER_TYPE.DATE_TIME,
    format: DATE_FORMAT.API_DATE_FORMAT,
    variant: 'inline',
    containerClass: null,
    value: moment().format(DATE_FORMAT.GRID_DISPLAY),
    onChange: (dateValue: string) => null,
    allowKeyboardInput: true,
    is12HoursFormat: true,
  };

  private onKeyPress(event: React.KeyboardEvent<HTMLDivElement>): void {
    const { allowKeyboardInput } = this.props;
    if (!allowKeyboardInput) {
      event.preventDefault();
    }
  }

  @computed
  private get minDate(): string {
    return Utilities.getformattedDate(this.props.minDate, this.props.format) || undefined;
  }

  @computed
  private get maxDate(): string {
    return Utilities.getformattedDate(this.props.maxDate, this.props.format) || undefined;
  }

  private get dateValue(): string {
    return Utilities.getformattedDate(this.props.value, DATE_FORMAT.API_FORMAT);
  }

  private get picker(): ReactNode {
    const {
      field,
      pickerType,
      placeholder,
      disabled,
      variant,
      format,
      errorMessage,
      onFocus,
      onBlur,
      showTooltip,
      classes,
      datePickerViews,
      dateInputMask,
      clearable,
      okLabel,
      cancelLabel,
      error,
    } = this.props;
    const _label = this.props.label?.replace('*', '');
    const _required = field?.rules?.includes('required');
    switch (pickerType) {
      case DATE_TIME_PICKER_TYPE.DATE:
        return (
          <KeyboardDatePicker
            InputLabelProps={{
              required: _required,
              classes: {
                root: classes.labelRoot,
              },
            }}
            InputProps={{
              classes: {
                input: classes.inputRoot,
                adornedEnd: classes.customAdornedEnd
              },
            }}
            title={showTooltip ? _label : ''}
            label={_label}
            placeholder={placeholder}
            disabled={disabled}
            value={this.dateValue}
            variant={variant}
            format={format}
            views={datePickerViews}
            minDate={this.minDate}
            maxDate={this.maxDate}
            invalidDateMessage={''}
            error={error || Boolean(errorMessage)}
            helperText={errorMessage}
            refuse={regex.rifmFormatter}
            rifmFormatter={value =>
              conformToMask(value, dateInputMask || regex.dateInputMask, { guide: false }).conformedValue
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => this.onKeyPress(e)}
            onChange={(date, value: string) => this.props.onChange(value, date as any)}
            autoOk={true}
            onFocus={onFocus}
            onBlur={onBlur}
            clearable={clearable}
            okLabel={okLabel}
            cancelLabel={cancelLabel}
          />
        );
      case DATE_TIME_PICKER_TYPE.TIME:
        return (
          <KeyboardTimePicker
            label={_label}
            InputLabelProps={{
              required: _required,
              classes: {
                root: classes.labelRoot,
              },
            }}
            InputProps={{
              classes: {
                input: classes.inputRoot,
                adornedEnd: classes.customAdornedEnd
              },
            }}
            placeholder={placeholder}
            disabled={disabled}
            value={this.dateValue}
            variant={variant}
            error={error || Boolean(errorMessage)}
            helperText={errorMessage}
            invalidDateMessage={''}
            keyboardIcon={<AccessTimeIcon />}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => this.onKeyPress(e)}
            onChange={(date, value: string) => this.props.onChange(value, date as any)}
            autoOk={true}
            ampm={this.props.is12HoursFormat}
            onFocus={onFocus}
            onBlur={onBlur}
            clearable={clearable}
            okLabel={okLabel}
            cancelLabel={cancelLabel}
          />
        );
      case DATE_TIME_PICKER_TYPE.DATE_TIME:
      default:
        return (
          <KeyboardDateTimePicker
            InputLabelProps={{
              required: _required,
              classes: {
                root: classes.labelRoot,
              },
            }}
            InputProps={{
              classes: {
                input: classes.inputRoot,
                adornedEnd: classes.customAdornedEnd
              },
            }}
            label={_label}
            placeholder={placeholder}
            disabled={disabled}
            value={this.dateValue}
            variant={variant}
            format={format}
            minDate={this.minDate}
            maxDate={this.maxDate}
            error={error || Boolean(errorMessage)}
            helperText={errorMessage}
            invalidDateMessage={''}
            autoOk={true}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => this.onKeyPress(e)}
            onChange={(date, value: string) => this.props.onChange(value, date as any)}
            onFocus={onFocus}
            onBlur={onBlur}
            clearable={clearable}
            okLabel={okLabel}
            cancelLabel={cancelLabel}
            ampm={this.props.is12HoursFormat}
          />
        );
    }
  }

  public render() {
    return (
      <div className={this.props.containerClass}>
        <MuiPickersUtilsProvider utils={MomentUtils}>{this.picker}</MuiPickersUtilsProvider>
      </div>
    );
  }
}

export default withStyles(styles)(DateTimePicker);
