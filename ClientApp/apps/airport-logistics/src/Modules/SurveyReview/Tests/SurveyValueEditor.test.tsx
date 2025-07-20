import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { SurveyValueEditor } from '../SurveyEditor';
import { TextField } from '@material-ui/core';

describe('Survey Value Editor Component', () => {
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
    wrapper = shallow(<SurveyValueEditor field={form.$('testField')} />)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });


  it('should render TextField', () => {
    expect(wrapper.dive().find(TextField)).to.have.length(1);
  });

  it('field with name nearbyParkingAirports shows uppercase value', () => {
    const fields = {
      nearbyParkingAirports: {
        label: 'Test field label',
        placeholder: 'Test field placeholder',
        rules: 'string',
        value: 'Test value',
      },
    };
    form = getFormValidation(fields);
    wrapper = shallow(<SurveyValueEditor field={form.$('nearbyParkingAirports')} />);
    const textField = wrapper.dive().find(TextField);
    textField.simulate('change', { target: { value: 'Test value' } });
    const expectedValue: string = 'TEST VALUE';

    expect(form.$('nearbyParkingAirports').value).to.equal(expectedValue);
  });
})
