import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { SidebarStore } from '@wings-shared/layout';
import { PermitStoreMock } from '../../Shared';
import { VIEW_MODE } from '@wings/shared';
import PermitRouteModule from '../Components/PermitRoutes/PermitRoutes';
import { MemoryRouter } from 'react-router';

describe('Permit Routes V2', () => {
  let wrapper: any;

  const props = {
    params: { mode: VIEW_MODE.EDIT, countryId: 1, continentId: 1 },
    permitStore: new PermitStoreMock(),
    sidebarStore: SidebarStore,
    viewMode: VIEW_MODE.EDIT,
  };

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <PermitRouteModule {...props} />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
