import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewHeaderDetails, SurveyReviewHeaderItem } from '../SurveyReviewHeader';
import { SurveyMock } from '../../Shared/Mocks';

describe('SurveyReviewHeaderDetails component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <SurveyReviewHeaderDetails info={SurveyMock[0]} />).dive();
  })

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render four SurveyReviewHeaderItem components without errors', () => {
    expect(wrapper.find(SurveyReviewHeaderItem)).to.have.length(4);
  });
});
