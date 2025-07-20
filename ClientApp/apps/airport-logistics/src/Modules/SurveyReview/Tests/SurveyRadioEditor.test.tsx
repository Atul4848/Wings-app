import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { SurveyRadioEditor } from '../SurveyEditor';
import { FormControlLabel, RadioGroup } from '@material-ui/core';

describe('Survey Radio Editor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = {
    testField: {
      label: 'Test field label',
      placeholder: 'Test field placeholder',
      rules: 'string',
      value: 'Test value',
      options: ['one', 'two']
    },
  };

  beforeEach(() => {
    form = getFormValidation(fields);
    wrapper = shallow(<SurveyRadioEditor field={form.$('testField')} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('render RadioGroup', () => {
    expect(wrapper.dive().find(RadioGroup)).to.have.length(1);
  });

  it('render as many FormControlLabel as provided options', () => {
    const options: string[] = form.$('testField').get('options');
    expect(wrapper.dive().find(FormControlLabel)).to.have.length(options.length);
  });
})
