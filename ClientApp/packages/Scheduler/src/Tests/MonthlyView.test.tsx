import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MobxReactForm } from 'mobx-react-form';
import { RECURRENCE_PATTERN_TYPE } from '../Enums';
import { weekIndexOptions, daysOfWeekOptions } from '../Components/fields';
import { PureMonthlyView } from '../Components/MonthlyView/MonthlyView';
import { fields } from '../Components/RecurrencePatternView/Fields';
import { monthTypeOptions } from '../Components';
import { getFormValidation, ISelectOption } from '@wings-shared/core';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('MonthlyView Component', () => {
  let wrapper: ShallowWrapper;
  const { RELATIVE_MONTHLY, MONTHLY } = RECURRENCE_PATTERN_TYPE;
  const form: MobxReactForm = getFormValidation(fields);
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const onChange = sinon.fake();
  const props = {
    onChange,
    isEditable: true,
    getField: key => form.$(key),
    classes: {
      root: 'test',
      textFieldContainer: '',
      textField: '',
    },
  };

  const valueChange = (index, value, fieldKey, pattrenType?: RECURRENCE_PATTERN_TYPE) => {
    props.getField('recurrencePatternTypeId').set(pattrenType || MONTHLY);
    wrapper.find(ViewInputControl).at(index).simulate('valueChange', value, fieldKey);
  };

  beforeEach(() => {
    wrapper = shallow(<PureMonthlyView {...props} />);
  });

  afterEach(() => onChange.resetHistory());

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should get Option Label', () => {
    const getOptionLabel: Function = wrapper.find(ViewInputControl).at(0).prop('getOptionLabel');
    expect(getOptionLabel(option)).to.equal(option.label);
  });

  it('should change the Monthly type From ABSOLUTE to RELATIVE', () => {
    valueChange(0, monthTypeOptions[0], 'recurrencePatternTypeId');
    expect(onChange.calledWith(RELATIVE_MONTHLY)).to.true;
  });

  it('should change dayOfMonth for ABSOLUTE_MONTHLY', () => {
    valueChange(1, 'TEST', 'dayOfMonth');
    expect(onChange.calledWith('TEST', 'dayOfMonth')).to.true;
  });

  it('should change interval for ABSOLUTE_MONTHLY', () => {
    valueChange(2, 123, 'interval');
    expect(onChange.calledWith(123, 'interval')).to.true;
  });

  it('should change weekIndexId for RELATIVE_MONTHLY', () => {
    valueChange(1, weekIndexOptions[0], 'weekIndexId', RELATIVE_MONTHLY);
    expect(onChange.calledWith(1, 'weekIndexId')).to.true;
  });

  it('should change firstDayOfWeekId for RELATIVE_MONTHLY', () => {
    valueChange(2, daysOfWeekOptions[0], 'firstDayOfWeekId', RELATIVE_MONTHLY);
    expect(onChange.calledWith(1, 'firstDayOfWeekId')).to.true;
  });

  it('should change interval for RELATIVE_MONTHLY', () => {
    valueChange(3, 1, 'interval', RELATIVE_MONTHLY);
    expect(onChange.calledWith(1, 'interval')).to.true;
  });
});
