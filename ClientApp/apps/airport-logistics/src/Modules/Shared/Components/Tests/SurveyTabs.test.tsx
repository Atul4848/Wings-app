import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyTabs } from '../index';

describe('SurveyTabs component', function() {
  let wrapper: ShallowWrapper;

  beforeEach(function() {
    wrapper = shallow(<SurveyTabs airport={<div>Test</div>} />);
  });

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
