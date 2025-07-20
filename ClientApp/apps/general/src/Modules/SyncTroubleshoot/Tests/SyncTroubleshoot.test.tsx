import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import SyncTroubleshoot from '../SyncTroubleshoot';
import { SyncTroubleshootStoreMock } from '../../Shared';

describe('SyncTroubleshoot Component', function () {
  let wrapper: ShallowWrapper;
  let instance: any;
  beforeEach(function () {
    wrapper = shallow(<SyncTroubleshoot syncTroubleshootStore={new SyncTroubleshootStoreMock()} />)
      .dive()
      .dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });
});
