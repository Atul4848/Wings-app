import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import UserWarning from '../Components/UserWarning/UserWarning';

describe(' User warning Module', () => {
    let wrapper: ShallowWrapper;
    let instance: any;

    const props = {
        classes: {},
        message: 'string',
        severity: 'error',
        userSubScriptionRoute: 'string',
    };

    const renderView = props => {
        wrapper = shallow(<UserWarning {...props} />).dive();
        instance = wrapper.instance();
    };

    beforeEach(() => renderView(props));

    afterEach(() => {
        wrapper.unmount();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.be.ok;
    });
    
});
