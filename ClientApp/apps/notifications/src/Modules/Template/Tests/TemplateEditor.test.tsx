import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { ChannelStoreMock, EventTypeStoreMock, TemplateStoreMock } from '../../Shared';
import { PureTemplateEditor } from '../Components/TemplateEditor/TemplateEditor';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { ViewInputControl } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Template Editor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;

  const channelStore = new ChannelStoreMock();
  const eventTypeStore = new EventTypeStoreMock();
  const templateStore = new TemplateStoreMock();

  const props = {
    classes: {},
    channelStore,
    eventTypeStore,
    templateStore,
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: 1 },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureTemplateEditor {...props} />).dive();
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

  it('save button should save the record', () => {
    const getUpsertModelSpy = sinon.spy(instance, 'getUpsertTemplate');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(getUpsertModelSpy.called).to.be.true;
  });

  it('should work with value change', () => {
    const valueChangeSpy = sinon.spy(instance, 'onValueChange');
    wrapper.find(ViewInputControl).at(0).simulate('valueChange', 'template3', 'name');
    expect(valueChangeSpy.calledWith('template3', 'name')).to.be.true;
  });

  it('cancel button should cancel the made changes', () => {
    const navigateToTemplatesSpy = sinon.spy(instance, 'navigateToTemplates');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateToTemplatesSpy.called).to.be.true;
  });
});
