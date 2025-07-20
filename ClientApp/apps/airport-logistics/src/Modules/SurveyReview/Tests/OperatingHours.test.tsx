import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import OperatingHours from '../OperatingHours/OperatingHours';
import { OperatingHoursModel } from '../../Shared/Models';


describe('OperatingHours Component', () => {
  let wrapper: ShallowWrapper;

  it('should return null for empty array', () => {
    wrapper = shallow(<OperatingHours hours={[]}/>)
    expect(wrapper.dive().isEmptyRender()).to.eq(true);
  });

  it('should be rendered without errors', () => {
    wrapper = shallow(<OperatingHours hours={[new OperatingHoursModel()]}/>)
    expect(wrapper.dive()).to.have.length(1);
  });
})
