import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MemoryRouter } from 'react-router';
import { ConfirmDialog, ConfirmNavigate } from '@wings-shared/layout';

describe('Confirm Navigate Component', function () {
    let wrapper: ReactWrapper;
    const props = {
        isBlocker: true,
    };

    beforeEach(() => {
        wrapper = mount(
            <MemoryRouter>
                <ConfirmNavigate {...props}>
                    <div>Test</div>
                </ConfirmNavigate>
            </MemoryRouter>
        );
    });

    it('should be rendered without errors', function () {
        expect(wrapper).to.be.ok;
    });

    it('should render Confirm Dialog', () => {
        expect(wrapper.find(ConfirmDialog)).to.be.ok;
    })
});
