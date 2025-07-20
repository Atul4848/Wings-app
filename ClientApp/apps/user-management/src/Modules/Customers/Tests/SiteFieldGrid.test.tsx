import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { SitesModel } from '../../Shared';
import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PureSiteFieldGrid } from '../Components/SiteFieldGrid/SiteFieldGrid';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Site Field Grid', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    sitesField: [new SitesModel()],
    openSiteFieldDialog: sinon.fake(),
    upsertSiteField: sinon.fake(),
    deleteSiteField: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureSiteFieldGrid {...props} />);
    instance = wrapper.instance();
    instance.gridApi = {
      ...new GridApiMock({ data: [new SitesModel()] }),
    };
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });

  it('Grid action CANCEL should stopEditingCell', () => {
    instance.gridActions(GRID_ACTIONS.CANCEL, 1);
    expect(instance.gridApi.stopEditing.called).to.be.true;
  });

  it('Default Grid action is Stop Editing', () => {
    instance.gridActions(null, 1);
    expect(instance.gridApi.stopEditing.calledWith(true)).to.be.true;
  });

  it('Stop editing if no row index provided', () => {
    instance.gridActions(null, null);
    expect(instance.gridApi.stopEditing.calledOnce).to.be.false;
  });

  it('GRID Action DELETE should called callback', () => {
    const confirmRemoveSiteFieldSpy = sinon.spy(instance, 'confirmRemoveSiteField');
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    expect(confirmRemoveSiteFieldSpy.called).to.be.true;
  });

  it('should Grid action perform cases and default on Stop Editing', () => {
    // EDIT case
    instance.gridActions(GRID_ACTIONS.EDIT, 1);
    expect(props.openSiteFieldDialog.calledOnce).to.be.true;
  });

  it('should ask for confirmation on delete button', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(props.deleteSiteField.called).to.be.true;
  });

  it('should close dialog with confirm dialog NO Click', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveSiteField(1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });
});
