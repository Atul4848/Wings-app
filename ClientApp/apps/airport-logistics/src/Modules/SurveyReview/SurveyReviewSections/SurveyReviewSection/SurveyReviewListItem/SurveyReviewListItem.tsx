import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';

import { styles } from './SurveyReviewListItem.styles';

type Props = {
  item: string;
  palette?: Palette;
};

export const SurveyReviewListItem: FC<Props> = ({ item, palette }) => {
  const classes = styles(palette);
  return (
    <div className={classes.container}>
      {item}
    </div>
  );
};

export default withTheme(SurveyReviewListItem);
