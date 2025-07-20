import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportLogisticsStoreMock, SurveyMock } from '../../Shared/Mocks';
import { SurveyFooter, SurveyHeader, Surveys, SurveyTable } from '../index';
import { UIStore } from '@wings-shared/core';

describe('Surveys component', () => {
  let wrapper: ShallowWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(() => {
    UIStore.setPageLoader(false);
    airportLogisticsStore.surveyList = SurveyMock;
    wrapper = shallow(<Surveys airportLogisticsStore={airportLogisticsStore} />)
      .dive()
      .dive();
  });

  it('should be rendered SurveyHeader, SurveyTable and SurveyFooter without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(SurveyHeader)).to.have.length(1);
    expect(wrapper.find(SurveyTable)).to.have.length(1);
    expect(wrapper.find(SurveyFooter)).to.have.length(1);
  });

  it('should not render SurveyTable component if data is not available', () => {
    airportLogisticsStore.surveyList.surveys = [];
    expect(wrapper.find(SurveyTable)).to.have.length(0);
  });
});
