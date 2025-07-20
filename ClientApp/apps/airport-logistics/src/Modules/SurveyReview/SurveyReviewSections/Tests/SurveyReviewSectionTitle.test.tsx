import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SurveyReviewSectionTitle } from '../index';

describe('SurveyReviewSectionTitle Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewSectionTitle title='Title Test' />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
