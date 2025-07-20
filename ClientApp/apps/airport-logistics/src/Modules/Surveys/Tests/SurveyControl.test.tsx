import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyControl } from '../SurveyHeader';

describe('SurveyControl component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyControl numberOfDays={90}/>);
  });

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
