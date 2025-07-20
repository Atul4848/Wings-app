import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import PureEventAttributeInputControl from '../Components/EventAttributeInputControl/EventAttributeInputControl';
import { FieldDefinitionModel } from '../../Shared';
import { EDITOR_TYPES } from '@wings-shared/form-controls';

describe('Event Attribute Input Control', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    attributes: [new FieldDefinitionModel({ value: 'Test', variableName: 'Test' })],
    onValueUpdate: sinon.fake(),
    groupInputControls: {
      title: '',
      inputControls: [
        {
          fieldKey: 'Test',
          label: '',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    },
    focusOutFields: ['Test'],
    onFocus: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureEventAttributeInputControl {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
