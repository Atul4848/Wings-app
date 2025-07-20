import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MobxReactForm } from 'mobx-react-form';
import { RECURRENCE_PATTERN_TYPE } from '../Enums';
import {
  monthOptions,
  weekIndexOptions,
  daysOfWeekOptions,
  yearTypeOptions,
} from '../Components/fields';
import { fields } from '../Components/RecurrencePatternView/Fields';
import { YearlyView } from '../Components';
import { getFormValidation, ISelectOption } from '@wings-shared/core';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('YearlyView Component', () => {
  let wrapper: ShallowWrapper;
  const { RELATIVE_YEARLY, YEARLY } = RECURRENCE_PATTERN_TYPE;
  const form: MobxReactForm = getFormValidation(fields);
  const option: ISelectOption = { label: 'Label 0', value: 0 };
  const onChange = sinon.fake();
  const props = {
    onChange,
    isEditable: true,
    getField: key => form.$(key),
    classes: {},
  };

  const valueChange = (index, value, fieldKey, pattrenType?: RECURRENCE_PATTERN_TYPE) => {
    props.getField('recurrencePatternTypeId').set(pattrenType || YEARLY);
    wrapper.find(ViewInputControl).at(index).simulate('valueChange', value, fieldKey);
  };

  beforeEach(() => {
    wrapper = shallow(<YearlyView {...props} />).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should get Option Label', () => {
    const getOptionLabel: Function = wrapper.find(ViewInputControl).at(1).prop('getOptionLabel');
    expect(getOptionLabel(option)).to.equal(option.label);
  });

  // RELATIVE Yearly
  it('should change interval', () => {
    valueChange(0, 1, 'interval');
    expect(onChange.calledWith(1, 'interval')).to.true;
  });

  it('should change the Monthly type From ABSOLUTE to RELATIVE', () => {
    valueChange(1, yearTypeOptions[0], 'recurrencePatternTypeId');
    expect(onChange.calledWith(RELATIVE_YEARLY)).to.true;
  });

  it('should change month with ABSOLUTE Yearly', () => {
    valueChange(2, monthOptions[0], 'month');
    expect(onChange.calledWith(1)).to.true;
  });

  it('should change dayOfMonth with ABSOLUTE Yearly', () => {
    valueChange(3, 30, 'dayOfMonth');
    expect(onChange.calledWith(30)).to.true;
  });

  // RELATIVE Yearly
  it('should change weekIndexId with RELATIVE Yearly', () => {
    valueChange(2, weekIndexOptions[0], 'weekIndexId', RELATIVE_YEARLY);
    expect(onChange.calledWith(1)).to.true;
  });

  it('should change firstDayOfWeekId with RELATIVE Yearly', () => {
    valueChange(3, daysOfWeekOptions[0], 'firstDayOfWeekId', RELATIVE_YEARLY);
    expect(onChange.calledWith(1)).to.true;
  });

  it('should change month with RELATIVE Yearly', () => {
    valueChange(4, monthOptions[0], 'month', RELATIVE_YEARLY);
    expect(onChange.calledWith(1)).to.true;
  });
});
