import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { IconButton } from '@material-ui/core';
import { InputMaximizeLabel } from '../Components';

describe('Input Maximize Label Component', function() {
  let wrapper: ShallowWrapper;

  const props = {
    label: 'TEST',
    onLabelClick: sinon.spy(),
  };

  beforeEach(function() {
    wrapper = shallow(<InputMaximizeLabel {...props} />).dive();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should call on Label Click', function() {
    wrapper.find(IconButton).simulate('click');
    expect(props.onLabelClick.called).to.be.true;
  });
});
