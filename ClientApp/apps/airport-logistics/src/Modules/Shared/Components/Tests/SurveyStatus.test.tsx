import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyStatus } from '../index';

describe('SurveyStatus component', function() {
  let wrapper: ShallowWrapper;

  beforeEach(function() {
    wrapper = shallow(<SurveyStatus label={'Test'} count={4} />);
  });

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
