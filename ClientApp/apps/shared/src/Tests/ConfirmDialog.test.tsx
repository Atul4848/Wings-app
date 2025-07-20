import * as React from 'react';
import { ReactNode } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PrimaryButton, DangerButton } from '@uvgo-shared/buttons';
import { ConfirmDialog } from '@wings-shared/layout';

describe('Confirm Dialog', () => {
  let wrapper: ShallowWrapper;
  let dialogActions: ShallowWrapper;
  const onYesClick = sinon.fake();
  const onNoClick = sinon.fake();

  const props = {
    title: 'Confirm Delete',
    message: 'Are you sure you want to remove this item',
    onYesClick,
    onNoClick,
  };

  beforeEach(() => {
    wrapper = shallow(<ConfirmDialog {...props} />);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render dialog content', () => {
    const dialogContent: ReactNode = wrapper.find(Dialog).prop('dialogContent')();
    expect(shallow(<div>{dialogContent}</div>).contains(props.message)).to.be.true;
  });

  it('should render dialog Actions', () => {
    expect(dialogActions.find(PrimaryButton)).to.have.length(2);
  });

  it('should call onNoClick prop', () => {
    dialogActions.find(PrimaryButton).first().simulate('click', null);
    expect(onNoClick.callCount).to.eq(1);
  });

  it('should call onYesClick prop', () => {
    dialogActions.find(PrimaryButton).at(1).simulate('click', null);
    expect(onYesClick.callCount).to.eq(1);
  });

  it('should call ModalStore.close() when dialog closed', () => {
    const caller = sinon.spy();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });

  it('should render delete button', () => {
    wrapper.setProps({ isDeleteButton: true, yesButton: 'Delete' });
    const deleteActions: ShallowWrapper = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    expect(deleteActions.find(DangerButton).at(0)).to.have.length(1);
  });
});
