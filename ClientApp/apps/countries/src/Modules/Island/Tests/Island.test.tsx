import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import {
  AgGridTestingHelper,
} from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import { mount } from 'enzyme';
import Island from '../Island';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';

describe('Island Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const reRender = () => wrapper.setProps({ abc: Math.random() });
  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <Island
        countryStore={new CountryStoreMock()}
        settingsStore={new SettingsStoreMock()}
        sidebarStore={SidebarStore}
      />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(element);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });
  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should render audit history on click audit', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(<div>{ModalStore.data}</div>);
    expect(auditHistory).to.have.length(1);
    reRender();
  });
  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should render the react node with rightContent function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
  });

  it('should change the values with onFilterChange function', () => {
    wrapper
      .find(SearchHeaderV3)
      .props()
      .onFiltersChanged();
  });
  it('should properly handle row editing state', () => {
    const isRowEditing = wrapper.find(CustomAgGridReact).prop('isRowEditing');
    expect(isRowEditing).to.be.false;
  });
});
