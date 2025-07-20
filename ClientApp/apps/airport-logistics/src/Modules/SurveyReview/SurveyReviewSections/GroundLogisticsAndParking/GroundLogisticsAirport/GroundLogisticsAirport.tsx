import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { GROUND_LOGISTICS_PARKING, SURVEY_EDIT_TYPES, LOGISTICS_COMPONENTS } from './../../../../Shared/Enums/index';
import { SurveyReviewSection } from '../../SurveyReviewSection';
import { AirportLogisticsStore } from './../../../../Shared/Stores/index';
import {
  AircraftLogisticsParkingAirportDataModel,
  AircraftLogisticsParkingAirportModel,
  SurveyReviewStatusModel,
} from './../../../../Shared/Models/index';

import { fields, labels, placeholders, rules, options } from './FormFields';
import { IBaseFormSetup } from '../../../../Shared/Interfaces';
import { BaseHandler } from '../../../../Shared/Components';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  airport?: AircraftLogisticsParkingAirportModel;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class GroundLogisticsAirport extends BaseHandler<Props, AircraftLogisticsParkingAirportDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new AircraftLogisticsParkingAirportDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.airport.unApproved);
  }
  
  private get approved(): AircraftLogisticsParkingAirportDataModel {
    return this.props.airport.approved;
  }

  private updateICAOsList(): void {
    const nearbyParkingAirportsField = this._getField('nearbyParkingAirports');
    const nearbyParkingAirportsValue = nearbyParkingAirportsField.value ?
      nearbyParkingAirportsField.value.replace(/(\s|,\s)/g, ',') : '';
    nearbyParkingAirportsField.set('value', nearbyParkingAirportsValue);
  }

  private updateHandler(status: SurveyReviewStatusModel): void {
    this.updateICAOsList();

    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(AircraftLogisticsParkingAirportDataModel, status);

    airportLogisticsStore.surveyDetail.aircraftLogisticsParking.airport.unApproved = this.unApproved;
    this.props.airportLogisticsStore.setHasAccessedAirport(this.unApproved.hasAllAccessed);
  }

  private get airportTabContent(): React.ReactNode {
    return (
      <Fragment>
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.PARKING_DIFFICULTY_MONTHS}
          approved={this.approved.parkingDiffMonths}
          unApproved={this.unApproved.parkingDiffMonths}
          field={this._getField('parkingDiffMonths')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
          modifier="threeColumns"
          component={LOGISTICS_COMPONENTS.PARKING_DIFFICULTY_MONTHS}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.OVER_NIGHT_PARKING_ISSUES}
          approved={this.approved.overnightParkingIssue}
          unApproved={this.unApproved.overnightParkingIssue}
          field={this._getField('overnightParkingIssue')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.PARKING_DURATION}
          approved={this.approved.maxParkingDurationHoursLabel}
          unApproved={this.unApproved.parkingDurationPair}
          field={this._getField('parkingDurationPair')}
          type={SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.PARKING_LOCATION_NEARBY}
          approved={this.approved.nearbyParkingAirports}
          unApproved={this.unApproved.nearbyParkingAirports}
          field={this._getField('nearbyParkingAirports')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.TYPES_OF_AIRCRAFT_OPERATED}
          approved={this.approved.typesOfAircraftOperating}
          unApproved={this.unApproved.typesOfAircraftOperating}
          field={this._getField('typesOfAircraftOperating')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
          modifier="typesOfAircraft"
          component={LOGISTICS_COMPONENTS.AIRCRAFT_OPERATE_IN_AIRPORT}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.MTOW}
          approved={this.approved.mtowKgsLabel}
          unApproved={this.unApproved.mtowPair}
          field={this._getField('mtowPair')}
          type={SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.AIRCRAFT_RESTRICTIONS}
          approved={this.approved.aircraftRestrictions}
          unApproved={this.unApproved.aircraftRestrictions}
          field={this._getField('aircraftRestrictions')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRCRAFT_RESTRICTION}
          modifier="threeColumns"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return this.airportTabContent;
  }
}

export default GroundLogisticsAirport;
