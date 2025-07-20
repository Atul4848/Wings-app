import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { CategoryStoreMock, EventTypeStoreMock, FieldDefinitionModel } from '../../Shared';
import { PureEventTypeEditor } from '../Components/EventTypeEditor/EventTypeEditor';
import { FieldDefinitionGrid } from '../Components';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Event Type Editor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const eventTypeStore = new EventTypeStoreMock();

  const props = {
    classes: {},
    eventTypeStore,
    categoryStore: new CategoryStoreMock(),
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: 1 },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureEventTypeEditor {...props} />).dive();
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should work with EditSaveButtons', () => {
    // For Cancel
    const navigateSpy = sinon.spy(instance, 'navigateToEventTypes');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateSpy.called).to.be.true;

    // For Upsert
    const upsertEventTypeSpy = sinon.spy(instance, 'upsertEventType');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertEventTypeSpy.called).to.be.true;
  });

  it('should render modal dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(FieldDefinitionGrid).prop('openEventTypeFieldDialog')(new FieldDefinitionModel(), VIEW_MODE.NEW);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData).to.have.length(1);
    instance.upsertFieldDefinition(new FieldDefinitionModel());
    expect(closeSpy.called).to.be.true;
  });

  it('should work with FieldDefinitionGrid', () => {
    // For Delete
    const deleteFieldDefinitionSpy = sinon.spy(instance, 'deleteFieldDefinition');
    wrapper.find(FieldDefinitionGrid).prop('deleteFieldDefinition')(1);
    expect(deleteFieldDefinitionSpy.called).to.be.true;

    // For Upsert
    const upsertFieldDefinitionSpy = sinon.spy(instance, 'upsertFieldDefinition');
    wrapper.find(FieldDefinitionGrid).prop('upsertFieldDefinition')(
      new FieldDefinitionModel({ id: 1, variableName: 'Test' })
    );
    expect(upsertFieldDefinitionSpy.calledWith(new FieldDefinitionModel({ id: 1, variableName: 'Test' }))).to.be.true;
  });
});
