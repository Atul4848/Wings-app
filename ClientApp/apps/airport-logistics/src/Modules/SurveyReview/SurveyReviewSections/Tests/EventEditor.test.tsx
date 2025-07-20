import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { EventEditor } from '../EventAndPertinent';
import { Button, IconButton } from '@material-ui/core';
import { SurveyDatePickerEditor, SurveyRadioEditor, SurveyValueEditor } from '../../SurveyEditor';

describe('EventEditor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = [
    'parent',
    'parent[].name',
    'parent[].startDate',
    'parent[].endDate',
    'parent[].hotelShortage',
  ];

  beforeEach(() => {
    form = getFormValidation({ fields }, { successHandler: () => {}, isNested: true });
    form.init({
      parent: [{
        name: '',
        startDate: '',
        endDate: '',
        hotelShortage: '',
      }]
    })
    wrapper = shallow(<EventEditor field={form.$('parent')} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('render Add Button', () => {
    expect(wrapper.dive().find(Button)).to.have.length(1);
  });

  it('render SurveyValueEditor', () => {
    expect(wrapper.dive().find(SurveyValueEditor)).to.have.length(1);
  });

  it('render 2 SurveyDatePickerEditor', () => {
    expect(wrapper.dive().find(SurveyDatePickerEditor)).to.have.length(2);
  });

  it('render SurveyRadioEditor', () => {
    expect(wrapper.dive().find(SurveyRadioEditor)).to.have.length(1);
  });

  it('render Delete button as many as form childs', () => {
    expect(wrapper.dive().find(IconButton)).to.have.length(1);
  });

  it('add button adds one more sets of fields', () => {
    wrapper.dive().find(Button).simulate('click');
    expect(form.$('parent').values().length).to.equal(2);
  });

  it('delete button delete set of field', () => {
    wrapper.dive().find(IconButton).simulate('click');
    expect(form.$('parent').values().length).to.equal(0);
  });
})
