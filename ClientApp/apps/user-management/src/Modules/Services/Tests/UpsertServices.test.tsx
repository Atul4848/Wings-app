import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { VIEW_MODE } from '@wings/shared';
import { ServicesStoreMock } from '../../Shared';
import { expect } from 'chai';
import sinon from 'sinon';
import { PureUpsertServices } from '../Components/UpsertServices/UpsertServices';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Upsert Services', () => {
  let wrapper: ShallowWrapper;
  let instance;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    serviceStore: new ServicesStoreMock(),
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: '' },
    navigate: sinon.fake(),
  }

  beforeEach(() => {
    wrapper = shallow(<PureUpsertServices {...props} />).dive();
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
    const navigateToServicesSpy = sinon.spy(instance, 'navigateToServices');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateToServicesSpy.called).to.be.true;
  });

  it('save button should update/create Services filter', () => {
    const upsertServiceSpy = sinon.spy(instance, 'upsertService');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertServiceSpy.called).to.be.true;
  });

});