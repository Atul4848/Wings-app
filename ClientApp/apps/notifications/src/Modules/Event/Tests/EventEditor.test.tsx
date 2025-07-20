import React from 'react';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { EventStoreMock, EventTypeModel, EventTypeStoreMock, TemplateStoreMock } from '../../Shared';
import { VIEW_MODE } from '../../../../../shared';
import { PureEventEditor } from '../Components/EventEditor/EventEditor';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { EventAttributeInputControl } from '../Components';
import { DetailsEditorWrapper, EditSaveButtons, ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Event Editor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;

  const props = {
    classes: {},
    eventStore: new EventStoreMock(),
    eventTypeStore: new EventTypeStoreMock(),
    templateStore: new TemplateStoreMock(),
    viewMode: VIEW_MODE.EDIT,
    params: { id: 1 },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureEventEditor {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should work with EditSaveButtons', () => {
    const headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);

    // For Cancel
    const navigateSpy = sinon.spy(instance, 'navigateToEvents');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateSpy.called).to.be.true;

    // For Upsert
    const upsertEventTypeSpy = sinon.spy(instance, 'upsertEvent');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertEventTypeSpy.called).to.be.true;
  });

  it('should show confirmation dialog on change of event type', () => {
    const setAttributesDefinitionsSpy = sinon.spy(instance, 'setAttributesDefinitions');
    const value = new EventTypeModel({ id: 1, name: 'Test' });
    instance.getField('eventType').set(value);
    instance.onValueChange(value, 'eventType');
    const modalData = shallow(<div>{ModalStore.data}</div>);
    modalData.find(ConfirmDialog).simulate('yesClick');
    expect(setAttributesDefinitionsSpy.called).to.be.true;
  });

  it('should update attributes values', () => {
    wrapper.find(EventAttributeInputControl).simulate('valueUpdate', true, 'test');
    expect(instance.attributes).to.have.length(3);
  });
});
