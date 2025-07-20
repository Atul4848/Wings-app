import React, { Component, ChangeEvent, KeyboardEvent } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, FormLabel, TextField, withStyles } from '@material-ui/core';
import { Field } from 'mobx-react-form';
import { toJS, observable, action } from 'mobx';
import { styles } from './FreeSoloChipInputControl.styles';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { IClasses, Utilities } from '@wings-shared/core';

type Props = {
  classes?: IClasses;
  field?: Field;
  placeHolder?: string;
  customErrorMessage?: string;
  isNumber?: boolean;
  isLeftIndent?: boolean;
  onChipAddOrRemove: (value: string[]) => void;
  multiline?: boolean;
  limitTags?: number;
};

@observer
class FreeSoloChipInputControl extends Component<Props> {
  @observable private textInputValue: string = '';

  static defaultProps = {
    limitTags: 3,
  };

  @action
  private onInputChange(value: string): void {
    this.textInputValue = value.trim();
  }

  /* istanbul ignore next */
  private onKeyPressedEvent(eventKey: string): void {
    if (Utilities.isEqual(eventKey, 'Enter')) {
      this.updateValue();
    }
  }

  private updateValue(): void {
    const { field, isNumber } = this.props;
    const { value } = field;
    if (!this.textInputValue.length || !Array.isArray(value)) {
      return;
    }
    const chipValue =
      (isNumber && Utilities.getNumberOrNullValue(this.textInputValue)) ||
      this.textInputValue;
    const isDuplicate = value.some((val: string) =>
      Utilities.isEqual(val, chipValue)
    );
    if (isDuplicate) {
      this.onInputChange('');
      return;
    }
    value.push(chipValue.toString());
    this.props.onChipAddOrRemove(value);
    this.onInputChange('');
  }
  
  /* istanbul ignore next */
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
      classes,
      customErrorMessage,
      multiline,
      isLeftIndent,
      limitTags,
    } = this.props;
    const rootClass = classNames({ [classes.leftIndent]: isLeftIndent , [classes.textEllipsis]: true });
    const inputRootClass = classNames({ [classes.multiline]: multiline });
    const showError: boolean = Boolean(field.hasError && field.touched);
    const errorMessage = showError ? customErrorMessage || 'The Format is invalid' : '';
    return (
      <div className={rootClass}>
        <FormLabel className={classes.textRoot} required={field?.rules?.includes('required')}>
          {field.label.replace('*', '')}
        </FormLabel>
        <Autocomplete
          freeSolo
          multiple
          options={[]}
          limitTags={limitTags}
          value={toJS(field.value)}
          onChange={(_, value) => this.onChange(value)}
          classes={{ inputRoot: inputRootClass }}
          className="--large"
          renderTags={(value: string[], getTagProps) =>
            value.map((chip: string, index: number) => (
              <Chip
                key={index}
                label={chip}
                classes={{ root: classes.chip }}
                {...getTagProps({ index })}
                onDelete={() =>
                  this.props.onChipAddOrRemove(
                    value.filter(_chip => _chip !== chip)
                  )
                }
              />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              value={this.textInputValue}
              placeholder={placeHolder}
              variant="outlined"
              error={showError}
              helperText={errorMessage}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
                this.onInputChange(target.value)
              }
              onKeyUp={({ key }: KeyboardEvent<HTMLInputElement>) =>
                this.onKeyPressedEvent(key)
              }
              onBlur={() => {
                field.showErrors(true);
                this.updateValue();
              }}
              onFocus={() => {
                field.$touched = true;
                field.onFocus();
              }}
              multiline={multiline}
              className="--large"
            />
          )}
        />
      </div>
    );
  }
}

export default withStyles(styles)(FreeSoloChipInputControl as any);
export { FreeSoloChipInputControl as PueFreeSoloChipInputControl };
