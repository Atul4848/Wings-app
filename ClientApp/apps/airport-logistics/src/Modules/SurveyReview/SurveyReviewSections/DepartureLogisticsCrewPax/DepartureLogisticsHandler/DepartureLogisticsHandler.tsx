import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import {
  DEPARTURE_LOGISTICS_CREW_PAX,
  SURVEY_EDIT_TYPES,
  LOGISTICS_COMPONENTS,
} from './../../../../Shared/Enums/index';
import { SurveyReviewSectionTitle, SurveyReviewSection } from './../../index';
import { AirportLogisticsStore } from './../../../../Shared/Stores/index';
import {
  DepartureHandlerModel,
  DepartureHandlerDataModel,
  SurveyReviewStatusModel,
} from './../../../../Shared/Models/index';
import { fields, labels, placeholders, rules } from './FormFields';
import { IBaseFormSetup } from '../../../../Shared/Interfaces';
import { BaseHandler } from '../../../../Shared/Components';
import { IClasses } from '@wings-shared/core';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  handler: DepartureHandlerModel;
  classes?: IClasses;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class DepartureLogisticsHandler extends BaseHandler<Props, DepartureHandlerDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new DepartureHandlerDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.handler.unApproved);
  }

  private get approved(): DepartureHandlerDataModel {
    return this.props.handler.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(DepartureHandlerDataModel, status);

    airportLogisticsStore.departureLogistics.logistics.handler.unApproved = this.unApproved;
    airportLogisticsStore.setHasAccessedHandler(this.unApproved.hasAllAccessed);
  }

  private get departureProcedures(): React.ReactNode {
    return (
      <Fragment>
        <SurveyReviewSectionTitle title={DEPARTURE_LOGISTICS_CREW_PAX.DEPARTURE_PROCEDURES} />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.DEPARTURE_PROCEDURE}
          approved={this.approved.departureProcedures}
          unApproved={this.unApproved.departureProcedures}
          field={this.form.$('departureProcedures')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.DEPARTURE_EXPECTED_PROCEDURE}
          modifier="oneColumn"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.OTHER_EXPECTED_PROCEDURE}
          approved={this.approved.otherExpectedProcedures}
          unApproved={this.unApproved.otherExpectedProcedures}
          field={this.form.$('otherExpectedProcedures')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSectionTitle title={DEPARTURE_LOGISTICS_CREW_PAX.MEETING_POINT} />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.MEETING_LOCATION}
          approved={this.approved.meetingLocation}
          unApproved={this.unApproved.meetingLocation}
          field={this.form.$('meetingLocation')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.MEETING_LOCATION_FILE_PATH}
          approved={this.approved.meetingLocationFilePath}
          unApproved={this.unApproved.meetingLocationFilePath}
          field={this.form.$('meetingLocationFilePath')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={DEPARTURE_LOGISTICS_CREW_PAX.DEPARTURE_ADDRESS}
          approved={this.approved.departureAddress}
          unApproved={this.unApproved.departureAddress}
          field={this.form.$('departureAddress')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return <Fragment>{this.departureProcedures}</Fragment>
  }
}

export default DepartureLogisticsHandler;
