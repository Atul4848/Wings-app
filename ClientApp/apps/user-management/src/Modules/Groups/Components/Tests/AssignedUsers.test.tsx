import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import AssignedUsers from '../../Components/AssignedUsers/AssignedUsers';
import { UserStoreMock } from '../../../Shared';
import { SearchInputControl } from '@wings-shared/form-controls';

describe('Assigned Users Dialog', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  const props = {
    classes: {},
    userStore: new UserStoreMock(),
    upsertGroup: sinon.fake(),
  };

  const renderView = props => {
    wrapper = shallow(<AssignedUsers {...props} />).dive().dive();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  };

  beforeEach(() => renderView(props));

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('should render SearchInputControls', () => {
    dialogContent.find(SearchInputControl).prop('onSearch')('test');
    expect(instance.searchValue).to.eq('test');
  });

});
