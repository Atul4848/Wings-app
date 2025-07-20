import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewHeader } from '../SurveyReviewHeader/SurveyReviewHeader';
import { SurveyModel } from '../../Shared/Models';

describe('SurveyReviewHeader component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<SurveyReviewHeader surveyInfo={new SurveyModel()} />);
  });

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
