import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock } from '@wings/shared';
import { SessionStoreMock, UserResponseModel, UserSessionModel } from '../../../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import SessionsModal from '../SessionsModal';
import { Dialog } from '@uvgo-shared/dialog';
import { SESSION_FILTER } from '../../../../Shared/Enums';
import { SearchHeader } from '@wings-shared/form-controls';

describe('User Sessions', function() {
  let wrapper: ShallowWrapper;
  let instance;
  let dialogContent: ShallowWrapper;
  const props = {
    sessionStore: new SessionStoreMock(),
    user: new UserResponseModel(),
  };

  beforeEach(function() {
    wrapper = shallow(<SessionsModal {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: [ new UserSessionModel() ] });
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('close button should open post dialog', function() {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    dialogContent.find(SearchHeader).simulate('search', 'NEW');
    expect(instance.searchValue).to.equal('NEW');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    dialogContent.find(SearchHeader).simulate('searchTypeChange', SESSION_FILTER.ALL);
    expect(instance.selectedOption).to.equal(SESSION_FILTER.ALL);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('ViewRenderer should render view properly ', function() {
    expect(instance.viewRenderer([ new UserSessionModel() ])).to.be.ok;
  });
});
