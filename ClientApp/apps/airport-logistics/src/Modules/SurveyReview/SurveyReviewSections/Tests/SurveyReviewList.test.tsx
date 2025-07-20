import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyReviewList } from '../SurveyReviewSection';

describe('SurveyReviewList Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewList list={['Test']} classes={'test'} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
