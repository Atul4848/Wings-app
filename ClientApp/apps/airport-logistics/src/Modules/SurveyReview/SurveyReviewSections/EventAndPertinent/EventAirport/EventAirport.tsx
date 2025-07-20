import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { withStyles } from '@material-ui/core';
import { SurveyReviewSectionTitle, SurveyReviewSection } from './../../index';
import {
  AirportEventsModel,
  EventModel,
  SurveyReviewStatusModel,
  EVENT_PERTINENT,
  SURVEY_SECTION_TYPES, IBaseFormSetup, BaseHandler,
} from './../../../../Shared';
import { AirportLogisticsStore } from './../../../../Shared/Stores/index';
import { fields, placeholders, rules, options } from './FormFields';
import { IClasses } from '@wings-shared/core';

import { styles } from './EventAirport.styles';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  airport: AirportEventsModel;
  classes?: IClasses;
};

const setup: IBaseFormSetup = {
  form: { fields, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class EventAirport extends BaseHandler<Props, AirportEventsModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new AirportEventsModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.airport, { initWithSubFields: true });
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore, airport } = this.props;
    this._updateUnApproved(AirportEventsModel, status);

    airportLogisticsStore.airportEvents = this.unApproved;
    airportLogisticsStore.setHasAccessedAirport(airport.hasAllAccessed);
  }

  private get approvedEvents(): EventModel[] {
    return this.props.airport.approvedEvents;
  }

  render() {
    return (
      <Fragment>
        <SurveyReviewSectionTitle title={EVENT_PERTINENT.EVENTS} />
        <SurveyReviewSection
          approved={this.approvedEvents}
          unApproved={this.unApproved.stageEvents}
          field={this.form.select('stageEvents')}
          sectionType={SURVEY_SECTION_TYPES.EVENTS}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }
}
export default withStyles(styles)(EventAirport);
