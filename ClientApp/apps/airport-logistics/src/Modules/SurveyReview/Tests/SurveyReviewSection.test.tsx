import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import SurveyReviewSection from '../SurveyReviewSections/SurveyReviewSection/SurveyReviewSection';

describe('SurveyReviewHeaderDetails component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewSection />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
