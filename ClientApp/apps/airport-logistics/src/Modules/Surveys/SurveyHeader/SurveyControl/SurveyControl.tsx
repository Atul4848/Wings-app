import React, { FC, Fragment } from 'react';
import { MenuItem, TextField, withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyControl.styles';

type Props = {
  numberOfDays: number;
  changeHandler?: (numberOfDays: number) => void;
  palette?: Palette;
}

export interface IOption {
  value: number;
  label: string | number;
}

export const SurveyControl: FC<Props> = ({ numberOfDays, changeHandler, palette }) => {
  const classes = styles(palette);
  const options: IOption[] = [
    { value: 10, label: 'Past 10 days' },
    { value: 20, label: 'Past 20 days' },
    { value: 30, label: 'Past 30 days' },
    { value: 60, label: 'Past 60 days' },
    { value: 90, label: 'Past 90 days' },
    { value: 120, label: 'Past 120 days' },
    { value: 150, label: 'Past 150 days' },
    { value: -1, label: 'All surveys' },
  ];

  return (
    <Fragment>
      <div className={classes.label}>Show</div>
      <TextField
        select
        value={numberOfDays}
        onChange={(event) => changeHandler(Number(event.target.value))}
      >
        {options.map(item => (
          <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
        ))}
      </TextField>
    </Fragment>
  );
};

export default withTheme(SurveyControl);
