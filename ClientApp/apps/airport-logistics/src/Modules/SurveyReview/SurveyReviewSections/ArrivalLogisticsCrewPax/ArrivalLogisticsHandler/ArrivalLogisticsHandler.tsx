import React, { Fragment, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import {
  ARRIVAL_LOGISTICS_CREW_PAX,
  LOGISTICS_COMPONENTS,
  SURVEY_EDIT_TYPES,
} from '../../../../Shared/Enums/index';
import { SurveyReviewSectionTitle, SurveyReviewSection } from '../../index';
import { 
  ArrivalLogisticsModel,
  ArrivalLogisticsDataModel,
  SurveyReviewStatusModel,
} from '../../../../Shared/Models/index';
import { fields, labels, placeholders, rules, options } from './FormFields';
import { AirportLogisticsStore } from '../../../../Shared/Stores/index';
import { BaseHandler } from '../../../../Shared/Components';
import { IBaseFormSetup } from '../../../../Shared/Interfaces';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  handler: ArrivalLogisticsModel;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class ArrivalLogisticsHandler extends BaseHandler<Props, ArrivalLogisticsDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new ArrivalLogisticsDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.handler.unApproved);
  }

  private get approved(): ArrivalLogisticsDataModel {
    return this.props.handler?.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(ArrivalLogisticsDataModel, status);

    airportLogisticsStore.setHasAccessedAirport(true);
    airportLogisticsStore.setHasAccessedHandler(this.unApproved.hasAllAccessed);
    airportLogisticsStore.arrivalLogistics.unApproved = this.unApproved;
  }

  private get arrivalProcedures(): ReactNode {
    return (
      <Fragment>
        <SurveyReviewSectionTitle
          title={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_PROCEDURES}
          subTitle={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_EXPECTED_PROCEDURE}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_PROCEDURE}
          approved={this.approved.arrivalExpectedProcedures}
          unApproved={this.unApproved.arrivalExpectedProcedures}
          field={this._getField('arrivalExpectedProcedures')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
          component={LOGISTICS_COMPONENTS.ARRIVAL_EXPECTED_PROCEDURE}
          modifier="oneColumn"
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.IS_RAMP_SIDE_SHUTTLE_AVAILABLE}
          approved={this.approved.rampSideShuttleLabel}
          unApproved={this.unApproved.rampSideShuttleAvailable}
          field={this._getField('rampSideShuttleAvailable')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.WALKING_DISTANCE}
          approved={this.approved.walkDistancePair}
          unApproved={this.unApproved.walkDistance}
          field={this._getField('walkDistance')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={ARRIVAL_LOGISTICS_CREW_PAX.DISABILITY_ACCOMMODATION_AVAILABLE}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.MOBILITY_TYPE}
          approved={this.approved.disabilitiesAccomomodationAvailability}
          unApproved={this.unApproved.disabilitiesAccomomodationAvailability}
          field={this._getField('disabilitiesAccomomodationAvailability')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.DISABILIITIES_ACCOMMODATION_AVAILABILITY}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_CREW_PAX_PASSPORT_HANDLING}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.HANDLING_TYPE}
          approved={this.approved.arrivalCrewPassengerPassportHandling}
          unApproved={this.unApproved.arrivalCrewPassengerPassportHandling}
          field={this._getField('arrivalCrewPassengerPassportHandling')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.ARRIVAL_CREW_PASSENGER_PASSPORT_HANDLING}
          modifier="oneColumn"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_LUGGAGE_HANDLING}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.LUGGAGE_HANDLING_TYPE}
          approved={this.approved.arrivalLuggageHandling}
          unApproved={this.unApproved.arrivalLuggageHandling}
          field={this._getField('arrivalLuggageHandling')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.ARRIVAL_LUGGAGE_HANDLING}
          modifier="oneColumn"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle
          title={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_MEETING_POINT}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.MEETING_POINT_TYPE}
          approved={this.approved.arrivalMeetingPoint}
          unApproved={this.unApproved.arrivalMeetingPoint}
          field={this._getField('arrivalMeetingPoint')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.ARRIVAL_MEETING_POINT}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.ARRIVAL_ADDRESS}
          approved={this.approved.arrivalAddress}
          unApproved={this.unApproved.arrivalAddress}
          field={this._getField('arrivalAddress')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={ARRIVAL_LOGISTICS_CREW_PAX.ADDITIONAL_INSTRUCTIONS}
          approved={this.approved.additionalInstructionsForGate}
          unApproved={this.unApproved.additionalInstructionsForGate}
          field={this._getField('additionalInstructionsForGate')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        {this.arrivalProcedures}
      </Fragment>
    );
  }
}

export default ArrivalLogisticsHandler;
