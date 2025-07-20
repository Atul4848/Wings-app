import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { withStyles } from '@material-ui/core';
import SurveyReviewStepHeader from './SurveyReviewStepHeader/SurveyReviewStepHeader';
import { StepperKeeper } from './../../Shared';
import { StepperStore, AirportLogisticsStore } from './../../Shared/Stores/index';
import { SURVEY_REVIEW_STEP_HEADINGS, SURVEY_REVIEW_BUSINESS_AREAS } from './../../Shared/Enums/index';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { styles } from './SurveyReviewBody.styles';
import { AlertStore } from '@uvgo-shared/alert';
import {
  EventsAndPertinent,
  GroundLogisticsAndParking,
  DepartureLogisticsCrewPax,
  ArrivalLogisticsCrewPax,
  Ciq,
} from '../SurveyReviewSections';
import { UnSubmitPayload } from '../../Shared/Interfaces';
import { UIStore, IClasses, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  stepperStore?: typeof StepperStore;
  classes?: IClasses;
};

@inject('airportLogisticsStore', 'stepperStore')
@observer
class SurveyReviewBody extends UnsubscribableComponent<Props> {
  private get title(): string {
    const { stepperStore } = this.props;

    const stepTitleMapper = {
      1: SURVEY_REVIEW_STEP_HEADINGS.AIRCRAFT_GROUND_LOGISTICS_AND_PARKING,
      2: SURVEY_REVIEW_STEP_HEADINGS.CIQ_LOGISTICS_CREW_PAX,
      3: SURVEY_REVIEW_STEP_HEADINGS.ARRIVAL_LOGISTICS_CREW_PAX,
      4: SURVEY_REVIEW_STEP_HEADINGS.DEPARTURE_LOGISTICS_CREW_PAX,
      5: SURVEY_REVIEW_STEP_HEADINGS.EVENT_PERTINENT,
    };

    return (
      stepTitleMapper[stepperStore.activeStep] || SURVEY_REVIEW_STEP_HEADINGS.AIRCRAFT_GROUND_LOGISTICS_AND_PARKING
    );
  }

  private get businessArea(): string {
    const { stepperStore } = this.props;

    const stepTitleMapper = {
      1: SURVEY_REVIEW_BUSINESS_AREAS.AIRCRAFT_GROUND_LOGISTICS_AND_PARKING,
      2: SURVEY_REVIEW_BUSINESS_AREAS.CIQ_LOGISTICS_CREW_PAX,
      3: SURVEY_REVIEW_BUSINESS_AREAS.ARRIVAL_LOGISTICS_CREW_PAX,
      4: SURVEY_REVIEW_BUSINESS_AREAS.DEPARTURE_LOGISTICS_CREW_PAX,
      5: SURVEY_REVIEW_BUSINESS_AREAS.EVENT_PERTINENT,
    };

    return (
      stepTitleMapper[stepperStore.activeStep] || SURVEY_REVIEW_BUSINESS_AREAS.AIRCRAFT_GROUND_LOGISTICS_AND_PARKING
    );
  }

  @computed
  private get content(): ReactNode {
    const { stepperStore } = this.props;
    if (UIStore.pageLoading) {
      return null;
    }

    switch (stepperStore.activeStep) {
      case 1:
        return <GroundLogisticsAndParking />;
      case 2:
        return <Ciq />;
      case 3:
        return <ArrivalLogisticsCrewPax />;
      case 4:
        return <DepartureLogisticsCrewPax />;
      case 5:
        return <EventsAndPertinent />;
      default:
        return <GroundLogisticsAndParking />;
    }
  }

  @action
  private setDefaults(): void {
    const { airportLogisticsStore, stepperStore } = this.props;
    stepperStore.activeStep = 1;
    airportLogisticsStore.ciq = null;
    airportLogisticsStore.arrivalLogistics = null;
    airportLogisticsStore.departureLogistics = null;
    airportLogisticsStore.airportEvents = null;
  }

  private resetData(businessArea: string): void {
    const { airportLogisticsStore } = this.props;

    airportLogisticsStore.resetData(businessArea);
  }

  componentDidMount(): void {
    this.setDefaults();
  }

  @action
  private resetHasAccessed(): void {
    const { airportLogisticsStore } = this.props;
    UIStore.setPageLoader(false);
    airportLogisticsStore.hasAccessedAirport = false;
    airportLogisticsStore.hasAccessedHandler = false;
  }

  private errorHandler(errors: object): void {
    Object.values(errors)?.forEach(errorMessage => AlertStore.critical(errorMessage[0]));
  }

  @action
  private approveGroundLogistics(): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .approveGroundLogistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.resetHasAccessed())
      )
      .subscribe({
        error: (error: AxiosError) => this.errorHandler(error.response.data.errors),
      });
  }

  @action
  private approveArrivalLogistics(): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .approveArrivalLogistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.resetHasAccessed())
      )
      .subscribe({
        error: (error: AxiosError) => this.errorHandler(error.response.data.errors),
      });
  }

  @action
  private approveCiq(): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .approveCiq()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.resetHasAccessed())
      )
      .subscribe({
        error: (error: AxiosError) => this.errorHandler(error.response.data.errors),
      });
  }

  @action
  private approveDepartureLogistics(): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .approveDepartureLogistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.resetHasAccessed())
      )
      .subscribe({
        error: (error: AxiosError) => this.errorHandler(error.response.data.errors),
      });
  }

  @action
  private approveAirportEvents(): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .approveAirportEvents()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.resetHasAccessed())
      )
      .subscribe({
        error: (error: AxiosError) => this.errorHandler(error.response.data.errors),
      });
  }

  @action
  private unSubmitAirportEvent(param: UnSubmitPayload): void {
    UIStore.setPageLoader(true);
    this.airportLogisticsStore
      .unSubmitAirportEvents(param)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.resetData(param.BusinessArea);
          this.resetHasAccessed();
        })
      )
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.response.data.message),
      });
  }

  private get airportLogisticsStore(): AirportLogisticsStore {
    return this.props.airportLogisticsStore;
  }

  @action
  private approveHandler(): void {
    const { stepperStore } = this.props;
    switch (stepperStore.activeStep) {
      case 1:
        this.approveGroundLogistics();
        break;
      case 2:
        this.approveCiq();
        break;
      case 3:
        this.approveArrivalLogistics();
        break;
      case 4:
        this.approveDepartureLogistics();
        break;
      case 5:
        this.approveAirportEvents();
        break;
      default:
        this.approveGroundLogistics();
        break;
    }
  }

  private unSubmitHandler(resetAll: boolean): void {
    const { airportLogisticsStore } = this.props;

    const payload: UnSubmitPayload = {
      AirportLogisticsStageId: airportLogisticsStore.currentAirportLogisticsId,
      BusinessArea: 'ALL',
      RequestedBy: airportLogisticsStore.profile.name,
    };
    if (!resetAll) {
      payload.BusinessArea = this.businessArea;
    }

    this.unSubmitAirportEvent(payload);
  }

  render() {
    const { airportLogisticsStore, classes } = this.props;

    return (
      <div className={classes.container}>
        <SurveyReviewStepHeader
          title={this.title}
          isApproved={airportLogisticsStore.isSurveyApproved}
          approveHandler={() => this.approveHandler()}
          unSubmitHandler={(resetAll: boolean) => this.unSubmitHandler(resetAll)}
        />
        <StepperKeeper> {this.content} </StepperKeeper>
      </div>
    );
  }
}

export default withStyles(styles)(SurveyReviewBody);
