import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GroupStoreMock, UserGroupModel, UserResponseModel, UserStoreMock } from '../../../../Shared';
import ManageUserGroups from '../ManageUserGroups';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Groups } from '../../index';
import { SearchInputControl } from '@wings-shared/form-controls';

describe('Manage User Groups Module', () => {
  const props = {
    classes: {},
    user: new UserResponseModel({ id: '00u27r9nqfwouPUYB1d6' }),
    groupStore: new GroupStoreMock(),
    userStore: new UserStoreMock(),
  };
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<ManageUserGroups {...props} />)
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

  it('should render SearchInputControls', () => {
    expect(dialogContent.find(SearchInputControl).prop('onSearch')('test')).to.be.ok;
  });

  it('should call removeGroup method', () => {
    const removeGroupSpy = sinon.spy(instance, 'removeGroup');
    dialogContent.find(Groups).at(0).simulate('action', 'test');
    expect(removeGroupSpy.calledOnce).to.be.true;
  });

  it('should call assignGroup method', () => {
    const assignGroupSpy = sinon.spy(instance, 'assignGroup');
    dialogContent.find(Groups).at(1).simulate('action', 'test');
    expect(assignGroupSpy.calledOnce).to.be.true;
  });
});
