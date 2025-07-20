import React, { FC, ReactNode } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyReviewHeaderItem.styles';

type Props = {
  label: string;
  value?: string;
  status?: ReactNode;
  palette?: Palette;
};

export const SurveyReviewHeaderItem: FC<Props> = ({ label, value, status, palette }) => {
  const classes = styles(palette);
  return (
    <div className={classes.container}>
      <div className={classes.label}>
        {label}
      </div>
      {Boolean(status) && status}
      <div>
        {value}
      </div>
    </div>
  );
};

export default withTheme(SurveyReviewHeaderItem);
