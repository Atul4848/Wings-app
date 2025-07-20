import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AirportLogisticsStoreMock, SurveyMock } from '../../Shared/Mocks';
import { SurveyControl, SurveyHeader, SurveyHeading } from '../SurveyHeader';

describe('SurveyHeading component', () => {
  let wrapper: ShallowWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(() => {
    airportLogisticsStore.surveyList = SurveyMock;
    wrapper = shallow(<SurveyHeader airportLogisticsStore={airportLogisticsStore} />)
      .dive()
      .dive();
  });

  it('should be rendered without errors, render SurveyHeading and render SurveyControl', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(SurveyHeading)).to.have.length(1);
    expect(wrapper.find(SurveyControl)).to.have.length(1);
  });
});
