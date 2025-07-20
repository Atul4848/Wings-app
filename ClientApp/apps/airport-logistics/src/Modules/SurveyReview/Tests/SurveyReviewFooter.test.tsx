import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import SurveyReviewFooter from '../SurveyReviewFooter/SurveyReviewFooter';
import { StepperStore } from '../../Shared/Stores';
import { AirportLogisticsStoreMock } from '../../Shared/Mocks';
import { Button } from '@material-ui/core';

describe('SurveyReviewFooter component', () => {
  let wrapper: ShallowWrapper;
  const stepperStore = StepperStore;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(() => {
    wrapper = shallow(
      <SurveyReviewFooter stepperStore={stepperStore} airportLogisticsStore={airportLogisticsStore}/>
    );
    wrapper = wrapper.dive().shallow();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render 2 buttons', () => {
    expect(wrapper.find(Button)).to.have.length(2);
  });

  it('on step 1 Back button is disabled', () => {
    stepperStore.activeStep = 1;
    wrapper.update();
    const { disabled } = wrapper.find(Button).at(0).props();
    expect(disabled).to.equal(true);
  });

  it('on max step 5 Next button is not disabled', function() {
    const { disabled } = wrapper.find(Button).at(1).props();
    expect(disabled).to.equal(false);
  });

  it('next button add step and sets hasAccessedAirport and hasAccessedHandler to false', function() {
    stepperStore.activeStep = 0;
    airportLogisticsStore.hasAccessedAirport = true;
    airportLogisticsStore.hasAccessedHandler = true;
    wrapper.update();
    wrapper.find(Button).at(1).simulate('click');
    expect(airportLogisticsStore.hasAccessedAirport).to.equal(false);
    expect(airportLogisticsStore.hasAccessedHandler).to.equal(false);
  });

  it('back button lower step and sets hasAccessedAirport and hasAccessedHandler to false', function() {
    stepperStore.activeStep = 0;
    airportLogisticsStore.hasAccessedAirport = true;
    airportLogisticsStore.hasAccessedHandler = true;
    wrapper.update();
    wrapper.find(Button).at(0).simulate('click');
    expect(airportLogisticsStore.hasAccessedAirport).to.equal(false);
    expect(airportLogisticsStore.hasAccessedHandler).to.equal(false);
  });
});
