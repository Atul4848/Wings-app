import React, { Component, ReactNode } from 'react';
import { Paper, Popover, TextField, withStyles } from '@material-ui/core';
import MobxReactForm, { Field } from 'mobx-react-form';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { styles } from './LatLongEditor.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { latFields, longFields } from './fields';
import { IViewInputControl } from '../../Interfaces';
import { Coordinate, IClasses, IOptionValue, ISelectOption, getFormValidation } from '@wings-shared/core';
import classNames from 'classnames';
import AutoComplete from '../AutoComplete/AutoComplete';
import { EDITOR_TYPES } from '../../Enums';

interface Props {
  classes?: IClasses;
  value: string;
  isOpen: boolean;
  coordinate?: string;
  toggleElement?: Element;
  fields?: IViewInputControl[];
  onOkClick?: (value: string) => void;
  close: () => void;
}

@observer
class LatLongEditor extends Component<Props> {
  @observable private form: MobxReactForm;

  constructor(props) {
    super(props);
    this.form = getFormValidation(
      this.props.coordinate === Coordinate.LAT ? latFields : longFields
    );
  }

  private getField(key: string): Field {
    return this.form.$(key);
  }

  @action
  private onValueChange(value: IOptionValue, fieldKey: string, field: Field): void {
    field.$changed = 1;
    if (fieldKey === 'dir') {
      this.getField(fieldKey).set((value as ISelectOption)?.value || value);
      return;
    }
    this.getField(fieldKey).set(value);
  }

  /* istanbul ignore next */
  private getNumber(key: string): number {
    const value = this.getField(key).value;
    return Number(value);
  }

  /* istanbul ignore next */
  private getDecimal(): number {
    const { fields } = this.props;
    const result =
      this.getNumber(fields[0].fieldKey) +
      this.getNumber(fields[1].fieldKey) / 60 +
      this.getNumber(fields[2].fieldKey) / 3600;
    return Math.abs(Number(result.toFixed(10)));
  }

  /* istanbul ignore next */
  private convertDecimalToDMS(value: number) {
    const isLng = Boolean(this.props.coordinate === Coordinate.LONG);
    const decimalValue = value < 0 ? -value : value;
    return [
      0 | decimalValue, //Degree
      0 | (((decimalValue + 1e-9) % 1) * 60), //Minutes
      Math.abs((((decimalValue * 60) % 1) * 6000) / 100).toFixed(4), //Seconds
      value < 0 ? (isLng ? 'W' : 'S') : isLng ? 'E' : 'N', // Direction
    ];
  }

  /* istanbul ignore next */
  private get combindValue(): string {
    if (this.props.coordinate === Coordinate.LAT) {
      return (
        this.getDecimal() * (this.getField('dir').value === 'N' ? 1 : -1)
      ).toString();
    }
    return (
      this.getDecimal() * (this.getField('dir').value === 'E' ? 1 : -1)
    ).toString();
  }

  // needs to access from parent component
  public get hasError(): boolean {
    return this.form.hasError || !this.form.changed;
  }

  /* istanbul ignore next */
  @action
  private setValue(): void {
    const result = this.convertDecimalToDMS(Number(this.props.value));
    result?.map((item, index) => this.getField(this.props.fields[index].fieldKey).set(item.toString()));
  }

  private editableContent(inputControl: IViewInputControl, index: number): ReactNode {
    const { classes } = this.props;
    const field = this.getField(inputControl.fieldKey);
    const { errorSync } = field;
    switch (inputControl.type) {
      case EDITOR_TYPES.DROPDOWN:
        return (
          <AutoComplete
            customErrorMessage={inputControl.customErrorMessage}
            placeHolder={`Search ${field.label}`}
            options={inputControl.options}
            value={field.value}
            onDropDownChange={(option: ISelectOption | ISelectOption[]) => {
              this.onValueChange(option, field.key, field);
            }}
            field={field}
            label={field.label}
            hasError={Boolean(inputControl.customErrorMessage)}
          />
        );
      case EDITOR_TYPES.TEXT_FIELD:
      default:
        const textInputRoot = classNames({
          [classes.textInput]: true,
          ['--large']: true,
        });
        return (
          <TextField
            key={index}
            label={field.label}
            value={field.value}
            onChange={e => {
              this.onValueChange(e.target.value, inputControl.fieldKey, field);
            }}
            error={Boolean(inputControl.customErrorMessage) || errorSync}
            helperText={inputControl.customErrorMessage || errorSync}
            disabled={inputControl.isDisabled}
            variant="outlined"
            classes={{ root: textInputRoot }}
            FormHelperTextProps={{
              classes: { root: classes.helperText },
            }}
            InputLabelProps={{
              required: field.rules?.includes('required'),
              classes: {
                root: classes.labelRoot,
              },
            }}
          />
        );
    }
  }

  private get popperContent(): ReactNode {
    const { classes } = this.props;
    const rootClass = classNames({
      [classes.flexRowRoot]: true,
    });
    return (
      <div className={classes.flexRow}>
        {this.props.fields.map((inputControl: IViewInputControl, index: number) => {
          return <div className={rootClass}>{this.editableContent(inputControl, index)}</div>;
        })}
      </div>
    );
  }

  public render(): ReactNode {
    const { classes, isOpen, toggleElement, close, onOkClick } = this.props;
    return (
      <>
        <Popover
          open={isOpen}
          anchorEl={toggleElement}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          onEnter={() => this.setValue()}
        >
          <Paper className={classes.root}>
            {this.popperContent}
            <div className={classes.actions}>
              <PrimaryButton variant="contained" onClick={() => close()}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                variant="contained"
                disabled={this.hasError}
                onClick={() => {
                  onOkClick(this.combindValue);
                  close();
                }}
              >
                Ok
              </PrimaryButton>
            </div>
          </Paper>
        </Popover>
      </>
    );
  }
}

export default withStyles(styles)(LatLongEditor as any);
export { LatLongEditor as PureLatLongEditor };
