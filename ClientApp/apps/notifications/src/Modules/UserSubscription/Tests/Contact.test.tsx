import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { ChannelStoreMock, ContactStoreMock, UserSubscriptionStoreMock } from '../../Shared';
import Contact from '../Components/Contact/Contact';


describe(' Contact Module', () => {
    let wrapper: ShallowWrapper;
    let instance: any;

    const props = {
        classes: {},
        subscriptionStore: new UserSubscriptionStoreMock(),
        contactStore: new ContactStoreMock(),
        channelStore: new ChannelStoreMock(),
    };

    const renderView = props => {
        props.subscriptionStore.setDefaultValue();
        wrapper = shallow(<Contact {...props} />).dive().shallow();
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
