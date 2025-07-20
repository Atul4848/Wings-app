import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { SurveyListEditor } from '../SurveyEditor';
import sinon = require('sinon');
import { SinonSpyStatic } from 'sinon';
import { Button, IconButton, TextField } from '@material-ui/core';

describe('Survey List Editor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;
  let buttonClick: SinonSpyStatic;

  const fields = [
    'parent',
    'parent[].fieldOne',
    'parent[].fieldTwo',
    'parent[].fieldThree',
  ];

  beforeEach(() => {
    buttonClick = sinon.spy();
    form = getFormValidation({ fields }, { successHandler: () => {}, isNested: true });
    const values = {
      parent: {
        fieldOne: '',
        fieldTwo: '',
        fieldThree: ''
      }
    };
    form.init(values);
    wrapper = shallow(<SurveyListEditor field={form.$('parent')} addHandler={buttonClick}/>)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render Add button', () => {
    expect(wrapper.dive().find(Button)).to.have.length(1);
  });

  it('should render as many fields as form provided', () => {
    expect(wrapper.dive().find(TextField)).to.have.length(3);
  });

  it('should render as many delete icons as form provided', () => {
    expect(wrapper.dive().find(IconButton)).to.have.length(3);
  });

  it('icon should remove prop from form', () => {
    wrapper.dive().find(IconButton).at(0).simulate('click');
    const values = form.$('parent').values();
    expect(values['fieldOne']).to.be.undefined;
  });

  it('on Add Handler', () => {
    wrapper.dive().find(Button).simulate('click');
    expect(buttonClick).to.have.property('callCount', 1);
  });
})
