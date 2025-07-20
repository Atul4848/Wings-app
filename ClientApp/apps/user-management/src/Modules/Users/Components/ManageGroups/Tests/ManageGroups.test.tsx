import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { GroupStoreMock, UserStoreMock } from '../../../../Shared';
import ManageGroups from '../ManageGroups';
import { Dialog } from '@uvgo-shared/dialog';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import GroupDetails from '../../GroupDetails/GroupDetails';
import { Button } from '@material-ui/core';
import { SearchInputControl } from '@wings-shared/form-controls';

describe('Manage Groups Module', () => {
  const props = {
    classes: {},
    userId: '00u27r9nqfwouPUYB1d6',
    groupStore: new GroupStoreMock(),
    userStore: new UserStoreMock(),
  };
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<ManageGroups {...props} />)
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

});
