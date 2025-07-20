import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyReviewLabel } from '../SurveyReviewSection';

describe('SurveyReviewLabel Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewLabel />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
