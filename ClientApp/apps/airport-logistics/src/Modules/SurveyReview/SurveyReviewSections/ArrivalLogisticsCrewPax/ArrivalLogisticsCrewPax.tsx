import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { AirportLogisticsStore } from '../../../Shared/Stores/index';
import { ArrivalLogisticsHandler } from './index';
import { SurveyTabs } from '../../../Shared/Components/index';
import { ArrivalLogisticsModel } from '../../../Shared/Models/index';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { UIStore, withRouter, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  params: { [name: string]: string };
};

@inject('airportLogisticsStore')
@observer
class ArrivalLogisticsCrewPax extends UnsubscribableComponent<Props> {
  private get handler(): ArrivalLogisticsModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.arrivalLogistics;
  }

  @computed
  private get tabs(): ReactNode {
    if (!this.handler) {
      return null;
    }

    return <SurveyTabs handler={<ArrivalLogisticsHandler handler={this.handler} />} />;
  }

  @action
  public loadArrivalLogistics(id: number): void {
    const { airportLogisticsStore } = this.props;
    UIStore.setPageLoader(true);
    airportLogisticsStore
      .getArrivalLogistics(id)
      // @todo: temporary fix, as it was not working due to global change.
      .pipe(takeUntil(airportLogisticsStore.reset$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  componentDidMount(): void {
    const { airportLogisticsStore, params } = this.props;
    const id = Number(params.id);
    if (!airportLogisticsStore.arrivalLogistics) {
      this.loadArrivalLogistics(id);
    }
  }

  render() {
    return this.tabs;
  }
}

export default withRouter(ArrivalLogisticsCrewPax);
