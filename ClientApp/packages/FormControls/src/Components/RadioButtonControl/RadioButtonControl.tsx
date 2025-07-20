import React, { FC } from 'react';
import { Field } from 'mobx-react-form';
import { withStyles, FormLabel, FormControl, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { IClasses, IOptionValue, SelectOption } from '@wings-shared/core';
import { styles } from './RadioButtonControl.styles';

interface Props {
  classes?: IClasses;
  disabled?: boolean;
  field: Field;
  onValueChange: (value: IOptionValue, fieldKey: string) => void;
  options: SelectOption[];
  showLabel?: boolean;
  defaultValue?: string;
}

const RadioButtonControl: FC<Props> = ({ classes, disabled, field, onValueChange, options, showLabel, defaultValue }: Props) => {
  return (
    <div className={classes.root}>
      <div className={classes.fieldsContainer}>
        {showLabel && <FormLabel className={classes.labelRoot}>{field.label}</FormLabel>}
        <div className={classes.selectInputRoot}>
          <FormControl fullWidth variant="outlined">
            <RadioGroup
              row
              value={field.value.toLocaleLowerCase() || defaultValue.toLocaleLowerCase()}
              onChange={event => onValueChange(event.target.value as string, field.key)}
            >
              {options.map((option, index) => {
                return (
                  <FormControlLabel
                    disabled={disabled}
                    key={index}
                    value={option.value.toString().toLocaleLowerCase() as any}
                    control={<Radio />}
                    label={option.name}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </div>
  );
};
export default withStyles(styles)(RadioButtonControl);
