import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { Button, withStyles } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { StepperStore, AirportLogisticsStore } from './../../Shared/Stores/index';
import { IClasses } from '@wings-shared/core';
import { styles } from './SurveyReviewFooter.styles';

type Props = {
  stepperStore?: typeof StepperStore;
  airportLogisticsStore?: AirportLogisticsStore;
  classes?: IClasses;
};

@inject('stepperStore', 'airportLogisticsStore')
@observer
class SurveyReviewFooter extends Component<Props> {
  private get stepper(): typeof StepperStore {
    return this.props.stepperStore;
  }

  private get maxSteps(): number {
    return this.stepper.maxSteps;
  }

  private get activeStep(): number {
    return this.stepper.activeStep;
  }

  private get pagination(): string {
    return `${this.activeStep}/${this.maxSteps}`;
  }

  @action
  private reset(): void {
    const { airportLogisticsStore } = this.props;
    airportLogisticsStore.hasAccessedAirport = false;
    airportLogisticsStore.hasAccessedHandler = false;
  }

  private handleNext(): void {
    this.stepper.handleNext();
    this.reset();
  }
  
  private handleBack(): void {
    this.stepper.handleBack();
    this.reset();
  }
  
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <Button
          size="small"
          color="primary"
          onClick={() => this.handleBack()}
          disabled={this.activeStep === 1}
        >
          <KeyboardArrowLeft />
          Back
        </Button>
        <div className={classes.pagination}>
          {this.pagination}
        </div>
        <Button size="small"
          color="primary"
          onClick={() => this.handleNext()}
          disabled={this.activeStep === this.maxSteps}
        >
          Next
          <KeyboardArrowRight />
        </Button>
      </div>
    );
  }

}

export default withStyles(styles)(SurveyReviewFooter);
