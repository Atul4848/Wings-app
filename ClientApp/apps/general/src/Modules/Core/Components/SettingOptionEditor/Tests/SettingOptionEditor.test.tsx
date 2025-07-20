import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { CacheControlStoreMock } from '../../../../Shared/Mocks';
import SettingOptionEditor from '../SettingOptionEditor';
import { GridApiMock, IGridApi } from '@wings/shared';
import { SettingsModel } from '../../../..';
import Sinon from 'sinon';

describe('Cache Settings Component', function () {
    let wrapper: ShallowWrapper;
    let instance;
    let gridApi: IGridApi;
    const props = {
        setting: new SettingsModel(),
        classes: {},
        cacheControlStore: new CacheControlStoreMock(),
        onUpdate: Sinon.fake()
    };

    beforeEach(function () {
        gridApi = new GridApiMock({ data: null });
        wrapper = shallow(<SettingOptionEditor {...props} />).dive();
        instance = wrapper.instance();
    });
});
