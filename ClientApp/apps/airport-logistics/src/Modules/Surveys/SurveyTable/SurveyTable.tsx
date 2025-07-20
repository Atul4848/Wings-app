import React, { Component } from 'react';
import { inject } from 'mobx-react';

import { AirportLogisticsStore } from './../../Shared/Stores/AirportLogistics.store';
import { SurveyTableCore } from './SurveyTableCore/SurveyTableCore';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
};

@inject('airportLogisticsStore')
class SurveyTable extends Component<Props> {
  render() {
    const { airportLogisticsStore } = this.props;
    return (
      <SurveyTableCore rowData={airportLogisticsStore.surveyList?.surveys}></SurveyTableCore>
    );
  }
}

export default SurveyTable;
