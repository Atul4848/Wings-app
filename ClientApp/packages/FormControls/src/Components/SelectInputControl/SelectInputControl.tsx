import React, { FC } from 'react';
import { FormControl, Select, MenuItem } from '@material-ui/core';
import { IClasses, SelectOption } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  value: string | number;
  disabled?: boolean;
  containerClass?: string;
  selectOptions: SelectOption[];
  showEmptyMenu?: boolean;
  onOptionChange?: (item: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SelectInputControl: FC<Props> = ({
  value,
  disabled = false,
  showEmptyMenu,
  onOptionChange,
  containerClass,
  selectOptions,
  classes,
  onFocus,
  onBlur,
}) => {
  return (
    <div className={containerClass}>
      <FormControl fullWidth variant="outlined" className="--large">
        <Select
          value={value || ''}
          disabled={disabled}
          onChange={event => onOptionChange && onOptionChange(event.target.value as string)}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {showEmptyMenu && (
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
          )}
          {selectOptions.map((option, index) => {
            return (
              <MenuItem className={classes?.menuItem}  key={index} value={option.value as any}>
                {option.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectInputControl;
