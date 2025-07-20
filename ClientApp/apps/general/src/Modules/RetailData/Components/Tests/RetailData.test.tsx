import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { expect } from "chai";
import { PureRetailData } from '../../RetailData';
import { RetailDataModel, RetailDataStoreMock } from '../../../Shared';

describe('RetailData', () => {
    let wrapper: ShallowWrapper;
    let instance;

    const props = {
        classes: {},
        retailDataStore: new RetailDataStoreMock(),
    }

    beforeEach(() => {
        wrapper = shallow(<PureRetailData {...props} />).dive();
        instance = wrapper.instance();
        instance.gridApi = new GridApiMock({ data: new RetailDataModel() });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });

});