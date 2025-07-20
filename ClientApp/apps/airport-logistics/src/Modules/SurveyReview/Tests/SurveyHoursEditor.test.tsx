import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { OperatingHoursModel } from '../../Shared/Models';
import { SurveyHoursEditor } from '../SurveyEditor';
import { TextField } from '@material-ui/core';

describe('Survey Hours Editor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = [
    'operatingHours',
    'operatingHours[].timeTo',
    'operatingHours[].timeFrom',
    'operatingHours[].day',
  ];

  beforeEach(() => {
    form = getFormValidation({ fields }, { successHandler: () => {}, isNested: true });
    const values = { operatingHours: [ new OperatingHoursModel() ] };
    form.init(values);
    wrapper = shallow(<SurveyHoursEditor field={form.$('operatingHours')} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper.dive().find(TextField)).to.have.length(2);
  });

  it('timeFrom onChange', () => {
    wrapper.dive().find(TextField).at(0).simulate('change', { target: { value: '11:00' }});
    const first = form.$('operatingHours').values();
    expect(first[0].timeFrom).to.equal('11:00');
  });

  it('timeTo onChange', () => {
    wrapper.dive().find(TextField).at(1).simulate('change', { target: { value: '11:00' }});
    const first = form.$('operatingHours').values();
    expect(first[0].timeTo).to.equal('11:00');
  });

  it('invalid time set empty value', () => {
    wrapper.dive().find(TextField).at(0).simulate('change', { target: { value: 'test' }});
    const first = form.$('operatingHours').values();
    expect(first[0].timeTo).to.equal('');
  });

  it('if time from is bigger than time to sets empty value', () => {
    // first element is timeFrom
    wrapper.dive().find(TextField).at(0).simulate('change', { target: { value: '11:00' }});
    wrapper.update();
    wrapper.dive().find(TextField).at(1).simulate('change', { target: { value: '10:00' }});
    const first = form.$('operatingHours').values();
    expect(first[0].timeTo).to.equal('');
  });
})
