import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { SurveyStatus } from './../../Shared/Components/SurveyStatus/SurveyStatus';
import { SURVEY_STATUS } from './../../Shared/Enums/index';
import { styles } from './SurveyFooter.styles';

type Props = {
  palette?: Palette;
  counts: { [name: string]: number };
};

interface Options {
  label: string;
  count: number;
  modifier?: string;
}

export const SurveyFooter: FC<Props> = ({ palette, counts: { approved, underReview, pending, total } }) => {
  const classes = styles(palette);
  const options: Options[] = [
    { label: 'Total', count: total },
    { label: SURVEY_STATUS.APPROVED, count: approved, modifier: 'approved' },
    { label: SURVEY_STATUS.UNDER_REVIEW_FORMATTED, count: underReview, modifier: 'underreview' },
    { label: SURVEY_STATUS.PENDING, count: pending, modifier: 'pending' },
  ];

  return (
    <div className={classes.container}>
      {options.map((option) => (
        <SurveyStatus key={option.label} label={option.label} count={option.count} modifier={option.modifier} />
      ))}
    </div>
  );
};

export default withTheme(SurveyFooter);
