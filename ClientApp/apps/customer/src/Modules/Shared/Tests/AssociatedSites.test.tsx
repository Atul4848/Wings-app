import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import React from 'react';
import { AssociatedSites, CustomerStoreMock, SettingsStoreMock } from '../../Shared';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { AgGridTestingHelper } from '@wings/shared';

describe('AssociatedSites', () => {
  let wrapper: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    title: 'Sites',
    backNavTitle: '',
    backNavLink: '/sites',
    settingsStore: new SettingsStoreMock(),
    customerStore: new CustomerStoreMock(''),
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedSites {...props} />).dive();
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should change the values with onFilterChange function', () => {
    wrapper.find(SearchHeaderV3).props().onFiltersChanged();
  });
});
