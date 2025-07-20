import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'mobx-react';
import { expect } from 'chai';

import { GroundLogisticsAndParking, SurveyReviewSection } from '../SurveyReviewSections';
import { AirportLogisticsStore, StepperStore } from '../../Shared/Stores';
import { SurveyTabs } from '../../Shared/Components';

describe('GroundLogisticsAndParking component', () => {
  let wrapper: ReactWrapper;
  const airportLogisticsStore: AirportLogisticsStore = new AirportLogisticsStore();

  beforeEach(() => {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <GroundLogisticsAndParking />
      </Provider>
    );
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render four SurveyReviewHeaderItem components without errors', () => {
    expect(wrapper.find(SurveyReviewSection)).to.have.length(14);
  });

  it('should render four SurveyTabs components without errors', () => {
    expect(wrapper.find(SurveyTabs)).to.have.length(1);
  });
});
