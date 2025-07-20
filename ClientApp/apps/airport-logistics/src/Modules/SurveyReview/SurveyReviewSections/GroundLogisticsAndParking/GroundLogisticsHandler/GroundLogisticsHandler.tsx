import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { GROUND_LOGISTICS_PARKING, SURVEY_EDIT_TYPES, LOGISTICS_COMPONENTS } from './../../../../Shared/Enums/index';
import { SurveyReviewSectionTitle } from './../../SurveyReviewSectionTitle';
import { SurveyReviewSection } from '../../SurveyReviewSection';

import {
  AircraftLogisticsParkingHandlerModel,
  AircraftLogisticsParkingHandlerDataModel,
  SurveyReviewStatusModel,
} from './../../../../Shared/Models/index';

import { fields, labels, placeholders, rules, options } from './FormFields';
import { AirportLogisticsStore, BaseHandler, IBaseFormSetup } from '../../../../Shared';
import { action } from 'mobx';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  handler: AircraftLogisticsParkingHandlerModel;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class GroundLogisticsHandler extends BaseHandler<Props, AircraftLogisticsParkingHandlerDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new AircraftLogisticsParkingHandlerDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.handler.unApproved);
  }

  private get approved(): AircraftLogisticsParkingHandlerDataModel {
    return this.props.handler.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(AircraftLogisticsParkingHandlerDataModel, status);

    airportLogisticsStore.surveyDetail.aircraftLogisticsParking.handler.unApproved = this.unApproved;
    airportLogisticsStore.setHasAccessedHandler(this.unApproved.hasAllAccessed);
  }

  private get handlerContent(): React.ReactNode {
    return (
      <Fragment>
        <SurveyReviewSectionTitle
          title={GROUND_LOGISTICS_PARKING.AIRCRAFT_PARKING_LOCATION}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.AIRCRAFT_PARKING_OPTIONS}
          approved={this.approved.aircraftParkingLocation}
          unApproved={this.unApproved.aircraftParkingLocation}
          field={this._getField('aircraftParkingLocation')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRCRAFT_PARKING_OPTION}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.AIRCRAFT_LOGISTICS_DOCUMENTATION}
          approved={this.approved.aircraftLogisFile}
          unApproved={this.unApproved.aircraftLogisFile}
          field={this._getField('aircraftLogisFile')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={GROUND_LOGISTICS_PARKING.AIRCRAFT_SPOT_ACCOMMODATION}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.AIRCRAFT_TYPES}
          approved={this.approved.aircraftSpotAccommodation}
          unApproved={this.unApproved.aircraftSpotAccommodation}
          field={this._getField('aircraftSpotAccommodation')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRCRAFT_SPOT_ACCOMMODATION}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.TOW_BAR_REQUIRED}
          approved={this.approved.towbarRequired}
          unApproved={this.unApproved.towbarRequired}
          field={this._getField('towbarRequired')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.TOWBAR_REQUIREMENT_SCENARIOS}
          approved={this.approved.towbarRequirementScenarios}
          unApproved={this.unApproved.towbarRequirementScenarios}
          field={this._getField('towbarRequirementScenarios')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.TOW_BAR_REQUIREMENT_SCENARIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.AIRCRAFT_TOW_BAR_REQUIREMENT}
          approved={this.approved.aircraftTowbarRequirements}
          unApproved={this.unApproved.aircraftTowbarRequirements}
          field={this._getField('aircraftTowbarRequirements')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRCRAFT_TOW_BAR_REQUIREMENT}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={GROUND_LOGISTICS_PARKING.AVAILABLE_GROUND_SERVICE_EQUIPMENT}
        />
        <SurveyReviewSection
          label={GROUND_LOGISTICS_PARKING.EQUIPMENT_TYPES}
          approved={this.approved.airportEquipments}
          unApproved={this.unApproved.airportEquipments}
          field={this._getField('airportEquipments')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRPORT_EQUIPMENT}
          modifier="threeColumns"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return this.handlerContent;
  }
}

export default GroundLogisticsHandler;
