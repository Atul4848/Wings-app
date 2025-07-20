import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { UserStoreMock } from '../../Shared/Mocks';
import { PureUserMigration } from '../UserMigration';
import * as sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SearchInputControl } from '@wings-shared/form-controls';

describe('User Migration Component', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    userStore: new UserStoreMock(),
  };

  beforeEach(() => {
    wrapper = shallow(
      <div>
        <PureUserMigration {...props} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper.find(ModalKeeper).dive().shallow();
    wrapper = wrapper.find(PureUserMigration).dive().shallow();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('Should render without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render searchInputControl', () => {
    // with empty string;
    wrapper.find(SearchInputControl).simulate('search', '');
    expect(instance.csdUsers).to.have.length(0);

    // with value
    wrapper.find(SearchInputControl).simulate('search', 'test');
    expect(instance.searchValue).to.eq('test');

    // should call loadcsdusers
    const loadCsdUsersSpy = sinon.spy(instance, 'loadCsdUsers');
    wrapper.find(SearchInputControl).prop('onKeyUp')('enter');
    expect(loadCsdUsersSpy.calledWith('enter')).to.be.true;
  });

  it('should call openUpdateStageEmail Modal on click', () => {
    const openUpdateStageEmailModalSpy = sinon.spy(instance, 'openUpdateStageEmailModal')
    instance.gridActions(GRID_ACTIONS.SETSTAGEEMAIL, 1);
    expect(openUpdateStageEmailModalSpy.called).to.be.true;
  });

  it('should close send email dialog with confirm dialog NO Click', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmSendEmailVerification(1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog and send email with confirm dialog YES Click', () => {
    const sendEmailVerification = sinon.spy(instance, 'sendVerificationEmail');
    instance.confirmSendEmailVerification(1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(sendEmailVerification.called).to.be.true;
  });
});
