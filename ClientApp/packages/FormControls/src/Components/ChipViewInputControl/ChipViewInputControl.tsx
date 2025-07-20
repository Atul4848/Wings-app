import React, { Component, ChangeEvent, KeyboardEvent } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, FormLabel, TextField, withStyles } from '@material-ui/core';
import { Field } from 'mobx-react-form';
import { toJS, observable, action } from 'mobx';
import { styles } from './ChipViewInputControl.styles';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { IClasses, Utilities } from '@wings-shared/core';

type Props = {
  classes?: IClasses;
  field?: Field;
  isEditable: boolean;
  placeHolder?: string;
  isLeftIndent?: boolean;
  customErrorMessage?: string;
  isNumber?: boolean;
  onChipAddOrRemove: (value: string[]) => void;
  multiline?: boolean;
  isDisabled?: boolean;
};

@observer
class ChipViewInputControl extends Component<Props> {
  @observable private textInputValue: string = '';

  @action
  private onInputChange(value: string): void {
    this.textInputValue = value.trim();
  }

  private onKeyPressedEvent(eventKey: string): void {
    if (Utilities.isEqual(eventKey, 'Enter')) {
      this.updateValue();
    }
  }

  private updateValue(): void {
    const { field, isNumber } = this.props;
    const { value } = field;
    if (!this.textInputValue.length) {
      return;
    }
    const chipValue = (isNumber && Utilities.getNumberOrNullValue(this.textInputValue)) || this.textInputValue;
    const isDuplicate = value.some((val: string) => val.toLowerCase() === chipValue.toString().toLowerCase());
    if (isDuplicate) {
      this.onInputChange('');
      return;
    }
    value.push(chipValue.toString());
    this.props.onChipAddOrRemove(value);
    this.onInputChange('');
  }

  private onChange(chipValue: string[]): void {
    const { field } = this.props;
    const { value } = field;
    if (chipValue.length < value.length) {
      this.props.onChipAddOrRemove(chipValue);
    }
  }

  render() {
    const {
      field,
      placeHolder,
      isEditable,
      classes,
      isLeftIndent,
      customErrorMessage,
      multiline,
      isDisabled,
    } = this.props;

    const rootClass = classNames({
      [classes.root]: true,
      [classes.leftIndent]: isLeftIndent,
    });

    const inputRootClass = classNames({
      [classes.multiline]: multiline,
    });

    const errorMessage = field.hasError ? customErrorMessage || 'The Format is invalid' : '';

    return (
      <div className={rootClass}>
        <FormLabel className={classes.textRoot}>{field.label}</FormLabel>
        <div>
          {!isEditable ? (
            field.value.map((chip: string, index: number) => <Chip key={index} label={chip} className={classes.chip} />)
          ) : (
            <Autocomplete
              disabled={isDisabled}
              freeSolo
              multiple
              options={[]}
              className="--large"
              value={toJS(field.value) as any}
              renderTags={(value: string[], getTagProps) =>
                value.map((chip: string, index: number) => (
                  <Chip
                    key={index}
                    label={chip}
                    className={classes.chip}
                    {...getTagProps({ index })}
                    onDelete={() => this.props.onChipAddOrRemove(value.filter(_chip => _chip !== chip))}
                  />
                ))
              }
              onChange={(_, value) => this.onChange(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  value={this.textInputValue}
                  placeholder={placeHolder}
                  variant="outlined"
                  error={field.hasError}
                  helperText={errorMessage}
                  onChange={({ target }: ChangeEvent<HTMLInputElement>) => this.onInputChange(target.value)}
                  onKeyUp={({ key }: KeyboardEvent<HTMLInputElement>) => this.onKeyPressedEvent(key)}
                  onBlur={() => this.updateValue()}
                  onFocus={() => field.onFocus()}
                  multiline={multiline}
                  className="--large"
                />
              )}
              classes={{
                inputRoot: inputRootClass,
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ChipViewInputControl);
export { ChipViewInputControl as PureChipViewInputControl };
