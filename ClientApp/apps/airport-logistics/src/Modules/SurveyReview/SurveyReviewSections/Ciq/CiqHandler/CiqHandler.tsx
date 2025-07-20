import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import { CIQ_HANDLER } from './../../../../Shared/Enums/index';
import { SurveyReviewSection } from './../../index';
import { CiqHandlerModel, CiqHandlerDataModel, SurveyReviewStatusModel } from './../../../../Shared/Models/index';
import { fields, placeholders, rules } from './FormFields';
import { AirportLogisticsStore, BaseHandler, IBaseFormSetup, SURVEY_SECTION_TYPES } from '../../../../Shared';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  handler: CiqHandlerModel;
};

const setup: IBaseFormSetup = {
  form: { fields, placeholders, rules },
  formOptions: { isNested: true },
}

@inject('airportLogisticsStore')
@observer
class CiqHandler extends BaseHandler<Props, CiqHandlerDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new CiqHandlerDataModel();
  }

  componentDidMount(): void {
    this._setDefaultValues(this.props.handler.unApproved, { initWithSubFields: true });
  }

  private get approved(): CiqHandlerDataModel {
    return this.props.handler.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(CiqHandlerDataModel, status);

    airportLogisticsStore.ciq.ciqCrewPax.handler.unApproved = this.unApproved;
    airportLogisticsStore.setHasAccessedHandler(this.unApproved.hasAllAccessed);
  }

  render() {
    return(
      <Fragment>
        <SurveyReviewSection
          label={CIQ_HANDLER.PRIVATE_HANDLER_FIXED_BASED_OPERATOR_FBO_HOURS}
          unApproved={this.unApproved.privateFBOOperatingHours}
          approved={this.approved.privateFBOOperatingHours}
          field={this.form.$('privateFBOOperatingHours')}
          sectionType={SURVEY_SECTION_TYPES.PRIVATE_FBO_OPERATING_HOURS}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_HANDLER.HOURS_OF_CIQ_AT_THE_GENERAL_AVIATION_TERMINAL_FBO}
          unApproved={this.unApproved.ciqHoursForGATOrFBO}
          approved={this.approved.ciqHoursForGATOrFBO}
          field={this.form.$('ciqHoursForGATOrFBO')}
          sectionType={SURVEY_SECTION_TYPES.CIQ_HOURS_FOR_GAT_OR_FBO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }
}

export default CiqHandler;
