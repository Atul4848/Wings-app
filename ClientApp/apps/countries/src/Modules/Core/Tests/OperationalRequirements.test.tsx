import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, OperationalRequirementStoreMock } from '../../Shared';
import OperationalRequirements from '../Components/OperationalRequirements/OperationalRequirements';
import { SidebarStore } from '@wings-shared/layout';
import { useRouterContext } from '@wings/shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Operational Requirement Module', function() {
  let wrapper: ReactWrapper;

  const props = {
    countryId: '1',
    continentId: '2',
    title: 'Test',
    isEditable: true,
    classes: {},
    sidebarStore: SidebarStore,
    countryStore: new CountryStoreMock(),
    operationalRequirementStore: new OperationalRequirementStoreMock(),
  };
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <OperationalRequirements {...props} />
    </ThemeProvider>
  );
  beforeEach(()=> {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(()=> {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
