import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock } from '@wings/shared';
import { SyncHistoryChangeModel, SyncHistoryModel, SyncHistoryStoreMock } from '../../Shared';
import { expect } from 'chai';
import SyncHistoryChanges from '../Components/SyncHistory-Changes/SyncHistoryChanges';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';

describe('Sync History Changes', function () {
  let wrapper: ShallowWrapper;
  let instance;
  let dialogContent: ShallowWrapper

  const props = {
    classes: {},
  };

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  beforeEach(function () {
    wrapper = shallow(<SyncHistoryChanges {...props} />)
      .dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new SyncHistoryChangeModel() });
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  });

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });
  
  it('close button should open post dialog', function () {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });
  
});
