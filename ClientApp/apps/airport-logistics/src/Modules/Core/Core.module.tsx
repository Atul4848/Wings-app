import React, { Component, ReactNode, Suspense } from 'react';
import { Paper, withStyles } from '@material-ui/core';
import { Routes, Route } from 'react-router-dom';
import { styles } from './Core.module.styles';
import { IClasses } from '@wings-shared/core';

const Surveys = React.lazy(() => import(/* webpackChunkName: "surveys" */ './../Surveys/Surveys'));
const SurveyReview = React.lazy(() => import(/* webpackChunkName: "survey-review" */ './../SurveyReview/SurveyReview'));

type Props = {
  classes: IClasses;
};

class CoreModule extends Component<Props> {
  public render(): ReactNode {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Suspense fallback={null}>
            <Routes>
              <Route index element={<Surveys />} />
              <Route path="survey/:id" element={<SurveyReview />} />
            </Routes>
          </Suspense>
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(CoreModule);
