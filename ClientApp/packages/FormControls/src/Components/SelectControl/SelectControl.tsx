import React, { FC } from 'react';
import { styles } from './SelectControl.styles';
import { Field } from 'mobx-react-form';
import { withStyles, FormLabel } from '@material-ui/core';
import SelectInputControl from '../SelectInputControl/SelectInputControl';
import { booleanOptions } from './BooleanControlOptions';
import { IClasses, IOptionValue, getStringToYesNoNull, getYesNoNullToBoolean, SelectOption } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  disabled?: boolean;
  field: Field;
  onValueChange: (value: IOptionValue, fieldKey: string) => void;
  options: SelectOption[];
  isBoolean: boolean;
  showLabel?: boolean;
  excludeEmptyOption?: boolean;
}

const SelectControl: FC<Props> = ({
  field,
  classes,
  options,
  isBoolean = false,
  disabled,
  onValueChange,
  showLabel,
  excludeEmptyOption = false,
}: Props) => {
  const value = isBoolean ? getStringToYesNoNull(field.value) : field.value;
  const _options = isBoolean
    ? excludeEmptyOption
      ? booleanOptions.filter(el => Object.keys(el.value).length)
      : booleanOptions
    : options;
  return (
    <div className={classes.root}>
      {showLabel && (
        <FormLabel className={classes.labelRoot} required={field.rules?.includes('required')}>
          {field.label.replace('*', '')}
        </FormLabel>
      )}
      <SelectInputControl
        classes={{
          menuItem: classes.menuItem,
          root: classes.selectControlRoot,
        }}
        disabled={field.disabled || disabled}
        value={value}
        selectOptions={_options}
        onOptionChange={selectedOption => {
          const value = isBoolean ? getYesNoNullToBoolean(selectedOption) : selectedOption;
          onValueChange(value, field.key);
        }}
        onFocus={() => field.onFocus()}
      />
    </div>
  );
};
export default withStyles(styles)(SelectControl);
