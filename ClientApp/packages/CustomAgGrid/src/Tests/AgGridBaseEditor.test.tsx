import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { IBaseEditorProps } from '../Interfaces';
import { AgGridBaseEditor } from '../Components';
import { DATE_TIME_PICKER_TYPE } from '@wings-shared/core';

describe('AgGridBaseEditor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const props = { value: 'test', isEditable: true } as IBaseEditorProps;

  beforeEach(() => {
    wrapper = shallow(<AgGridBaseEditor<IBaseEditorProps> {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => wrapper.unmount());

  it('should return without calling focusIn', () => {
    const focusSpy: sinon.SinonSpy = sinon.spy();
    const select: sinon.SinonSpy = sinon.spy();
    instance.textFieldRef = { current: { focus: focusSpy, select: select } };
    instance.focusIn();
    expect(focusSpy.called).to.be.true;
    expect(select.called).to.be.true;
  });

  it('should check isEditable', () => {
    expect(instance.isEditable).to.be.true;
  });

  it('should check validDateTime', () => {
    const dateTime = '2021-05-28T18:30:00';
    const _dateTime = '2021-05-28T18:31:00';
    const startTimeError = 'Start Time should be before end Time';
    const endTimeError = 'End Time should be after start Time';

    // when start time and end time is valid
    expect(instance.validDateTime(dateTime, _dateTime, true, DATE_TIME_PICKER_TYPE.TIME, false)).to.eq('');

    // when start time is after end time
    expect(instance.validDateTime(_dateTime, dateTime, true, DATE_TIME_PICKER_TYPE.TIME, false)).to.eq(startTimeError);

    // when end time is before start time
    expect(instance.validDateTime(dateTime, _dateTime, false, DATE_TIME_PICKER_TYPE.TIME, false)).to.eq(endTimeError);
  });
});
