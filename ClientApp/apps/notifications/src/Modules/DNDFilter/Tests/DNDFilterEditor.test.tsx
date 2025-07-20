import { VIEW_MODE } from '@wings/shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import {
  DNDFilterStoreMock,
  EventTypeStoreMock,
  DayOfWeekModel,
  DeliveryTypeModel,
  EventTypeModel,
} from '../../Shared';
import * as sinon from 'sinon';
import { PureDNDFilterEditor } from '../Components/DNDFilterEditor/DNDFilterEditor';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('DND Filter Editor', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let headerActions: ShallowWrapper;

  const dndFilterStore = new DNDFilterStoreMock();
  const eventTypeStore = new EventTypeStoreMock();

  const props = {
    classes: {},
    dndFilterStore,
    eventTypeStore,
    viewMode: VIEW_MODE.NEW,
    params: { mode: VIEW_MODE.NEW, id: 1 },
    navigate: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<PureDNDFilterEditor {...props} />).dive();
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

  it('should work with value change', () => {
    const valueChangeSpy = sinon.spy(instance, 'onValueChange');
    const setEventTypesRulesSpy = sinon.spy(instance, 'setEventTypesRules');
    const setDeliveryTypeRulesSpy = sinon.spy(instance, 'setDeliveryTypeRules');
    wrapper.find(ViewInputControl).at(1).simulate('valueChange', '06:00', 'startTime');
    expect(valueChangeSpy.calledWith('06:00', 'startTime')).to.be.true;

    // event types
    wrapper.find(ViewInputControl).at(4).simulate('valueChange', [new EventTypeModel()], 'eventTypes');
    expect(setEventTypesRulesSpy.called).to.be.true;

    //delivery types
    wrapper.find(ViewInputControl).at(5).simulate('valueChange', [new DeliveryTypeModel()], 'deliveryTypes');
    expect(setDeliveryTypeRulesSpy.called).to.be.true;
  });

  it('cancel button should cancel the made changes', () => {
    const navigateToDNDFiltersSpy = sinon.spy(instance, 'navigateToDNDFilters');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
    expect(navigateToDNDFiltersSpy.called).to.be.true;
  });

  it('should work with daysOfWeek', () => {
    const getFieldSpy = sinon.spy(instance, 'getField');
    instance.onValueChange([new DayOfWeekModel()], 'daysOfWeek');
    expect(getFieldSpy.calledWith('daysOfWeek')).to.be.true;
  });

  it('should render viewRenderer method', () => {
    const viewRendererSpy = sinon.spy(instance, 'viewRenderer');
    wrapper.find(ViewInputControl).at(5).prop('renderTags')([new DayOfWeekModel()], sinon.fake());
    expect(viewRendererSpy.called).to.be.true;
  });

  it('should render getOptionDisabled method', () => {
    const getOptionDisabled = sinon.spy(instance, 'getOptionDisabled');
    wrapper.find(ViewInputControl).at(5).prop('getOptionDisabled')(new DayOfWeekModel(), [new DayOfWeekModel()]);
    expect(getOptionDisabled.calledWith(new DayOfWeekModel(), [new DayOfWeekModel()])).to.be.true;
  });

  it('should work with onSearch', () => {
    const loadUsersSpy = sinon.spy(instance, 'loadUsers');
    wrapper.find(ViewInputControl).at(4).simulate('search', 'test1', 'oktaUser');
    expect(loadUsersSpy.calledWith('test1')).to.be.true;
  });

  it('save button should update/create dnd filter', () => {
    const upsertDNDFilterSpy = sinon.spy(instance, 'upsertDNDFilter');
    headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.SAVE);
    expect(upsertDNDFilterSpy.called).to.be.true;
  });
});
