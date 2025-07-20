import React, { FC } from 'react';
import { withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { SurveyStatus } from './../../../Shared/Components/SurveyStatus/SurveyStatus';
import SurveyReviewHeaderItem from '../SurveyReviewHeaderItem/SurveyReviewHeaderItem';
import { SurveyModel } from './../../../Shared/Models/Survey.model';

import { styles } from './SurveyReviewHeaderDetails.styles';

type Props = {
  palette?: Palette;
  info: SurveyModel;
};

export const SurveyReviewHeaderDetails: FC<Props> = (({
  info,
  palette,
}) => {
  const classes = styles(palette);
  return (
    <div className={classes.container}>
      <SurveyReviewHeaderItem
        label="ICAO:"
        value={info?.placeholderProtected(info.ICAO)}
      />
      <SurveyReviewHeaderItem
        label="Handler:"
        value={info?.placeholderProtected(info.handlerName)}
      />
      <SurveyReviewHeaderItem
        label="Submitted Date:"
        value={info?.placeholderProtected(info.submittedDate)}
      />
      <SurveyReviewHeaderItem
        label="Review Status:"
        status={
          <SurveyStatus
            label={info?.placeholderProtected(info.statusLabel)}
            modifier={info?.statusClassName}
          />
        }
      />
    </div>
  );
});

export default withTheme(SurveyReviewHeaderDetails);
