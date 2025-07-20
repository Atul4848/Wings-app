import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, RegionStoreMock, SettingsStoreMock } from '../../Shared';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { AssociatedRegions } from '../Components';

describe('Associated Region Module', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let headerActions: ShallowWrapper;

  const props = {
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    regionStore: new RegionStoreMock(),
    isEditable: true,
    title: 'Test',
    sidebarStore: SidebarStore,
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedRegions {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors for isEditable as false', () => {
    wrapper.setProps({ ...props, isEditable: false });
    expect(wrapper).to.have.length(1);
  });
});
