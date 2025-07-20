import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { EventStoreMock, EventTypeStoreMock } from '../../Shared';
import { PureOneTimeEvent } from '../Components/OneTimeEvent/OneTimeEvent';
import { DetailsEditorWrapper, EditSaveButtons } from '@wings-shared/layout';
import { ViewInputControl } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('One Time Event', () => {
    let wrapper: ShallowWrapper;
    let instance: any;
    let headerActions: ShallowWrapper;

    const eventStore = new EventStoreMock();
    const eventTypeStore = new EventTypeStoreMock();

    const props = {
        classes: {},
        eventStore: eventStore,
        eventTypeStore: eventTypeStore,
        viewMode: VIEW_MODE.NEW,
        params: { id: 5 },
        navigate: sinon.fake(),
    };

    beforeEach(() => {
        wrapper = shallow(<PureOneTimeEvent {...props} />).dive();
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
        wrapper.find(ViewInputControl).at(0).simulate('valueChange', 'test', 'eventType');
        expect(valueChangeSpy.calledWith('test', 'eventType')).to.be.true;
    });

    it('cancel button should cancel the made changes', () => {
        const navigateToEventsSpy = sinon.spy(instance, 'navigateToEvents');
        headerActions.find(EditSaveButtons).simulate('action', GRID_ACTIONS.CANCEL);
        expect(navigateToEventsSpy.called).to.be.true;
    });
});
