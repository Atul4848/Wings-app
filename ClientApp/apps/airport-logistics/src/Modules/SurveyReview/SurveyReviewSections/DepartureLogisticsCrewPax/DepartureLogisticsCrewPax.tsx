import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AirportLogisticsStore } from '../../../Shared/Stores/index';
import { DepartureLogisticsAirport, DepartureLogisticsHandler } from './index';
import { SurveyTabs } from '../../../Shared/Components/index';
import { DepartureAirportModel, DepartureHandlerModel } from '../../../Shared/Models/index';
import { AlertStore } from '@uvgo-shared/alert';
import { UIStore, withRouter, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  params: { [name: string]: string };
};

@inject('airportLogisticsStore')
@observer
class DepartureLogisticsCrewPax extends UnsubscribableComponent<Props> {
  @computed
  private get airport(): DepartureAirportModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.departureLogistics?.logistics?.airport;
  }
  @computed
  private get handler(): DepartureHandlerModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.departureLogistics?.logistics?.handler;
  }

  @computed
  private get hasData(): boolean {
    const { airportLogisticsStore: { departureLogistics } } = this.props;
    return Boolean(departureLogistics?.logistics);
  }

  @computed
  private get tabs(): ReactNode {
    if (!this.hasData) {
      return null;
    }

    return (
      <SurveyTabs
        airport={<DepartureLogisticsAirport airport={this.airport} />}
        handler={<DepartureLogisticsHandler handler={this.handler} />}
      />
    );
  }

  @action
  public loadDepartureLogistics(id: number): void {
    const { airportLogisticsStore } = this.props;
    UIStore.setPageLoader(true);
    airportLogisticsStore
      .getDepartureLogistics(id)
      .pipe(takeUntil(airportLogisticsStore.reset$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  componentDidMount(): void {
    const { airportLogisticsStore, params } = this.props;
    const id = Number(params.id);
    if (!airportLogisticsStore.departureLogistics) {
      this.loadDepartureLogistics(id);
    }
  }

  render() {
    return this.tabs;
  }
}

export default withRouter(DepartureLogisticsCrewPax);
