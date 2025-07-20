import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock } from '@wings/shared';
import { SyncHistoryModel, SyncHistoryStoreMock } from '../../Shared';
import SyncHistory from '../SyncHistory';
import { expect } from 'chai';

describe('SyncHistory', function () {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    syncHistoryStore: new SyncHistoryStoreMock(),
  };

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  beforeEach(function () {
    wrapper = shallow(<SyncHistory {...props} />)
      .dive()
      .dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new SyncHistoryModel() });
  });

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('ViewRenderer should render view properly ', function() {
    expect(instance.viewRenderer([ new SyncHistoryModel() ])).to.be.ok;
  });
});
