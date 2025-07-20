import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import { SurveyFooter } from '../SurveyFooter';

describe('SurveyFooter Component', () => {
  let wrapper: ShallowWrapper;

  const mockData = {
    approved: 4,
    inProcess: 5,
    pending: 7,
    total: 16,
  };

  beforeEach(() => {
    wrapper = shallow(<SurveyFooter counts={mockData} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
