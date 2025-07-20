import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyReviewListItem } from '../SurveyReviewSection';

describe('SurveyReviewListItem Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewListItem item={'Test'} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
