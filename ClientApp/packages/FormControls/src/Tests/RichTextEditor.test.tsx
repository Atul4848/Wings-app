import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import { MobxReactForm } from 'mobx-react-form';
import ReactQuill from 'react-quill';
import { getFormValidation } from '@wings-shared/core';
import { InputMaximizeLabel, RichTextEditor } from '../Components';

describe('RichTextEditor Tests', function() {
  let wrapper: ShallowWrapper;
  const form: MobxReactForm = getFormValidation({
    testField: {
      label: 'Test field label',
      value: 'Test value',
      key: 'test',
    },
  });
  const props = {
    onValueChange: sinon.fake(),
    onLabelClick: sinon.fake(),
    label: 'test',
    field: form.$('testField'),
    isEditable: true,
  };

  beforeEach(function() {
    wrapper = shallow(<RichTextEditor {...props} />).dive();
  });

  it('should render without error', function() {
    expect(wrapper).to.be.ok;
  });

  it('should render ReactQuill', function() {
    expect(wrapper.find(ReactQuill)).to.be.ok;
  });

  it('should call onLabelClick on click of expand icon', function() {
    
    wrapper.find(InputMaximizeLabel).simulate('labelClick');
    expect(props.onLabelClick.called).to.be.true;
  });

  it('should call onValueChange on change in editor', function() {
    wrapper.find(ReactQuill).simulate('change');
    expect(props.onValueChange.called).to.be.true;
  });
});
