import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import ImportErrorsDialog from '../ImportWorldEvents/ImportErrorsDialog/ImportErrorsDialog';
import { EventStoreMock } from '../../Shared';

describe('Import Errors Dialog', () => {
  let wrapper: any;
  let instance: any;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;
  let eventStore = new EventStoreMock();

  const props = {
    runId: '',
    eventStore,
  };

  beforeEach(() => {
    wrapper = shallow(<ImportErrorsDialog {...props} />).dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(Dialog)).to.be.ok;
    expect(wrapper.find(PrimaryButton)).to.be.ok;
  });

  it('should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    dialogActions.find(PrimaryButton).simulate('click');
    expect(closeSpy.calledOnce).to.be.true;
  });

  it('should call closeHandler when dialog closed', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('close');
    expect(closeSpy.calledOnce).to.be.true;
  });
});
