import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UserResponseModel, UserStoreMock } from '../../../../Shared';
import ManageCSDMapping from '../ManageCSDMapping';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Groups } from '../../index';
import { SearchInputControl } from '@wings-shared/form-controls';

describe('Manage CSD Mapping Module', () => {
  const props = {
    classes: {},
    user: new UserResponseModel({ id: '00u27r9nqfwouPUYB1d6' }),
    userStore: new UserStoreMock(),
    updateUser: sinon.fake(),
    refreshUserGroups: sinon.fake()
  };
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<ManageCSDMapping {...props} />)
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
    const loadCsdUsersSpy = sinon.spy(instance, 'setSearchValue');
    dialogContent.find(SearchInputControl).prop('onSearch')('test');
    expect(loadCsdUsersSpy.calledWith('test')).to.be.true;

  });

  it('should call addRemoveCsdUser method', () => {
    const addRemoveCsdUserSpy = sinon.spy(instance, 'addRemoveCsdUser');
    dialogContent.find(Groups).at(0).simulate('action');
    expect(addRemoveCsdUserSpy.calledOnce).to.be.true;
  });
});
