import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import { MobxReactForm } from 'mobx-react-form';
import { SimpleMarkdownEditor } from '../Components';
import SimpleMdeReact from 'react-simplemde-editor';
import { getFormValidation } from '@wings-shared/core';

describe('SimpleMarkdownEditor Tests', function() {
  let wrapper: ShallowWrapper;
  const form: MobxReactForm = getFormValidation({
    testField: {
      label: 'Message',
      value: 'Test value',
      key: 'test',
    },
  });

  const props = {
    onValueChange: sinon.fake(),
    field: form.$('testField'),
    classes: {}
  };

  beforeEach(function() {
    wrapper = shallow(<SimpleMarkdownEditor {...props} />).dive();
  });

  it('should render without error', function() {
    expect(wrapper).to.be.ok;
  });

  it('should render SimpleMdeReact', function() {
    expect(wrapper.find(SimpleMdeReact)).to.be.ok;
  });

  it('should call onValueChange on change in editor', function() {
    wrapper.find(SimpleMdeReact).simulate('change');
    expect(props.onValueChange.called).to.be.true;
  });
});
