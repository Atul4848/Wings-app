import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { ExecutionEntry, DELIVERY_TYPE } from '../../Shared';
import { PreviewDialog } from '../../index';

describe('Preview Dialog', () => {
    let wrapper: ShallowWrapper;
    let instance;

    const props = {
        executionEntry: new ExecutionEntry({ deliveryType: DELIVERY_TYPE.EMAIL, deliveredContent: 'Test' }),
        classes: {},
    };

    beforeEach(() => {
        wrapper = shallow(<PreviewDialog {...props} />).dive();
        instance = wrapper.instance();
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.be.ok;
    });

});
