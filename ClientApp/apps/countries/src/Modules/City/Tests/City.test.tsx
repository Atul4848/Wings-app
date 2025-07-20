import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { CountryStoreMock, SettingsStoreMock } from '../../Shared/Mocks';
import { AgGridTestingHelper, CityModel, CountryModel, StateModel } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import * as sinon from 'sinon';
import { SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import City from '../City';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import LocationCityIcon from '@material-ui/icons/LocationOnOutlined';

describe('City Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });
  const props = {
    settingsStore: new SettingsStoreMock(),
    countryStore: new CountryStoreMock(),
    sidebarStore: SidebarStore,
  };
  beforeEach(() => {
    wrapper = mount(
      <ThemeProvider theme={createTheme(LightTheme)}>
        <City {...props} />
      </ThemeProvider>
    );
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
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

  it('should call filter change function when isInitEvent is false', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(false);
  });

  it('should call filter change function  when isInitEvent is true', () => {
    const searchHeader = wrapper.find(SearchHeaderV3);
    searchHeader.props().onFiltersChanged(true);
  });

  it('should render audit history on click audit', () => {
    agGridHelper.onAction(GRID_ACTIONS.AUDIT, 1);
    const auditHistory = shallow(ModalStore.data);
    expect(auditHistory).to.have.length(1);
    reRender();
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

  it('should call delete function on delete button click', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 0);
  });

  it('should get correct values from filterValueGetter in column definitions', () => {
    const fieldsToCheck = ['state', 'country'];
    const mockData = {
      data: {
        state: { code: 'abc', isoCode: '' },
        country: { code: 'abc', iso2Code: '' },
      },
    };
    const expectedValue = 'abc';

    agGridHelper.testFilterValueGetter(fieldsToCheck, mockData, expectedValue);
  });

  it('should open the city creation dialog on add button click', () => {
    const openSpy = sinon.fake();
    ModalStore.open = openSpy;
    const addButton = wrapper
      .find(SearchHeaderV3)
      .props()
      .rightContent();
    addButton.props.children.props.onClick();
    expect(openSpy.calledOnce).to.be.true;
  });

  it('should open the UpsertCity dialog with VIEW_MODE.EDIT and VIEW_MODE.DETAILS', () => {
    const openSpy = sinon.fake();
    ModalStore.open = openSpy;
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 1);
    expect(openSpy.calledOnce).to.be.true;
  });

  it('should open the UpsertCity dialog with VIEW_MODE.DETAILS on details action', () => {
    const openSpy = sinon.fake();
    ModalStore.open = openSpy;
    agGridHelper.onAction(GRID_ACTIONS.DETAILS, 1);
    expect(openSpy.calledOnce).to.be.true;
  });
});
