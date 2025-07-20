import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewBody, SurveyReviewStepHeader } from '../SurveyReviewBody';
import { StepperStore } from '../../Shared/Stores';
import { GroundLogisticsAndParking } from '../SurveyReviewSections';
import { StepperKeeper } from '../../Shared/Components';
import { AirportLogisticsStoreMock } from '../../Shared/Mocks';
import {
  AirportEventsModel,
  ArrivalLogisticsModel,
  CiqModel,
  DepartureLogisticsModel,
  SurveyDetailModel,
} from '../../Shared/Models';

describe('SurveyReviewBody component', function() {
  let wrapper: ShallowWrapper;
  const stepperStore = StepperStore;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(function () {
    wrapper = shallow(<SurveyReviewBody stepperStore={stepperStore} airportLogisticsStore={airportLogisticsStore} />);
    wrapper = shallow(wrapper.dive().getElement());
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('step 1 GroundLogisticsAndParking', function() {
    expect(wrapper.find(GroundLogisticsAndParking)).to.have.length(1);
  });

  it('StepperKeeper', function() {
    expect(wrapper.find(StepperKeeper)).to.have.length(1);
  });

  it('No steps provided return GroundLogisticsAndParking', function() {
    stepperStore.activeStep = 0;
    wrapper.update();
    expect(wrapper.find(GroundLogisticsAndParking)).to.have.length(1);
  });

  it('Step 1 Approve Handler sets SurveyDetailModel', function() {
    stepperStore.activeStep = 1;
    wrapper.update();
    wrapper.find(SurveyReviewStepHeader).props().approveHandler();
    expect(airportLogisticsStore.surveyDetail).to.eql(new SurveyDetailModel());
  });

  it('Default Step Approve Handler sets SurveyDetailModel', function() {
    stepperStore.activeStep = 0;
    wrapper.update();
    wrapper.find(SurveyReviewStepHeader).props().approveHandler();
    expect(airportLogisticsStore.surveyDetail).to.eql(new SurveyDetailModel());
  });
});
