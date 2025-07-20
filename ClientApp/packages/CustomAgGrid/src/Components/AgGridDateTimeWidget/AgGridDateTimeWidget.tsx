import { withStyles } from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTimeOutlined';
import { DATE_FORMAT, getFormValidation, IClasses, IOptionValue, Utilities } from '@wings-shared/core';
import { EDITOR_TYPES, IViewInputControl, ViewInputControl } from '@wings-shared/form-controls';
import { HoursTimeModel, seunsetSunriseOptions, SUNSET_SUNRISE_TYPE } from '@wings-shared/scheduler';
import { RowNode } from 'ag-grid-community';
import { ICellEditorReactComp } from 'ag-grid-react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import MobxReactForm, { Field } from 'mobx-react-form';
import moment from 'moment';
import React, { ReactNode, RefObject } from 'react';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import AgGridPopover, { PureAgGridPopover } from '../AgGridPopover/AgGridPopover';
import { IBaseEditorProps } from '../../Interfaces';
import { styles } from './AgGridDateTimeWidget.styles';
import { fields } from './fields';

interface Props extends Partial<IBaseEditorProps> {
  timeLabel?: string;
  classes?: IClasses;
  isStartDateTime?: boolean;
  startDate?: () => string;
  endDate?: () => string;
  isTimeOnly?: (node: RowNode) => boolean;
}

@observer
class AgGridDateTimeWidget extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  private readonly timeFormat: string = 'HH:mm';
  protected popoverRef: RefObject<PureAgGridPopover> = React.createRef();
  @observable private initialValue: HoursTimeModel;

  /* istanbul ignore next */
  public static defaultProps = {
    timeLabel: 'Start Time LT',
    isStartDateTime: true,
  };

  @observable private form: MobxReactForm;

  constructor(props) {
    super(props);
    this.form = getFormValidation(fields);
  }

  componentDidMount() {
    const { timeLabel } = this.props;
    this.initialValue = this.props.value || new HoursTimeModel();
    this.setValue(this.initialValue);
    this.getField('time').set('label', timeLabel);
    this.getField('time').set('placeholder', `Select ${timeLabel}`);
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  private get momentTime(): moment.Moment {
    const { time } = this.form.values();
    if (!time) {
      return null;
    }
    return moment(time, DATE_FORMAT.API_FORMAT);
  }

  // needs to access from parent component
  public get hasError(): boolean {
    return Boolean(this.errorMessage || this.invalidTimeMessage || this.form.hasError);
  }

  // Check if time is not 00:00 or 24:00
  private get invalidTimeMessage(): string {
    const { colDef } = this.props;
    const time: string = this.momentTime?.format(this.timeFormat);
    if (time === '00:00' || time === '24:00') {
      return `${colDef.headerName} should be between 00:01 to 23:59`;
    }
    return '';
  }

  // needs to access from parent component
  public get errorMessage(): string {
    const { isStartDateTime, colDef } = this.props;
    const { hasError } = this.form;

    if (hasError && !this.hasValueSolarTime) {
      return this.form.error || 'Invalid Time';
    }

    if (!Boolean(this.momentTime) && this.isRequired && this.isTimeOnly) {
      return `${colDef.headerName} is Required`;
    }

    // Check has date value is valid or not
    if (this.momentTime && !this.momentTime.isValid()) {
      return `${colDef.headerName} has Invalid time`;
    }

    const _selectedDateTime: string = this.momentTime?.format(DATE_FORMAT.API_FORMAT);
    const mergedDateTime: string =
      Utilities.combineDateTime(isStartDateTime ? this.startDate : this.endDate, _selectedDateTime) ||
      _selectedDateTime;

    const compareDateTime: string = isStartDateTime ? this.maxDate : this.minDate;
    return this.validDateTime(mergedDateTime, compareDateTime, isStartDateTime, 'time', false, this.ignoreDate);
  }

  private get startDate(): string {
    const { startDate } = this.props;
    const isCallable: boolean = typeof startDate === 'function';
    return isCallable ? startDate() : '';
  }

  private get endDate(): string {
    const { endDate } = this.props;
    const isCallable: boolean = typeof endDate === 'function';
    return isCallable ? endDate() : '';
  }

  private get isTimeOnly(): boolean {
    const { node, isTimeOnly } = this.props;
    const isCallable: boolean = typeof isTimeOnly === 'function';
    return isCallable ? isTimeOnly(node) : false;
  }

  private get isOpen(): boolean {
    return this.popoverRef.current?.isOpen;
  }

  private get value(): string {
    const hoursTimeModel = new HoursTimeModel({ ...this.props.value, ...this.form.values() });
    return hoursTimeModel.formattedSolarTime;
  }

  public refresh(params: any): boolean {
    return true;
  }

  // AgGrid Lifecycle method
  public getValue(): HoursTimeModel {
    return new HoursTimeModel({ ...this.props.value, ...this.form.values() });
  }

  @action
  public setValue(hoursTime: HoursTimeModel): void {
    this.initialValue = hoursTime;
    this.form.set(hoursTime);
  }

  // On Cancel Reset value to initial value
  @action
  private onPopperCancelClick(): void {
    this.setValue(this.initialValue);
    this.parentOnChange(this.initialValue);
  }

  @action
  private onPopperOkClick(): void {
    this.initialValue = this.getValue();
    this.setValue(this.initialValue);
    this.parentOnChange(this.initialValue);
  }

  @action
  private onValueChange(value: IOptionValue, fieldKey: string): void {
    if (Utilities.isEqual(fieldKey, 'solarTime')) {
      this.getField('time').set('');
      this.getField('offSet').set('');
    }
    this.getField(fieldKey).set(value);
  }

  private get hasValueSolarTime(): boolean {
    const { value } = this.getField('solarTime');
    return value ? !Utilities.isEqual(value?.id, SUNSET_SUNRISE_TYPE.NONE) : false;
  }

  private get startTimeInputControls(): IViewInputControl[] {
    return [
      {
        fieldKey: 'time',
        type: EDITOR_TYPES.TIME,
        dateTimeFormat: DATE_FORMAT.APPOINTMENT_TIME,
        is12HoursFormat: false,
        isDisabled: this.hasValueSolarTime,
        customErrorMessage: this.invalidTimeMessage || this.errorMessage,
      },
      {
        fieldKey: 'solarTime',
        type: EDITOR_TYPES.DROPDOWN,
        options: seunsetSunriseOptions,
        isDisabled: this.isTimeOnly,
      },
      {
        fieldKey: 'offSet',
        type: EDITOR_TYPES.TEXT_FIELD,
        isDisabled: this.isTimeOnly || !this.hasValueSolarTime,
        customErrorMessage: this.form.error,
      },
    ];
  }

  private get popperContent(): ReactNode {
    const { classes } = this.props;
    return (
      <div className={classes.flexRow}>
        {this.startTimeInputControls.map((inputControl: IViewInputControl, index: number) => (
          <ViewInputControl
            {...inputControl}
            key={index}
            field={this.getField(inputControl.fieldKey)}
            isEditable={true}
            isDisabled={inputControl.isDisabled}
            customErrorMessage={inputControl.customErrorMessage}
            onValueChange={(option, fieldKey) => this.onValueChange(option, inputControl.fieldKey)}
          />
        ))}
      </div>
    );
  }

  public render(): ReactNode {
    const hasError = !this.isOpen && this.hasError;
    return (
      <AgGridPopover
        innerRef={this.popoverRef}
        popperContent={this.popperContent}
        endAdornmentIcon={<AccessTimeIcon />}
        isDisabled={this.isDisable}
        hasError={this.hasError}
        toolTip={hasError ? this.errorMessage : ''}
        onOkClick={() => this.onPopperOkClick()}
        onCancelClick={() => this.onPopperCancelClick()}
        value={this.value}
      />
    );
  }
}

export default withStyles(styles)(AgGridDateTimeWidget);
export { AgGridDateTimeWidget as PureAgGridDateTimeWidget };
