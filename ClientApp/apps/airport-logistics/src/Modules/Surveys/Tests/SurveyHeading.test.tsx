import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyHeading } from '../SurveyHeader';

describe('SurveyHeading component', () => {
  let wrapper: ShallowWrapper;
  const numberOfDays = 2;

  beforeEach(() => {
    wrapper = shallow(
      <SurveyHeading numberOfDays={numberOfDays} />
    ).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should display correct text', () => {
    expect(wrapper.find('div').text()).to.eq(`(Past ${numberOfDays} Days)`);
  });
});
