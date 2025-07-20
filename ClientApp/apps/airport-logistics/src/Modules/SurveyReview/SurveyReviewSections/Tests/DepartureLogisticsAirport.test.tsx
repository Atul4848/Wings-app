import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'mobx-react';
import { expect } from 'chai';
import { DepartureAirportModel } from './../../../Shared/Models/index';

import { DepartureLogisticsAirport, SurveyReviewSection } from './../../SurveyReviewSections';
import { AirportLogisticsStore, StepperStore } from './../../../Shared/Stores';

describe('DepartureLogisticsAirport component', function() {
  let wrapper: ReactWrapper;
  const airportLogisticsStore: AirportLogisticsStore = new AirportLogisticsStore();

  beforeEach(function() {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <DepartureLogisticsAirport airport={new DepartureAirportModel()} />
      </Provider>
    );
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render two SurveyReviewSection components without errors', function() {
    expect(wrapper.find(SurveyReviewSection)).to.have.length(2);
  });
});
