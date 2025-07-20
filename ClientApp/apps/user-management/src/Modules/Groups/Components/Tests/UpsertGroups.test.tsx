import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VIEW_MODE } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import UpsertGroup from '../../Components/UpsertGroups/UpsertGroup';
import { GroupStoreMock, UserGroupModel } from '../../../Shared';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Upsert Groups Dialog', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  const props = {
    classes: {},
    groupStore: new GroupStoreMock(),
    upsertGroup: sinon.fake(),
    viewMode: VIEW_MODE.EDIT,
    Id: 1,
    userGroup: new UserGroupModel(),
  };

  const renderView = props => {
    wrapper = shallow(<UpsertGroup {...props} />).dive().shallow();
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

  it('save button should call UpsertGroup on props', () => {
    dialogContent.find(PrimaryButton).simulate('click');
    expect(props.upsertGroup.calledOnce).to.true;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('onValueChange should be called on ViewInputControl change', () => {
    const mockValueChange = sinon.fake();
    instance.onValueChange = mockValueChange;
    dialogContent.find(ViewInputControl).at(0).simulate('ValueChange');
    expect(mockValueChange.called).to.be.true;
  })

  it('onValueChange should update form value', () => {
    const mockFormUpdate = sinon.fake();
    instance.getField('name').set = mockFormUpdate;
    instance.onValueChange('test', 'name');
    expect(mockFormUpdate.called).to.be.true;
  });
});
