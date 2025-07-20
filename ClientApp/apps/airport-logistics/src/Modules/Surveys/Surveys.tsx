import React, { Component, ReactNode, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './Survey.styles';
import SurveyTable from './SurveyTable/SurveyTable';
import SurveyHeader from './SurveyHeader/SurveyHeader';
import SurveyFooter from './SurveyFooter/SurveyFooter';

import { AirportLogisticsStore } from './../Shared/Stores/index';
import { computed } from 'mobx';
import { Scrollable } from '@uvgo-shared/scrollable';
import { UIStore, IClasses } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  classes?: IClasses;
};

@inject('airportLogisticsStore')
@observer
class Surveys extends Component<Props> {
  private get surveysLength(): number {
    return this.props.airportLogisticsStore.surveyList.surveys?.length;
  }

  @computed
  private get surveyTable(): ReactNode {
    if (!this.surveysLength) {
      return null;
    }

    return <SurveyTable />;
  }

  @computed
  private get surveyFooter(): ReactNode {
    const { airportLogisticsStore } = this.props;
    if (!this.surveysLength) {
      return null;
    }
    return (
      <SurveyFooter
        counts={airportLogisticsStore.surveyList.counts}
      />
    );
  }

  @computed
  private get noDataLabel(): ReactElement {
    const { classes } = this.props;

    if (UIStore.pageLoading || this.surveysLength) {
      return null;
    }
    
    return <div className={classes.noDataLabel}>No survey(s) available.</div>;
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <SurveyHeader />
        <Scrollable className={classes.scroll}>
          {this.noDataLabel}
          {this.surveyTable}
        </Scrollable>
        {this.surveyFooter}
      </React.Fragment>
    );
  }

}

export default withStyles(styles)(Surveys);
