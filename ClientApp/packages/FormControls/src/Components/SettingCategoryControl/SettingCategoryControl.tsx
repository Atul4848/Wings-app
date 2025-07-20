import React, { useMemo } from 'react';
import { styles } from './SettingCategoryControl.style';
import { withStyles, Typography } from '@material-ui/core';
import SelectInputControl from '../SelectInputControl/SelectInputControl';
import { IClasses, SelectOption } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  title: string;
  value: number;
  selectOptions: SelectOption[];
  onOptionChange: (option: number) => void;
}

const SettingCategoryControl: React.FC<Props> = ({ classes, value, selectOptions, onOptionChange, title }) => {

  const _selectOptions = useMemo(() => {
    return selectOptions.sort((a, b) => a.name.localeCompare(b.name));
  }, [ selectOptions ]);

  return (
    <div className={classes.dropDownContainer}>
      <label>{title}</label>
      <SelectInputControl
        containerClass={classes.dropDown}
        value={value}
        selectOptions={_selectOptions}
        onOptionChange={item => onOptionChange(Number(item))}
      />
    </div>
  );
};

export default withStyles(styles)(SettingCategoryControl);