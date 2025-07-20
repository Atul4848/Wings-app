import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { UserModel, UserStoreMock } from "../../../Shared";
import { expect } from "chai";
import { PureUsers } from '../../Users';

describe('Users', () => {
    let wrapper: ShallowWrapper;
    let instance;

    const props = {
        classes: {},
        usersStore: new UserStoreMock(),
    }

    beforeEach(() => {
        wrapper = shallow(<PureUsers {...props} userStore={new UserStoreMock()} />).dive();
        instance = wrapper.instance();
        instance.gridApi = new GridApiMock({ data: new UserModel() });
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('should be rendered without errors', () => {
        expect(wrapper).to.have.length(1);
    });

});