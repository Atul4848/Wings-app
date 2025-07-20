import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { of } from 'rxjs';
import { ViewInputControl, AuditFields } from '@wings-shared/form-controls';
import { CountryModel, EditDialog, IslandModel, StateModel, VIEW_MODE } from '@wings/shared';
import { SettingsTypeModel, GRID_ACTIONS } from '@wings-shared/core';
import { SettingsStoreMock, CountryStoreMock } from '../../Shared';
import UpsertIsland from '../UpsertIsland/UpsertIsland';
import { Field } from 'mobx-react-form';

describe('UpsertIsland Module', () => {
  let wrapper: ShallowWrapper;
  const onUpsertIsland = sinon.spy((updatedIslandModel: IslandModel) => of(null));
  let viewMode: VIEW_MODE.EDIT;
  let dialogContent: ShallowWrapper;

  const islandModel = new IslandModel({
    id: 1,
    country: new CountryModel({ id: 5 }),
    state: new StateModel({ id: 4 }),
    name: 'TEST',
    statusId: 1,
    accessLevelId: 1,
  });

  const props = {
    viewMode,
    onUpsertIsland,
    islandModel,
    classes: {},
    params: { countryId: '10', stateId: '1' },
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(function() {
    wrapper = shallow(<UpsertIsland {...props} />).dive();
    dialogContent = shallow(<div>{wrapper.find(EditDialog).prop('tabContent')()}</div>);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);

    //render ViewInputControl
    expect(dialogContent.find(ViewInputControl)).to.have.length(6);
  });

  it('should get proper field with AuditFields', () => {
    const field: Field = dialogContent.find(AuditFields).prop('onGetField')('createdBy');
    expect(field.label).to.eq('Created By');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(EditDialog).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
    // Check if the correct functions were called
    expect(onUpsertIsland.calledOnce).to.be.true;
  });

});
