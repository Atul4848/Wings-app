import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyReviewNoDataLabel } from '../SurveyReviewSection';

describe('SurveyReviewNoDataLabel Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewNoDataLabel />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
