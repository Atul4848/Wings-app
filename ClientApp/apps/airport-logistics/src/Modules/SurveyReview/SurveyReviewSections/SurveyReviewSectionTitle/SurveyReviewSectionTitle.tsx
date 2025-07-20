import React, { FC, Fragment } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';

import { styles } from './SurveyReviewSectionTitle.styles';

type Props = {
  title: string;
  subTitle?: string;
  palette?: Palette;
};

export const SurveyReviewSectionTitle: FC<Props> = ({ title, subTitle, palette }) => {
  const classes = styles(palette);
  return (
    <Fragment>
      <h3 className={classes.title}>
        {title}
      </h3>
      {Boolean(subTitle) &&
        <h4 className={classes.subTitle}>
          {subTitle}
        </h4>
      }
      
    </Fragment>
  );
};

export default withTheme(SurveyReviewSectionTitle);
