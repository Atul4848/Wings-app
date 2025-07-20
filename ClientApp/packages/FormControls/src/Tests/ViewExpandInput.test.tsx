import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ViewExpandInput, ViewInputControl } from '../Components';
import { EDITOR_TYPES } from '../Enums';

describe('View Expand Input Component', function() {
  let wrapper: ShallowWrapper;

  const props = {
    isExpandMode: true,
    isEditable: true,
    expandModeField: {
      fieldKey: 'test',
      type: EDITOR_TYPES.TEXT_FIELD,
      multiline: true,
      rows: 40,
      label: 'TEST',
      isExpanded: true,
      isInputCustomLabel: true,
    },
    onGetField: sinon.spy(),
    onValueChange: sinon.spy(),
    onLabelClick: sinon.spy(),
  };

  beforeEach(function() {
    wrapper = shallow(<ViewExpandInput {...props} />).dive();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should call on value change', function() {
    wrapper.find(ViewInputControl).at(0).simulate('valueChange');
    expect(props.onValueChange.called).to.be.true;
  });

  it('should call on GetField', function() {
    wrapper.find(ViewInputControl).at(0).simulate('getField');
    expect(props.onGetField.called).to.be.true;
  });

  it('should call on Label Click', function() {
    wrapper.find(ViewInputControl).at(0).simulate('labelClick');
    expect(props.onLabelClick.called).to.be.true;
  });
});
