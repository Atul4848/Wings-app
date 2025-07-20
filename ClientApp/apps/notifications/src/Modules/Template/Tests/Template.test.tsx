import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import { TemplateModel, TemplateStoreMock, TEMPLATE_FILTERS } from '../../Shared';
import { PureTemplate } from '../Template';
import * as sinon from 'sinon';
import { ModalKeeper, ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { SearchHeader } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Template', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  const templateStore = new TemplateStoreMock();
  let gridApi: IGridApi;
  const templateData = new TemplateModel({
    id: 1,
    name: 'Template-1',
  });

  const searchHeader = (): ShallowWrapper => wrapper.find(SearchHeader);
  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    gridApi = new GridApiMock({ data: templateData });
    wrapper = shallow(
      <div>
        <PureTemplate templateStore={templateStore} classes={{}} />
        <ModalKeeper />
      </div>
    );
    modal = wrapper
      .find(ModalKeeper)
      .dive()
      .shallow();
    wrapper = wrapper
      .find(PureTemplate)
      .dive()
      .shallow();
    instance = wrapper.instance();
    instance.data = templateData;
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render SearchHeader and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(searchHeader()).to.be.ok;
    expect(customAgGridReact()).to.be.ok;
  });

  it('SearchHeader sets searchValue and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('search', 'Template');
    expect(instance.searchValue).to.equal('Template');
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.true;
  });

  it('SearchHeader sets selectedOption and it calls gridApi', () => {
    instance.gridApi = gridApi;
    searchHeader().simulate('searchTypeChange', TEMPLATE_FILTERS.NAME);
    expect(instance.selectedOption).to.equal(TEMPLATE_FILTERS.NAME);
    expect(instance.gridApi.onFilterChanged.calledOnce).to.be.false;
  });

  it('should Grid action perform cases and default on Stop Editing', () => {
    const model = new TemplateModel({ id: 0 });
    gridApi = new GridApiMock({ data: model });
    instance.gridApi = gridApi;

    // DELETE case
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    expect(gridApi.applyTransaction.calledWith({ remove: [model] })).to.be.true;
    expect(gridApi.redrawRows.called).to.be.true;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

  it('should close dialog with confirm dialog no Click', () => {
    instance.gridApi = gridApi;
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.confirmRemoveTemplate(1);
    modal.find(ConfirmDialog).simulate('noClick');
    expect(closeSpy.called).to.be.true;
  });

  it('should close dialog with confirm dialog yes Click', () => {
    instance.gridApi = gridApi;
    const removeTemplate = sinon.spy(instance, 'removeTemplate');
    instance.confirmRemoveTemplate(1);
    modal.find(ConfirmDialog).simulate('yesClick');
    expect(removeTemplate.called).to.be.true;
  });
});
