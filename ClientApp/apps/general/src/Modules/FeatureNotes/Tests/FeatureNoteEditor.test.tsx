import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { FeatureNoteStoreMock } from '../../Shared';
import { PureFeatureNoteEditor } from '../Components/FeatureNoteEditor/FeatureNoteEditor';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Feature Note Editor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;
  const featureNoteStore = new FeatureNoteStoreMock();

  const props = {
    classes: {},
    featureNoteStore,
    viewMode: VIEW_MODE.EDIT,
    params: { mode: VIEW_MODE.EDIT, id: "62273d6dfb6255e36a491cb0" },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureFeatureNoteEditor {...props} />).dive();
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
    const updateFeatureNoteSpy = sinon.spy(instance, 'updateFeatureNote');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(updateFeatureNoteSpy.called).to.be.true;
  });

  it('cancel button should cancel the made changes', () => {
    const navigateToFeatureNotesSpy = sinon.spy(instance, 'navigateToFeatureNotes');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateToFeatureNotesSpy.called).to.be.true;
  });
});
