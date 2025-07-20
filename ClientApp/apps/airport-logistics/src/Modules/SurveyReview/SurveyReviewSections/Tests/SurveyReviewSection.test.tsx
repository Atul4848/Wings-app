import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import {
  SurveyReviewLabel,
  SurveyReviewList, SurveyReviewListItem,
  SurveyReviewNoDataLabel,
  SurveyReviewSection
} from '../SurveyReviewSection';
import { AirportLogisticsStoreMock } from '../../../Shared/Mocks';
import { SURVEY_EDIT_TYPES, SURVEY_SECTION_TYPES } from '../../../Shared/Enums';
import { EventReview } from '../EventAndPertinent';
import { CiqMainTerminal, CiqVipAreaTerminal, GeneralAviationTerminal, MainTerminal } from '../Ciq/CiqAirport';
import { FboOperatingHours } from '../Ciq/CiqHandler';
import { SurveyReviewActions } from '../../index';
import {
  SurveyListEditor,
  SurveyRadioEditor,
  SurveySelectionEditor, SurveyValueEditor,
  SurveyValueUnitPairEditor
} from '../../SurveyEditor';
import sinon = require('sinon');
import { SinonSpy } from 'sinon';
import { LogisticsComponentModel, SurveyReviewStatusModel, ValueUnitPairModel } from '../../../Shared/Models';
import { Button } from '@material-ui/core';

describe('SurveyReviewSection Component', () => {
  let wrapper: ShallowWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();
  let update: SinonSpy;

  beforeEach(() => {
    update = sinon.spy();

    wrapper = shallow(
      <SurveyReviewSection airportLogisticsStore={airportLogisticsStore} updateHandler={update}/>
    );
    wrapper = wrapper.dive().shallow();
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('unApprovedData should render EventReview for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.EVENTS
    });
    expect(wrapper.find(EventReview)).to.have.length(1);
  });

  it('unApprovedData should render MainTerminal for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.MAIN_TERMINAL
    });
    expect(wrapper.find(MainTerminal)).to.have.length(1);
  });

  it('unApprovedData should render CiqMainTerminal for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.CIQ_MAIN_TERMINAL
    });
    expect(wrapper.find(CiqMainTerminal)).to.have.length(1);
  });

  it('unApprovedData should render CiqVipAreaTerminal for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.VIP_AREA_TERMINAL
    });
    expect(wrapper.find(CiqVipAreaTerminal)).to.have.length(1);
  });

  it('unApprovedData should render GeneralAviationTerminal for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.GENERAL_AVIATION_TERMINAL
    });
    expect(wrapper.find(GeneralAviationTerminal)).to.have.length(1);
  });

  it('unApprovedData should render FboOperatingHours for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.PRIVATE_FBO_OPERATING_HOURS
    });
    expect(wrapper.find(FboOperatingHours)).to.have.length(1);
  });

  it('unApprovedData should render FboOperatingHours for Events ', () => {
    wrapper.setProps({
      unApproved: [],
      approved: [],
      sectionType:  SURVEY_SECTION_TYPES.CIQ_HOURS_FOR_GAT_OR_FBO
    });
    expect(wrapper.find(FboOperatingHours)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewNoDataLabel if no data ', () => {
    wrapper.setProps({ unApproved: [], approved: [1 , 2] });
    expect(wrapper.find(SurveyReviewNoDataLabel)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewLabel if unApproved provided', () => {
    wrapper.setProps({ unApproved: [1], approved: [] });
    expect(wrapper.find(SurveyReviewLabel)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewList for LIST type', () => {
    wrapper.setProps({ unApproved: ['test'], approved: [], type: SURVEY_EDIT_TYPES.LIST });
    expect(wrapper.find(SurveyReviewList)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewList for SELECTION type', () => {
    wrapper.setProps({ unApproved: [new LogisticsComponentModel()], approved: [], type: SURVEY_EDIT_TYPES.SELECTION });
    expect(wrapper.find(SurveyReviewList)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewListItem for VALUE_UNIT_PAIR type', () => {
    wrapper.setProps({ unApproved: [new ValueUnitPairModel()], approved: [], type: SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR });
    expect(wrapper.find(SurveyReviewListItem)).to.have.length(1);

    wrapper.setProps({ unApproved: ['test'], approved: [], type: SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR });
    wrapper.update();
    expect(wrapper.find(SurveyReviewListItem)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewListItem for any other type', () => {
    wrapper.setProps({ unApproved: ['test'], approved: [], type: SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR });
    expect(wrapper.find(SurveyReviewListItem)).to.have.length(1);
  });

  it('unApprovedData should render SurveyReviewActions on mouse over and hide on mouseLeave', () => {
    wrapper.setProps({ classes: { container: 'one' }});
    wrapper.find('div.one').simulate('mouseOver');
    expect(wrapper.find(SurveyReviewActions)).to.have.length(1);
    wrapper.find('div.one').simulate('mouseLeave');
    expect(wrapper.find(SurveyReviewActions)).to.have.length(0);
  });

  it('editHandler switch EditMode and render SurveyListEditor for LIST type', () => {
    wrapper.setProps({ classes: { container: 'one' }, type: SURVEY_EDIT_TYPES.LIST });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().editHandler();
    expect(wrapper.find(SurveyListEditor)).to.have.length(1);
  });

  it('editHandler switch EditMode and render SurveyRadioEditor for RADIO type', () => {
    wrapper.setProps({ classes: { container: 'one' }, type: SURVEY_EDIT_TYPES.RADIO });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().editHandler();
    expect(wrapper.find(SurveyRadioEditor)).to.have.length(1);
  });

  it('editHandler switch EditMode and render SurveyRadioEditor for SELECTION type', () => {
    wrapper.setProps({ classes: { container: 'one' }, type: SURVEY_EDIT_TYPES.SELECTION });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().editHandler();
    expect(wrapper.find(SurveySelectionEditor)).to.have.length(1);
  });

  it('editHandler switch EditMode and render SurveyRadioEditor for VALUE_UNIT_PAIR type', () => {
    wrapper.setProps({ classes: { container: 'one' }, type: SURVEY_EDIT_TYPES.VALUE_UNIT_PAIR });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().editHandler();
    expect(wrapper.find(SurveyValueUnitPairEditor)).to.have.length(1);
  });

  it('editHandler switch EditMode and render SurveyRadioEditor for any other type and no type', () => {
    wrapper.setProps({ classes: { container: 'one' } });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().editHandler();
    expect(wrapper.find(SurveyValueEditor)).to.have.length(1);
  });

  it('approveHandler sets isApproved to true and updateHandler', () => {
    wrapper.setProps({ classes: { container: 'one' } });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().approveHandler();

    const response = new SurveyReviewStatusModel({
      key: undefined,
      isApproved: true,
      isIgnored: false
    });
    expect(update.calledWith(response)).to.equal(true);
  });

  it('ignoreHandler sets isIgnored to true and updateHandler', () => {
    wrapper.setProps({ classes: { container: 'one' } });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().ignoreHandler();

    const response = new SurveyReviewStatusModel({
      key: undefined,
      isApproved: false,
      isIgnored: true
    });
    expect(update.calledWith(response)).to.equal(true);
  });

  it('cancelHandler switch EditMode back and hide Editor', () => {
    wrapper.setProps({ classes: { container: 'one' } });
    wrapper.find('div.one').simulate('mouseOver');
    const actionsComponent = wrapper.find(SurveyReviewActions).props();
    actionsComponent.editHandler();
    expect(wrapper.find(SurveyValueEditor)).to.have.length(1);

    actionsComponent.cancelHandler();
    expect(wrapper.find(SurveyValueEditor)).to.have.length(0);
  });

  it('resetButton resets isApproved and isIgnored to false and updateHandler', () => {
    wrapper.setProps({ classes: { container: 'one' } });
    wrapper.find('div.one').simulate('mouseOver');
    wrapper.find(SurveyReviewActions).props().approveHandler();

    wrapper.find(Button).simulate('click');
    const response = new SurveyReviewStatusModel({
      key: undefined,
      isApproved: false,
      isIgnored: false
    });

    expect(update.lastCall.calledWith(response)).to.equal(true);
  });
})
