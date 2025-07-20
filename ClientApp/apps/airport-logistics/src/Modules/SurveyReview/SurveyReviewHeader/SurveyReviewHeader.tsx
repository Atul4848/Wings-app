import React, { FC } from 'react';
import { Typography, withTheme } from '@material-ui/core';
import SurveyReviewHeaderDetails from './SurveyReviewHeaderDetails/SurveyReviewHeaderDetails';
import { SurveyModel } from './../../Shared/Models/index';
import { Palette } from '@material-ui/core/styles/createPalette';
import { styles } from './SurveyReviewHeader.styles';

type Props = {
  surveyInfo: SurveyModel;
  palette?: Palette;
};

export const SurveyReviewHeader: FC<Props> = ({
  surveyInfo,
  palette,
}) => {
  const classes = styles(palette);
  let surveyInfoHeader = surveyInfo;
  if (!surveyInfo?.airportName) {
    surveyInfoHeader = new SurveyModel();
  }
  return (
    <div className={classes.container}>
      <Typography component="h3">
        {surveyInfoHeader.placeholderProtected(surveyInfoHeader.airportName)}
      </Typography>
      <SurveyReviewHeaderDetails
        info={surveyInfoHeader}
      />
    </div>
  );
};

export default withTheme(SurveyReviewHeader);
