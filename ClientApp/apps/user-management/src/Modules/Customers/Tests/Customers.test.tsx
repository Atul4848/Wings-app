import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { GridApiMock, IGridApi } from '@wings/shared';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { CustomerModel, CustomersStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import Customers, { PureCustomers } from '../Customers';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Customers', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let instance;
  let gridApi: IGridApi;

  const props = {
    classes: {},
    customerStore: new CustomersStoreMock(),
  }

  const customAgGridReact = (): ShallowWrapper => wrapper.find(CustomAgGridReact);

  beforeEach(() => {
    wrapper = shallow(<PureCustomers {...props} />).dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new CustomerModel() });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render SearchHeader and CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(customAgGridReact()).to.be.ok;
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridApi = gridApi;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);
  });

});