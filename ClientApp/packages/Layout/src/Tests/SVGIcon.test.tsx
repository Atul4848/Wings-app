import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { SVGIcon } from '../Components';


describe('SVGIcon component', () => {
    let wrapper: ReactWrapper;
    beforeEach(() => {
        wrapper = mount(<SVGIcon name="test" />);
    });
    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });
    it('should render correct path', () => {
        const path: string = `${[window.location.protocol, window.location.host].join('//')}/icons-sprite.svg#icon-test`;
        expect(wrapper.find('use').prop('xlinkHref')).to.eq(path);
    });
});
