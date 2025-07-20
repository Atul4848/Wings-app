import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { VIEW_MODE } from '@wings/shared';
import { UvgoSettingStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { PureUvgoSettingEditor } from '../Components/UpsertUvgoSetting/UvgoSettingEditor';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('UVGOSettings Editor', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    uvgoSettingsStore: new UvgoSettingStoreMock(),
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: '' },
    navigate: sinon.fake(),
  }

  beforeEach(() => {
    wrapper = shallow(<PureUvgoSettingEditor {...props} />).dive();
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

  it('cancel button should cancel the made changes', () => {
    const navigateToUvgoSettingsSpy = sinon.spy(instance, 'navigateToUvgoSettings');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateToUvgoSettingsSpy.called).to.be.true;
  });

  it('save button should update/create UvgoSettings filter', () => {
    const upsertUvgoSettingsSpy = sinon.spy(instance, 'upsertUvgoSettings');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertUvgoSettingsSpy.called).to.be.true;
  });

});