import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { withStyles } from '@material-ui/core';
import { AirportLogisticsStore } from './../Shared/Stores/AirportLogistics.store';
import SurveyReviewHeader from './SurveyReviewHeader/SurveyReviewHeader';
import SurveyReviewBody from './SurveyReviewBody/SurveyReviewBody';
import SurveyReviewFooter from './SurveyReviewFooter/SurveyReviewFooter';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { styles } from './SurveyReview.styles';
import { UIStore, withRouter, IClasses, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  params?: { [name: string]: string };
  classes?: IClasses;
};

@inject('airportLogisticsStore')
@observer
class SurveyReview extends UnsubscribableComponent<Props> {
  /* istanbul ignore next */
  @action
  public loadGroundLogistics(): void {

    UIStore.setPageLoader(true);
    this.store
      .getAircraftLogistics(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  private get header(): ReactNode {
    return <SurveyReviewHeader surveyInfo={this.store.surveyInfo} />;
  }

  private get id(): number {
    return Number(this.props.params?.id);
  }

  private get store(): AirportLogisticsStore {
    return this.props.airportLogisticsStore;
  }

  componentDidMount(): void {
    if (!this.store.surveyDetail?.surveyInfo || this.store.surveyDetail?.surveyInfo?.id !== this.id) {
      this.loadGroundLogistics();
    }
  }

  componentDidUpdate(): void {
    if (!this.store.surveyDetail?.surveyInfo) {
      this.loadGroundLogistics();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {this.header}
        <SurveyReviewBody />
        <SurveyReviewFooter />
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(SurveyReview));
export { SurveyReview as PureSurveyReview };