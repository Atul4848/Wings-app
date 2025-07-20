import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SettingsType, UpsertSettings } from '../Components';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { createMuiTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { of } from 'rxjs';
import { Loader, SettingsTypeModel } from '@wings-shared/core';

describe('Upsert Settings Module', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const theme = createMuiTheme(LightTheme);

  const props = {
    classes: {},
    getSettings: sinon.fake.returns(of([new SettingsTypeModel()])),
    upsertSettings: sinon.fake.returns(of(new SettingsTypeModel())),
    settingsData: [new SettingsTypeModel()],
    loader: new Loader(false, { type: PROGRESS_TYPES.CIRCLE }),
    theme,
    type: '',
  };

  beforeEach(() => {
    wrapper = shallow(<UpsertSettings {...props} />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('Grid action SAVE should call API and update row if data is valid', () => {
    const fakeData = new SettingsTypeModel({ id: 0 });
    wrapper.find(SettingsType).simulate('upsert', 1, fakeData);
    expect(props.upsertSettings.calledOnceWith(fakeData)).to.be.true;
  });
});
