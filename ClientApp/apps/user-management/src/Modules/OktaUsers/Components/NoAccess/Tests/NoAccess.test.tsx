import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import NoAccess from '../NoAccess';

describe('No Access Module', () => {
    const props = {
        classes: {},
        message: "Please use wings DEV to manage RDN users.",
    };
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<NoAccess {...props} />).dive();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });
});
