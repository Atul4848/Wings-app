import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { of } from 'rxjs';
import { EditDialog, StateModel, VIEW_MODE } from '@wings/shared';
import { SettingsStoreMock, CountryStoreMock } from '../../Shared';
import { Field } from 'mobx-react-form';
import { AuditFields, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';
import UpsertState from '../UpsertState/UpsertState';

describe('UpsertState Module', () => {
  let wrapper: ShallowWrapper;
  const onUpsertState = sinon.spy(() => of(new StateModel()));
  let dialogContent: ShallowWrapper;
  let viewMode = VIEW_MODE.EDIT;
  const props = {
    viewMode,
    countryId: 1,
    onUpsertState,
    stateModel: new StateModel(),
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
  };

  beforeEach(function() {
    wrapper = shallow(<UpsertState {...props} />).dive();
    dialogContent = shallow(<div>{wrapper.find(EditDialog).prop('tabContent')(0)}</div>);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);

    //render ViewInputControlsGroup
    expect(dialogContent.find(ViewInputControlsGroup)).to.have.length(1);
  });

  it('should get proper field with AuditFields', () => {
    const field: Field = dialogContent.find(AuditFields).prop('onGetField')('createdBy');
    expect(field.label).to.eq('Created By');
  });

  it('should handle different actions correctly', () => {
    const onAction = wrapper.find(EditDialog).prop('onAction');
    // Simulate different actions
    onAction(GRID_ACTIONS.EDIT);
    expect(
      wrapper
        .find(EditDialog)
        .prop('tabs')
        .at(0)
    ).equal('State Details');
    onAction(GRID_ACTIONS.SAVE);
    onAction(GRID_ACTIONS.CANCEL);
    // Check if the correct functions were called
    expect(onUpsertState.calledOnce).to.be.true;
  });

  it('should get proper field with ViewInputControlsGroup', () => {
    const field: Field = dialogContent.find(ViewInputControlsGroup).prop('field')('country');
    expect(field.label).to.eq('Country*');
  });

  it('should call onValueChange function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = dialogContent.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onValueChange(true, 'syncToCAPPS');
    viewInputControlsGroup.onValueChange(null, 'isoCode');
    viewInputControlsGroup.onValueChange('PB', 'isoCode');
    viewInputControlsGroup.onValueChange(null, 'code');
    viewInputControlsGroup.onValueChange('PB', 'code');
    viewInputControlsGroup.onValueChange(null, 'country');
    viewInputControlsGroup.onValueChange('PB', 'country');
  });

  it('should call onSearch function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = dialogContent.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onSearch(null, 'isoCode');
    viewInputControlsGroup.onSearch(null, 'country');
    viewInputControlsGroup.onSearch('ab', 'country');
  });

  it('should call onFocus function with ViewInputControlsGroup', () => {
    const viewInputControlsGroup = dialogContent.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onFocus('stateType');
    viewInputControlsGroup.onFocus('accessLevel');
    viewInputControlsGroup.onFocus('sourceType');
  });
});
