import { GRID_ACTIONS } from '@wings-shared/core';
import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { Logger } from '@wings-shared/security';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {
  AssociatedRegistries,
  CustomerStoreMock,
  EntityMapStoreMock,
  RegistryStoreMock,
  SettingsStoreMock,
} from '../../Shared';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { DetailsEditorHeaderSection } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';

describe('AssociatedRegistries', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    title: 'Registry',
    backNavTitle: '',
    backNavLink: '/registry',
    registryStore: new RegistryStoreMock(''),
    settingsStore: new SettingsStoreMock(),
    customerStore: new CustomerStoreMock(''),
    entityMapStore: new EntityMapStoreMock(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AssociatedRegistries {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    sinon.stub(Logger, 'warning');
    wrapper = mount(useRouterContext(element));
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should start and stop header actions', () => {
    wrapper.find(DetailsEditorHeaderSection).props().onAction(GRID_ACTIONS.EDIT);
    wrapper.find(DetailsEditorHeaderSection).props().onAction(GRID_ACTIONS.CANCEL);
  });

  it('should change the values with onDropDownChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    const mock = sinon.spy(parentComp, 'onDropDownChange');
    parentComp.onDropDownChange({ colDef: { field: 'abc' } } as any, null);
    parentComp.onDropDownChange({ colDef: { field: 'registry' } } as any, 'abc');
    expect(mock.callCount).equal(2);
  });

  it('should change the values with onInputChange function', () => {
    const parentComp = agGridHelper.getParentComponent();
    parentComp.onInputChange({ colDef: { field: 'startDate' } } as any, '');
    parentComp.onInputChange({ colDef: { field: 'endDate' } } as any, '');
  });

  it('should change the values with onFilterChange function', () => {
    wrapper.find(SearchHeaderV3).props().onFiltersChanged();
  });

});
