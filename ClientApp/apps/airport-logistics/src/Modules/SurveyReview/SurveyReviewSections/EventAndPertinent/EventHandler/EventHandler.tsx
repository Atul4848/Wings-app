import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { EVENT_PERTINENT } from './../../../../Shared/Enums/index';
import { SurveyReviewSectionTitle, SurveyReviewSection } from './../../index';
import {
  AirportLogisticsStore,
  SurveyReviewStatusModel,
  EventsHandlerInfoModel, IBaseFormSetup, BaseHandler,
} from './../../../../Shared';
import { fields, placeholders, rules } from './FormFields';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  approved: EventsHandlerInfoModel;
  unApproved: EventsHandlerInfoModel;
};

const setup: IBaseFormSetup = {
  form: { fields, placeholders, rules },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class EventHandler extends BaseHandler<Props, EventsHandlerInfoModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new EventsHandlerInfoModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.unApproved);
  }

  private get approved(): EventsHandlerInfoModel {
    return this.props.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(EventsHandlerInfoModel, status);

    airportLogisticsStore.airportEvents.unApprovedHandlerInfo = this.unApproved;
    airportLogisticsStore.setHasAccessedHandler(this.unApproved.hasAllAccessed);
  }

  private get handlerTabContent(): React.ReactNode {
    if (!this.approved) {
      return null;
    }
    return (
      <Fragment>
        <SurveyReviewSectionTitle title={EVENT_PERTINENT.PERTINENET_INFORMATION} />
        <SurveyReviewSection
          label={EVENT_PERTINENT.PERTINENET_INFO}
          approved={this.approved.pertinentInfo}
          unApproved={this.unApproved.pertinentInfo}
          field={this.form.$('pertinentInfo')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  render() {
    return this.handlerTabContent;
  }
}

export default EventHandler;
