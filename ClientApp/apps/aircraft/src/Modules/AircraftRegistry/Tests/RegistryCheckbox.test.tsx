import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { RegistrySequenceBaseModel } from '../../Shared';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { RegistryCheckbox } from '../Components';

describe('RegistryCheckbox Component', () => {
  let wrapper: ShallowWrapper;

  const props = {
    options: [new RegistrySequenceBaseModel({ id: 1 })],
    values: [new RegistrySequenceBaseModel({ id: 1 })],
    onValueChange: sinon.fake(),
    isEditable: true,
  };

  beforeEach(() => {
    wrapper = shallow(<RegistryCheckbox {...props} />);
  });

  it('should rendered correctly', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onValueChange onCHECKBOX value change', () => {
    wrapper.setProps({ ...props, checked: false });
    wrapper
      .find(FormControlLabel)
      .dive()
      .dive()
      .find(Checkbox)
      .simulate('change', new RegistrySequenceBaseModel({ id: 1 }));
    expect(props.onValueChange.called).to.be.true;
  });
});
