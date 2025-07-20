import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { AirportLogisticsStore } from './../../../Shared/Stores/AirportLogistics.store';
import { SurveyTabs } from './../../../Shared/Components/index';
import GroundLogisticsAirport from './GroundLogisticsAirport/GroundLogisticsAirport';
import GroundLogisticsHandler from './GroundLogisticsHandler/GroundLogisticsHandler';
import {
  AircraftLogisticsParkingAirportModel,
  AircraftLogisticsParkingHandlerModel,
} from './../../../Shared/Models/index';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
};

@inject('airportLogisticsStore')
@observer
class GroundLogisticsAndParking extends Component<Props> {
  private get airport(): AircraftLogisticsParkingAirportModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.surveyDetail.aircraftLogisticsParking.airport;
  }

  private get handler(): AircraftLogisticsParkingHandlerModel {
    const { airportLogisticsStore } = this.props;
    return airportLogisticsStore.surveyDetail.aircraftLogisticsParking.handler;
  }

  render() {
    if (!this.props.airportLogisticsStore.surveyDetail) {
      return null;
    }

    return (
      <SurveyTabs
        airport={<GroundLogisticsAirport airport={this.airport} />}
        handler={<GroundLogisticsHandler handler={this.handler} />}
      />
    )
  }
}

export default GroundLogisticsAndParking;
