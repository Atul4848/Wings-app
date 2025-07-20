import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { SurveyValueUnitPairEditor } from '../SurveyEditor';
import { MenuItem, TextField } from '@material-ui/core';

describe('Survey Value Unit Pair Editor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = [
    'parent',
    'parent.value',
    'parent.unit'
  ];

  const options = {
    'parent.unit': ['One', 'Two']
  }

  beforeEach(() => {
    form = getFormValidation({ fields, options }, { successHandler: () => {}, isNested: true });
    form.init({ parent: { value: 'Test', unit: 'Unit' }});
    wrapper = shallow(<SurveyValueUnitPairEditor field={form.$('parent')} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('render two fields', () => {
    expect(wrapper.dive().find(TextField)).to.have.length(2);
  });

  it('render as many menu items as provided options', () => {
    expect(wrapper.dive().find(MenuItem)).to.have.length(2);
  });
})
