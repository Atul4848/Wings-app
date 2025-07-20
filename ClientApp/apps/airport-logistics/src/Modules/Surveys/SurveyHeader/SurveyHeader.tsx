import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import moment from 'moment';
import { AirportLogisticsStore } from './../../Shared/Stores/index';
import { withStyles } from '@material-ui/core';
import SurveyHeading from './SurveyHeading/SurveyHeading';
import SurveyControl from './SurveyControl/SurveyControl';
import { AlertStore } from '@uvgo-shared/alert';
import { styles } from './SurveyHeader.styles';
import { UIStore, IClasses, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  classes?: IClasses;
};

@inject('airportLogisticsStore')
@observer
class SurveyHeader extends UnsubscribableComponent<Props> {
  @observable private numberOfDays: number = 150;
  private readonly dateFormat: string = 'YYYY-MM-DDTHH:mm:ss';

  @action
  loadSurveys(numberOfDays: number): void {
    const { airportLogisticsStore } = this.props;
    this.numberOfDays = Number(numberOfDays);
    const dateFrom = this.numberOfDays >= 0 ? moment().subtract(numberOfDays, 'd').format(this.dateFormat) : null;
    UIStore.setPageLoader(true);
    airportLogisticsStore
      .getSurveys(dateFrom)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  private changeHandler(numberOfDays: number): void {
    this.loadSurveys(numberOfDays);
  }

  componentDidMount(): void {
    this.changeHandler(this.numberOfDays);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.left}>
          <SurveyHeading numberOfDays={this.numberOfDays} />
        </div>
        <div className={classes.right}>
          <SurveyControl
            numberOfDays={this.numberOfDays}
            changeHandler={(numberOfDays: number) => this.changeHandler(numberOfDays)}
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SurveyHeader);
