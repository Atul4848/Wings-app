import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SyncTroubleshootStoreMock } from '../../../../Shared';
import Synchronisation from '../Synchronisation';

describe('Synchronisation Component', function () {
  let wrapper: ShallowWrapper;
  let instance: any;
  beforeEach(function () {
    wrapper = shallow(<Synchronisation syncTroubleshootStore={new SyncTroubleshootStoreMock()} />)
      .dive()
      .dive();
    instance = wrapper.instance();
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.be.ok;
  });
});
