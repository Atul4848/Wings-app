import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AssociatedSitesRoutes } from '../../Shared';
import { SidebarStore } from '@wings-shared/layout';
import sinon from 'sinon';

describe('AssociatedSitesRoutes', () => {
  let wrapper: ShallowWrapper;

  const props = {
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedSitesRoutes {...props} basePath="" />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

});
