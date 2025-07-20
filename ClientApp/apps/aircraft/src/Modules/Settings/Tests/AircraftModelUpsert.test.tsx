import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SettingsStoreMock, AircraftModel } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { AircraftModelUpsert } from '../Components/AircraftModels/Components';

describe('AircraftModelUpsert module', () => {
  let wrapper: ShallowWrapper;
  let dialogContent: ShallowWrapper;
  let dialogActions: ShallowWrapper;

  const props = {
    classes: {},
    settingsStore: new SettingsStoreMock(),
    model: new AircraftModel(),
    onUpsert: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<AircraftModelUpsert {...props} />);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    dialogActions = shallow(<div>{wrapper.find(Dialog).prop('dialogActions')()}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
  });
});
