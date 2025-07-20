import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import HandlebarFields from '../Components/HandlebarFields/HandlebarFields';

describe('Handlebar Fields Module', () => {
    let wrapper: ShallowWrapper;
    const props = {
        classes: {},
        fields: ['startDate']
    };

    beforeEach(() => {
        wrapper = shallow(<HandlebarFields {...props} />).dive();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });
});
