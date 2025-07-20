import React from 'react';
import { ICellEditorReactComp } from 'ag-grid-react';
import MobxReactForm from 'mobx-react-form';
import { ICellEditorParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { conformToMask } from 'react-text-mask';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';
import AgGridTextField from '../AgGridTextField/AgGridTextField';
import AgGridBaseEditor from '../AgGridBaseEditor/AgGridBaseEditor';
import { IClasses, regex, getFormValidation } from '@wings-shared/core';

interface Props extends Partial<ICellEditorParams> {
  classes?: IClasses;
  ignoreNumber?: boolean;
  isUnique?: (value: string, fieldKey?: string) => string;
  type?: string;
  inputProps?: Object;
  inputRegex?: (string | RegExp)[];
  getRules?: (props: ICellEditorParams) => void;
  getLabel?: (props: ICellEditorParams) => void;
}

@observer
class AgGridCellEditor extends AgGridBaseEditor<Props> implements ICellEditorReactComp {
  @observable private customErrorMessage: string = '';

  private form: MobxReactForm;
  constructor(props) {
    super(props);
    this.form = getFormValidation({
      field: {
        label:
          typeof props.getLabel === 'function'
            ? props.getLabel(props)
            : props.colDef?.headerName,
        type: props.type || 'text',
        value:
          typeof props.formatValue === 'function'
            ? props.formatValue(props.value)
            : props.value,
        validators: props.validators,
        rules:
          typeof props.getRules === 'function'
            ? props.getRules(props)
            : props.rules,
        placeholder: props.placeHolder,
      },
    });
  }

  public getValue(): string {
    const { ignoreNumber } = this.props;
    const { field } = this.form.values();

    // If we needs to parse value from Parent Component
    const icCallable = typeof this.props.parseValue === 'function';
    if (icCallable) {
      return this.props.parseValue(field);
    }
    const data = new RegExp(regex.numberOnly);
    return !ignoreNumber && data.test(field) ? parseInt(field) : field;
  }

  public isCancelAfterEnd(): boolean {
    return this.form.hasError;
  }

  // needs to access from parent component
  public get errorMessage(): string {
    return this.hasError
      ? this.customErrorMessage || `${this.props.colDef.headerName} is Required`
      : '';
  }

  // needs to access from parent component
  public get hasError(): boolean {
    return Boolean(this.customErrorMessage) || this.form.hasError;
  }

  // set setValue using instance
  public setValue(value: string): void {
    this.form.$('field').set(value);
  }

  // set rules using instance
  @action
  public setRules(rules: string): void {
    this.form.$('field').set('rules', rules);
    this.form.validate();
    this.form.$('field').showErrors(true);
  }

  // set error using instance
  @action
  public setCustomError(message: string): void {
    this.customErrorMessage = message;
  }

  private onInputChange(value: string): void {
    this.customErrorMessage = '';
    this.form.$('field').set(this.useInputRegex(value));
    this.form.$('field').showErrors(true);
    const { isUnique, colDef } = this.props;
    const isCallable = isUnique instanceof Function;
    if (isCallable && !this.customErrorMessage) {
      this.customErrorMessage = isUnique(value, colDef.field)
        ? ''
        : `${colDef.headerName} should be unique`;
    }
    this.parentOnChange(this.useInputRegex(value));
  }

  //to use input mask regex in editor
  private useInputRegex(value: string): string {
    const { inputRegex } = this.props;
    return inputRegex
      ? conformToMask(value, inputRegex, { guide: false }).conformedValue
      : value;
  }

  private onInputBlur(): void {
    this.form.$('field').showErrors(true);
    this.parentOnBlur(this.form.$('field').value);
  }

  render() {
    const { inputProps } = this.props;
    const { hasError, touched, error, value } = this.form.$('field');
    const showError: boolean =
      Boolean(this.customErrorMessage) ||
      (hasError && touched && Boolean(error)) ||
      (!!value && hasError);
    return (
      <AgGridTooltip
        arrow
        open={this.isDisable ? false : showError}
        title={this.customErrorMessage || error || ''}
        placement="bottom-start"
      >
        <AgGridTextField
          {...this.form.$('field').bind()}
          autoFocus
          label="" // label not required in grid
          variant="outlined"
          autoComplete="off"
          error={this.isDisable ? false : showError}
          inputRef={this.textFieldRef}
          disabled={this.isDisable}
          onBlur={() => this.onInputBlur()}
          onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
            this.onInputChange(target.value)
          }
          inputProps={inputProps}
        />
      </AgGridTooltip>
    );
  }
}

export default AgGridCellEditor;
export { AgGridCellEditor as PureAgGridCellEditor };
