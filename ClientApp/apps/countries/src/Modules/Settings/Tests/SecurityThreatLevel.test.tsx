import * as React from 'react';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS } from '@wings-shared/core';
import { SettingsStoreMock } from '../../Shared';
import { SecurityThreatLevel } from '../Components';
import sinon from 'sinon';
import { SearchHeaderV3 } from '@wings-shared/form-controls';
import { mount } from 'enzyme';

describe('Security Threat Level Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;
  const reRender = () => wrapper.setProps({ abc: Math.random() });
  const props = {
    classes: {},
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(() => {
    wrapper = mount(<SecurityThreatLevel {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
    agGridHelper.initAgGridAPI();
    // sinon.stub(SettingsModuleSecurity, 'isEditable').value(true);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors, should render CustomAgGridReact and SearchHeader ', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
    expect(wrapper.find(SearchHeaderV3)).to.have.length(1);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start and stop row editing', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    reRender();
    expect(agGridHelper.getAgGridProps().isRowEditing).true;
    // on Row Editing Stopped
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    reRender();
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
});
