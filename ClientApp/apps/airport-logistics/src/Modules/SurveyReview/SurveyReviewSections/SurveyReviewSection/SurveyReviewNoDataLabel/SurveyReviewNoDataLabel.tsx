import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { AIRPORT_LOGISTICS_DATA_TYPES } from '../../../../Shared';
import classNames from 'classnames';

import { styles } from './SurveyReviewNoDataLabel.styles';

type Props = {
  isApproved?: boolean;
  palette?: Palette;
};

export const SurveyReviewNoDataLabel: FC<Props> = ({ isApproved, palette }) => {
  const classes = styles(palette);
  const containerClasses: string = classNames({
    [classes.noDataLabel]: true,
    [classes.surveyData]: !isApproved,
  });
  const labelType: string = isApproved
    ? AIRPORT_LOGISTICS_DATA_TYPES.UPDATED_MASTER_DATA
    : AIRPORT_LOGISTICS_DATA_TYPES.SURVEY_DATA;
  return <div className={containerClasses}>{`No ${labelType} available`}</div>;
};

export default withTheme(SurveyReviewNoDataLabel);
