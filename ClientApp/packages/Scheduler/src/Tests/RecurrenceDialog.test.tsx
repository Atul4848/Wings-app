import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PureRecurrenceDialog } from '../Components/RecurrenceDialog/RecurrenceDialog';
// import { RecurrenceEditor, ScheduleModel, SCHEDULE_TYPE } from '../Components/Scheduler/index';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ScheduleModel } from '../Models';
import { RecurrenceEditor } from '../Components';
import { SCHEDULE_TYPE } from '../Enums';

describe('RecurrenceDialog', () => {
  let wrapper: ShallowWrapper;
  let wrapperInstance: any;
  let dialogActions: ShallowWrapper;
  let dialogContent: ShallowWrapper;

  const onSave = sinon.fake();

  const props = {
    scheduleData: new ScheduleModel(),
    hasRecurrence: true,
    onSave,
    classes: {},
    isLoading: () => true,
    hasPermission : false
  };

  beforeEach(() => {
    wrapper = shallow(<PureRecurrenceDialog {...props} />);
    wrapperInstance = wrapper.instance();
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    onSave.resetHistory();
  });

  it('should be rendered without errors, should render dialog Actions and dialog Content', () => {
    expect(wrapper).to.have.length(1);
    expect(dialogActions.find(PrimaryButton)).to.have.length(3);
    expect(dialogContent.find(RecurrenceEditor)).to.have.length(1);
  });

  it('should call closeHandler when dialog closed', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });

  it('should call close dialog recurrence with close button', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    dialogActions.find(PrimaryButton).at(0).simulate('click', null);
    expect(caller.called).to.be.true;
  });

  it('should call on save method with remove button', () => {
    dialogActions.find(PrimaryButton).at(1).simulate('click', null);
    expect(onSave.calledWith(SCHEDULE_TYPE.SINGLE_INSTANCE, props.scheduleData)).to.true;
  });

  it('should call on save method with update button', () => {
    dialogActions.find(PrimaryButton).at(2).simulate('click', null);
    expect(onSave.calledWith(SCHEDULE_TYPE.RECURRENCE, props.scheduleData)).to.true;
  });

  it('should update schedule Data with onChange of recurrence editor', () => {
    dialogContent.find(RecurrenceEditor).simulate('change', new ScheduleModel({ id: 123 }), false);
    expect(wrapperInstance.scheduleData.id).to.equals(123);
  });
});
