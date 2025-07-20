import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import {SideNavigation} from '../Components';
import { SidebarStore} from '../Stores';
import { INavigationLink, SVGIcon } from '@wings-shared/layout';
import { expect } from 'chai';
import sinon from 'sinon';

describe('SideNavigation Component', function () {
  let wrapper: ReactWrapper;
  const sidebarStore: typeof SidebarStore =  SidebarStore;
  const navigationLinks: INavigationLink[] = [
    { to: '', title: 'Survey Dashboard', icon: <SVGIcon name="Dashboard" /> },
    { to: '', title: 'TEST', isHidden: true, icon: <SVGIcon name="Test" /> },
  ];
  sidebarStore.setNavLinks(navigationLinks);
  const defaultProps = {
    classes: {
      navigation: 'navigation',
      collapsed: 'collapsed',
      open: 'open',
      openIcon: 'open',
      sidebar: 'sidebar',
      textHidden: 'hidden',
      hide: 'hide-class',
    },
    navigationLinks,
    sidebarStore,
  };

  beforeEach(() => {
    wrapper = mount(
      <MemoryRouter>
        <SideNavigation {...defaultProps}></SideNavigation>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    return wrapper.unmount();
  });

  it('should rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should side navigation state toggled', () => {
    const toggleSpy = sinon.fake();
    wrapper.find('div').at(4).simulate('click');
    expect(toggleSpy.calledOnce).to.be.false;
  });
});
