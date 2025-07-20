import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { VIEW_MODE } from '@wings/shared';
import { CustomersStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { PureUpsertCustomers } from '../Components/UpsertCustomers/UpsertCustomers';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';

describe('Upsert Customers', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    customerStore: new CustomersStoreMock(),
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: '' },
    navigate: sinon.fake(),
  }

  beforeEach(() => {
    wrapper = shallow(<PureUpsertCustomers {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  // it('cancel button should cancel the made changes', () => {
  //   const navigateToUvgoSettingsSpy = sinon.spy(instance, 'navigateToUvgoSettings');
  //   headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
  //   expect(navigateToUvgoSettingsSpy.called).to.be.true;
  // });

  // it('save button should update/create Customers filter', () => {
  //   const upsertCustomerSpy = sinon.spy(instance, 'upsertCustomer');
  //   headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
  //   expect(upsertCustomerSpy.called).to.be.true;
  // });

});