import React, { ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { takeUntil } from 'rxjs/operators';
import { AirportLogisticsStore } from '../../../Shared/Stores/index';
import { SurveyTabs } from '../../../Shared/Components/index';
import { AirportEventsModel } from '../../../Shared/Models/index';
import { AlertStore } from '@uvgo-shared/alert';
import { EventAirport, EventHandler } from './index';
import { AxiosError } from 'axios';
import { UIStore, withRouter, UnsubscribableComponent } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  params: { [name: string]: string };
};

@inject('airportLogisticsStore')
@observer
class EventsAndPertinent extends UnsubscribableComponent<Props> {
  private get airport(): AirportEventsModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.airportEvents;
  }

  @computed
  private get tabs(): ReactNode {
    if (!this.airport) {
      return null;
    }

    return (
      <SurveyTabs
        airport={<EventAirport airport={this.airport} />}
        handler={<EventHandler
          approved={this.airport.approvedHandlerInfo}
          unApproved={this.airport.unApprovedHandlerInfo}
        />}
      />
    );
  }

  @action
  public loadAirportEvents(id: number): void {
    const { airportLogisticsStore } = this.props;
    UIStore.setPageLoader(true);
    airportLogisticsStore
      .getAirportEvents(id)
      .pipe(takeUntil(airportLogisticsStore.reset$))
      .subscribe({
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  }

  componentDidMount(): void {
    const { airportLogisticsStore, params } = this.props;
    const id = Number(params.id);
    if (!airportLogisticsStore.airportEvents) {
      this.loadAirportEvents(id);
    }
  }

  render() {
    return this.tabs;
  }
}

export default withRouter(EventsAndPertinent);
