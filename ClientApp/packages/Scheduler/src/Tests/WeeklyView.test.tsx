import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MobxReactForm } from 'mobx-react-form';
import { daysOfWeekOptions, WeeklyView } from '../Components';
import { fields } from '../Components/RecurrencePatternView/Fields';
import { FormControlLabel } from '@material-ui/core';
import { getFormValidation } from '@wings-shared/core';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('WeeklyView Component', () => {
  let wrapper: ShallowWrapper;
  const onChange = sinon.fake();
  const form: MobxReactForm = getFormValidation(fields);
  const props = {
    onChange,
    isEditable: true,
    recurrencePatternId: 1,
    getField: key => form.$(key),
    classes: {},
  };

  beforeEach(() => {
    props.getField('daysOfWeeks').set(daysOfWeekOptions);
    wrapper = shallow(<WeeklyView {...props} />).dive();
  });

  afterEach(() => onChange.resetHistory());

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onChange prop with interval', () => {
    wrapper.find(ViewInputControl).simulate('valueChange', 2, 'interval');
    expect(onChange.calledWith(2, 'interval')).to.true;
  });

  it('should call onChange prop when user select a day', () => {
    const event = { target: { checked: true } };
    const formControlLabel = wrapper.find(FormControlLabel).first();
    shallow(formControlLabel.prop('control')).simulate('change', event);
    expect(onChange.calledOnce).to.true;
  });

  it('should call onChange prop when user unselect a day', () => {
    const event = { target: { checked: false } };
    const formControlLabel = wrapper.find(FormControlLabel).first().shallow();
    shallow(formControlLabel.prop('control')).simulate('change', event);
    expect(onChange.calledOnce).to.true;
  });
});
