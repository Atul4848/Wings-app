import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { getFormValidation } from '@wings-shared/core';
import MobxReactForm from 'mobx-react-form';
import { MainTerminalEditor } from '../CiqAirport';

describe('MainTerminalEditor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = {
    testField: {
      label: 'Test field label',
      placeholder: 'Test field placeholder',
      rules: 'string',
      value: 'Test value',
    },
  };

  beforeEach(() => {
    form = getFormValidation(fields);
    wrapper = shallow(
        <MainTerminalEditor field={form.$('testField')} />
      )
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
