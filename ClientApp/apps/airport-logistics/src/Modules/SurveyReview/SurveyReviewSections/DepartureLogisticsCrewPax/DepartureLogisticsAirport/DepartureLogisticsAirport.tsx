import React, { Fragment, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import {
  DEPARTURE_LOGISTICS_CREW_PAX,
  SURVEY_EDIT_TYPES,
} from './../../../../Shared/Enums/index';
import { SurveyReviewSection } from './../../index';
import { AirportLogisticsStore } from './../../../../Shared/Stores/index';
import {
  DepartureAirportModel,
  DepartureAirportDataModel,
  SurveyReviewStatusModel,
} from './../../../../Shared/Models/index';
import { fields, labels, placeholders, rules, options } from './FormFields';
import { IBaseFormSetup } from '../../../../Shared/Interfaces';
import { BaseHandler } from '../../../../Shared/Components';
import { IClasses } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  airport: DepartureAirportModel;
  classes?: IClasses;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class DepartureLogisticsAirport extends BaseHandler<Props, DepartureAirportDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new DepartureAirportDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.airport.unApproved);
  }

  private get approved(): DepartureAirportDataModel {
    return this.props.airport.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(DepartureAirportDataModel, status);

    airportLogisticsStore.departureLogistics.logistics.airport.unApproved = this.unApproved;
    airportLogisticsStore.setHasAccessedAirport(this.unApproved.hasAllAccessed);
  }

  private get departureProcedures(): ReactNode {
    return (
      <Fragment>
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.EARLY_CREW_ARRIVAL}
          approved={this.approved.crewEarlyArrivalLabel}
          unApproved={this.unApproved.crewEarlyArrivalPair}
          field={this.form.$('crewEarlyArrivalPair')}
          type={SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.EARLY_PASSENGER_ARRIVAL}
          approved={this.approved.PaxEarlyArrivalLabel}
          unApproved={this.unApproved.paxEarlyArrivalPair}
          field={this.form.$('paxEarlyArrivalPair')}
          type={SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return <Fragment>{this.departureProcedures}</Fragment>
  }
}

export default DepartureLogisticsAirport;
