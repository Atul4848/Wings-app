import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { AIRPORT_LOGISTICS_DATA_TYPES } from '../../../../Shared';

import { styles } from './SurveyReviewLabel.styles';

type Props = {
  isApproved?: boolean;
  palette?: Palette;
};

export const SurveyReviewLabel: FC<Props> = ({ isApproved, palette }) => {
  const classes = styles(palette);
  const labelClasses: string = isApproved ? classes.approved : classes.unApproved;
  const label: string = isApproved
    ? AIRPORT_LOGISTICS_DATA_TYPES.UPDATED_MASTER_DATA
    : AIRPORT_LOGISTICS_DATA_TYPES.SURVEY_DATA;
  return <div className={labelClasses}>{label}</div>;
};

export default withTheme(SurveyReviewLabel);
