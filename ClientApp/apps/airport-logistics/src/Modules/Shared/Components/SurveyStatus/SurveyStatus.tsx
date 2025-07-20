import React, { FC, ReactElement } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyStatus.styles';

type Props = {
  label: string;
  count?: number;
  palette?: Palette;
  modifier?: string;
};

export const SurveyStatus: FC<Props> = ({ label, count, palette, modifier }) => {
  const classes = styles(palette);
  const labelModifier = modifier?.includes('table') && modifier;
  const statusElement: ReactElement = modifier &&
    <div className={`${classes.label} ${classes.status} ${modifier}`}></div>;
  return (
    <div className={classes.container}>
      {statusElement}
      <div className={`${classes.label} ${labelModifier}`}>{label}</div>
      <div className={classes.count}>{count}</div>
    </div>
  );
};

export default withTheme(SurveyStatus);
