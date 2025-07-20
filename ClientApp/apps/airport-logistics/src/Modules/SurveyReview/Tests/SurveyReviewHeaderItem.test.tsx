import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewHeaderItem } from '../SurveyReviewHeader';
import { SurveyMock } from '../../Shared/Mocks';

describe('SurveyReviewHeaderItem component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <SurveyReviewHeaderItem label={SurveyMock.surveys[0].statusLabel} />).dive();
  })

it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
