import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import StepperKeeper from '../StepperKeeper/StepperKeeper';

describe('StepperKeeper component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<StepperKeeper><div>Test</div></StepperKeeper>);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
