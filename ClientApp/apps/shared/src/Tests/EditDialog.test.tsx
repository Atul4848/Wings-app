import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import PureEditDialog from '../Components/EditDialog/EditDialog';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EditSaveButtons, TabsLayout } from '@wings-shared/layout';

describe('EditDialog Module', () => {
  let wrapper: ShallowWrapper;
  let dialogActions: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  let instance: any;
  let tabContent = sinon.spy((tabIndex: number) => '');

  const props = {
    classes: {},
    onAction: sinon.fake(),
    tabs: ['', ''],
    title: '',
    isEditable: true,
    tabContent,
    hasEditPermission: true,
  };

  beforeEach(() => {
    wrapper = shallow(<PureEditDialog {...props} />).dive();
    instance = wrapper.instance();
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  it('should be rendered without errors', () => {
    const prop = { ...props, tabs:[] };
    wrapper = shallow(<PureEditDialog {...prop} />).dive();
    instance = wrapper.instance();
    expect(wrapper).to.have.length(1);

    // render dialog Actions
    expect(dialogActions.find(EditSaveButtons)).to.have.length(1);
  });

  it('should call ModalStore.close() when dialog closed', () => {
    const caller = sinon.fake();
    ModalStore.close = caller;
    wrapper.simulate('close');
    expect(caller.calledOnce).to.be.true;
  });

  it('should render set active tab properly', () => {
    dialogContent.find(TabsLayout).simulate('tabChange', 'Test');
    expect(instance.activeTab).to.eq('Test');
  });

  it('should render dialog isLoading', () => {
    wrapper.setProps({ ...props, isLoading: true });
    expect(wrapper.find(Dialog).prop('isLoading')()).to.be.true;
  });
});
