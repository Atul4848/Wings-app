import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'mobx-react';
import { expect } from 'chai';
import { DepartureHandlerModel } from './../../../Shared/Models/index';

import { DepartureLogisticsHandler, SurveyReviewSection } from './../../SurveyReviewSections';
import { AirportLogisticsStore, StepperStore } from './../../../Shared/Stores';

describe('DepartureLogisticsHandler component', function() {
  let wrapper: ReactWrapper;
  const airportLogisticsStore: AirportLogisticsStore = new AirportLogisticsStore();

  beforeEach(function() {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <DepartureLogisticsHandler handler={new DepartureHandlerModel()}/>
      </Provider>
    );
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render five SurveyReviewSection components without errors', function() {
    expect(wrapper.find(SurveyReviewSection)).to.have.length(5);
  });
});
