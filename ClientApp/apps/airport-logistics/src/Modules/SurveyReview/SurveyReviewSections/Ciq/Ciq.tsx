import React, { Component, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AirportLogisticsStore } from '../../../Shared/Stores/index';
import CiqAirport from './CiqAirport/CiqAirport';
import CiqHandler from './CiqHandler/CiqHandler';
import { SurveyTabs } from '../../../Shared/Components/index';
import { CiqAirportModel, CiqHandlerModel } from '../../../Shared/Models/index';
import { AlertStore } from '@uvgo-shared/alert';
import { UIStore, withRouter } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  params?: { [name: string]: string };
};

@inject('airportLogisticsStore')
@observer
class Ciq extends Component<Props> {
  private get airport(): CiqAirportModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.ciq.ciqCrewPax.airport;
  }

  private get handler(): CiqHandlerModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.ciq.ciqCrewPax.handler;
  }

  @computed
  private get tabs(): ReactNode {
    if (!this.props.airportLogisticsStore.ciq) {
      return null;
    }

    return (
      <SurveyTabs
        airport={<CiqAirport airport={this.airport} />}
        handler={<CiqHandler handler={this.handler} />}
      />
    );
  }

  @action
  public loadCiq(id: number): void {
    const { airportLogisticsStore } = this.props;
    UIStore.setPageLoader(true);
    airportLogisticsStore
      .getCiqCrewPax(id)
      .pipe(takeUntil(airportLogisticsStore.reset$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  componentDidMount(): void {
    const { airportLogisticsStore } = this.props;
    const id = Number(this.props.params.id);

    if (!airportLogisticsStore.ciq) {
      this.loadCiq(id);
    }
  }

  render() {
    return this.tabs;
  }
}

export default withRouter(Ciq);
