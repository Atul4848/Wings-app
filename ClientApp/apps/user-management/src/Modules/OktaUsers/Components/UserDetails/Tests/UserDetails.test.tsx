import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UserResponseModel, UserStoreMock } from '../../../../Shared';
import UserDetails from '../UserDetails';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';

describe('User Details Module', () => {
  const props = {
    classes: {},
    user: new UserResponseModel({ id: '00u27r9nqfwouPUYB1d6' }),
    userStore: new UserStoreMock(),
    updateUser: sinon.fake(),
  };
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<UserDetails {...props} />)
      .dive()
      .dive();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    instance.isLoading = true;
    expect(wrapper).to.have.length(1);
  });

  it('should call ModalStore.close() when dialog closed', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });
});
