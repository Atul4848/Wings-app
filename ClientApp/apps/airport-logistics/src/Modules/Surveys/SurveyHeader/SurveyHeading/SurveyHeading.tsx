import React, { FC, Fragment } from 'react';
import { Typography, withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyHeading.styles';

type Props = {
  numberOfDays: number;
  palette?: Palette;
};

export const SurveyHeading: FC<Props> = ({ numberOfDays, palette }) => {
  const classes = styles(palette);
  return (
    <Fragment>
      <Typography component="h3" className={classes.heading}>
        Surveys
      </Typography>
      <div className={classes.description}>
        (Past {numberOfDays} Days)
      </div>
    </Fragment>
  );
};

export default withTheme(SurveyHeading);
