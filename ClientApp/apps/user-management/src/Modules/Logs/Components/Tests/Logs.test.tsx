import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { LogModel, LogStoreMock } from "../../../Shared";
import { expect } from "chai";
import { PureLogs } from '../../Logs';

describe('Logs', () => {
    let wrapper: ShallowWrapper;
    let instance;

    const props = {
        classes: {},
        logStore: new LogStoreMock(),
    }

    beforeEach(() => {
        wrapper = shallow(<PureLogs {...props} />).dive();
        instance = wrapper.instance();
        instance.gridApi = new GridApiMock({ data: new LogModel() });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });

});