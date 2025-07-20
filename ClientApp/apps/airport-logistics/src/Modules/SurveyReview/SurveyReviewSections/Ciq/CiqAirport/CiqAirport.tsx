import React, { Fragment, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import {
  CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO,
  CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY,
  LOGISTICS_COMPONENTS,
  SURVEY_EDIT_TYPES,
  SURVEY_SECTION_TYPES,
} from './../../../../Shared/Enums/index';
import { SurveyReviewSection, SurveyReviewSectionTitle } from './../../index';
import { CiqAirportModel, CiqCrewPaxDataModel, SurveyReviewStatusModel } from './../../../../Shared/Models/index';
import { AirportLogisticsStore } from './../../../../Shared/Stores/index';
import { fields, labels, placeholders, rules, options } from './FormFields';
import { BaseHandler } from '../../../../Shared/Components';
import { IBaseFormSetup } from '../../../../Shared/Interfaces';

type Props = {
  airportLogisticsStore?: AirportLogisticsStore;
  airport: CiqAirportModel;
};

const setup: IBaseFormSetup = {
  form: { fields, labels, placeholders, rules, options },
  formOptions: { isNested: true },
};

@inject('airportLogisticsStore')
@observer
class CiqAirport extends BaseHandler<Props, CiqCrewPaxDataModel> {
  constructor(props) {
    super(props, setup);
    this.unApproved = new CiqCrewPaxDataModel();
  }

  private get airport(): CiqAirportModel {
    return this.props.airport;
  }

  private get approved(): CiqCrewPaxDataModel {
    return this.airport.approved;
  }

  @action
  private updateHandler(status: SurveyReviewStatusModel): void {
    const { airportLogisticsStore } = this.props;
    this._updateUnApproved(CiqCrewPaxDataModel, status);

    airportLogisticsStore.ciq.ciqCrewPax.airport.unApproved = this.unApproved;
    airportLogisticsStore.setHasAccessedAirport(this.unApproved.hasAllAccessed);
  }

  private get gendecInfo(): ReactNode {
    return (
      <Fragment>
        <SurveyReviewSectionTitle title={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.GENDEC_INFO} />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.IS_GENDEC_REQUIRED}
          approved={this.approved.genDecRequiredLabel}
          unApproved={this.unApproved.genDecRequired}
          field={this._getField('genDecRequired')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.SPECIFIC_GENGEC_TYPE}
          approved={this.approved.specificGenDecTypeLabel}
          unApproved={this.unApproved.specificGenDecTypeRequired}
          field={this._getField('specificGenDecTypeRequired')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.GENDEC_ADDITIONAL_PROCEDURES}
          approved={this.approved.genDecAdditionalProcedures}
          unApproved={this.unApproved.genDecAdditionalProcedures}
          field={this._getField('genDecAdditionalProcedures')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.GENDEC_ADDITIONAL_PROCEDURE}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.GENDIC_FILE}
          approved={this.approved.genDecFilePath}
          unApproved={this.unApproved.genDecFilePath}
          field={this._getField('genDecFilePath')}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.IS_GENDEC_ASSITANCE}
          approved={this.approved.genDecAssistanceLabel}
          unApproved={this.unApproved.genDecAssistanceRequired}
          field={this._getField('genDecAssistanceRequired')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.ON_BOARD_CREW_PAX_CUST_CLEARANCE}
          approved={this.approved.crewPaxOnBoardCustomsClearanceLabel}
          unApproved={this.unApproved.crewPaxOnBoardCustomsClearance}
          field={this._getField('crewPaxOnBoardCustomsClearance')}
          type={SURVEY_EDIT_TYPES.RADIO}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_GENDEC_INFO.ADVANCE_NOTICE_ON_BOARD_CREW_PAX_CUST_CLEARANCE}
          approved={this.approved.advanceNoticeLabel}
          unApproved={this.unApproved.advanceNoticePair}
          field={this._getField('advanceNoticePair')}
          type={SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  private get airportFacility(): ReactNode {
    return (
      <Fragment>
        <SurveyReviewSectionTitle
          title={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.AVAILABLE_FACILITY_AND_OPERATING_TIME_INFO}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.AVAILABLE_FACILITIES}
          approved={this.approved.airportFacilities}
          unApproved={this.unApproved.airportFacilities}
          field={this.form.$('airportFacilities')}
          type={SURVEY_EDIT_TYPES.SELECTION}
          component={LOGISTICS_COMPONENTS.AIRPORT_FACILITY}
          modifier="typesOfAircraft"
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.MAIN_TERMINAL_OPERATING_HOURS}
          approved={this.approved.mainTerminal}
          unApproved={this.unApproved.mainTerminal}
          field={this._getField('mainTerminal')}
          sectionType={SURVEY_SECTION_TYPES.MAIN_TERMINAL}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.OPERATING_HOURS_OF_CIQ_AT_THE_MAIN_TERMINAL}
          approved={this.approved.ciqMainTerminal}
          unApproved={this.unApproved.ciqMainTerminal}
          field={this._getField('ciqMainTerminal')}
          sectionType={SURVEY_SECTION_TYPES.CIQ_MAIN_TERMINAL}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.OPERATING_HOURS_OF_THE_VIP_AREA_TERMINAL}
          approved={this.approved.vipAreaTerminal}
          unApproved={this.unApproved.vipAreaTerminal}
          field={this._getField('vipAreaTerminal')}
          sectionType={SURVEY_SECTION_TYPES.VIP_AREA_TERMINAL}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
        <SurveyReviewSection
          label={CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.OPERATING_HOURS_OF_THE_GAT}
          approved={this.approved.generalAviationTerminal}
          unApproved={this.unApproved.generalAviationTerminal}
          field={this._getField('generalAviationTerminal')}
          sectionType={SURVEY_SECTION_TYPES.GENERAL_AVIATION_TERMINAL}
          updateHandler={(status: SurveyReviewStatusModel) => this.updateHandler(status)}
        />
      </Fragment>
    );
  }

  componentDidMount(): void {
    this._setDefaultValues(this.airport.unApproved, {
      initWithSubFields: true,
      initModel: {
        ...this.airport.unApproved,
        airportFacilities: [],
        genDecAdditionalProcedures: [],
      },
    });
    // setting the following fields value explicitly to avoid mobx form bug with nested fields.
    this._getField('airportFacilities').set('value', this.airport.unApproved.airportFacilities);
    this._getField('genDecAdditionalProcedures').set('value', this.airport.unApproved.genDecAdditionalProcedures);
  }

  render() {
    return (
      <Fragment>
        {this.gendecInfo}
        {this.airportFacility}
      </Fragment>
    );
  }
}

export default CiqAirport;
