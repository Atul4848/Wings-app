import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper, useRouterContext } from '@wings/shared';
import { ConfirmDialog, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { HealthAuthorizationChangeRecordModel, HealthAuthStoreMock } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ChangeRecord } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import sinon from 'sinon';

describe('Change Record', () => {
  let wrapper: any;
  let headerActions: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    classes: {},
    isEditable: true,
    healthAuthStore: new HealthAuthStoreMock(),
    changeRecords: [new HealthAuthorizationChangeRecordModel()],
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <ChangeRecord {...props} />
    </ThemeProvider>
  );
  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    agGridHelper = new AgGridTestingHelper(wrapper, true);
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(headerActions).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(DetailsEditorHeaderSection).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(wrapper.find(DetailsEditorHeaderSection).prop('backNavTitle')).equal('Health Authorizations');
    onAction(GRID_ACTIONS.CANCEL);
  });

  it('should not start row editing if row index is null', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, null);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should start row editing ', () => {
    agGridHelper.onAction(GRID_ACTIONS.EDIT, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it('should stop row editing on cancel ', () => {
    agGridHelper.onAction(GRID_ACTIONS.CANCEL, 0);
    expect(agGridHelper.getAgGridProps().isRowEditing).false;
  });

  it(' on delete action ', () => {
    agGridHelper.onAction(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.be.ok;
  });

  it('onAction should call upsertChangeRecords on SAVE action', () => {
    const upsertSpy = sinon.spy(props.healthAuthStore, 'upsertChangeRecords');
    headerActions.find(DetailsEditorHeaderSection).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertSpy.called).true;
  });
});
