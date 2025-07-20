import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'mobx-react';
import { CountryStoreMock, OperationalRequirementStoreMock, SettingsStoreMock } from '../../Shared';
import { BaseAircraftStoreMock, BasePermitStoreMock } from '@wings/shared';
import FlightPlanning from '../Components/OperationalRequirements/FlightPlanning/FlightPlanning';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import FlightPlanningACASGrid from '../Components/OperationalRequirements/FlightPlanning/FlightPlanningACASGrid';

describe('FlightPlanning', () => {
  let wrapper: any;
  let instance: any;

  const props = {
    useUpsert: {
      form: {
        values: sinon.stub().returns({
          acasiIdataIsRqrd: true,
          acasiiAdditionalInformations: [],
        }),
      },
      getField: () => 'Test',
      setFormFields: sinon.spy(),
      setFormValues: sinon.spy(),
      observeSearch: sinon.spy(),
      onValueChange: sinon.spy(),
    },
    operationalRequirementStore: new OperationalRequirementStoreMock(),
    basePermitStore: new BasePermitStoreMock(),
    countryStore: new CountryStoreMock(),
    baseAircraftStore: new BaseAircraftStoreMock(),
    settingsStore: new SettingsStoreMock(),
    classes: {},
    onValueChange: sinon.spy(),
    entityMapStore: {
      loadEntities: sinon.spy(),
      documents: [],
      item18Contents: [],
      aircraftEquipments: [],
    },
    onRowEditingChange: sinon.spy(),
    onFlightPlanningUpdate: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = mount(
      <Provider
        operationalRequirementStore={props.operationalRequirementStore}
        settingsStore={props.settingsStore}
        basePermitStore={props.basePermitStore}
      >
        <FlightPlanning {...props} />
      </Provider>
    );
    instance = wrapper.instance();
  });

  it('should be rendered without errors', () => {
    expect(wrapper.exists()).to.be.ok;
  });

  it('should call onFocus function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup).props();
    viewInputControlsGroup.onFocus('rvsmComplianceExceptions');
    viewInputControlsGroup.onFocus('acasiiOrTCAS');
    viewInputControlsGroup.onFocus('bannedAircrafts');
    viewInputControlsGroup.onFocus('noiseRestrictedAircrafts');
    viewInputControlsGroup.onFocus('documentsRequiredforFilings');
    expect(props.useUpsert.observeSearch.callCount).to.equal(5);
    expect(props.entityMapStore.loadEntities.callCount).to.equal(1);
  });

  it('should handle value changes with onValueChange function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);

    const fieldsToTest = [
      'acasiiOrTCAS',
      'rvsmComplianceExceptions',
      'bannedAircrafts',
      'noiseRestrictedAircrafts',
      'documentsRequiredforFilings',
      'appliedItem18Contents',
      'appliedRequiredAircraftEquipments',
      'acasiiAdditionalInformations',
    ];

    fieldsToTest.forEach(fieldKey => viewInputControlsGroup.props().onValueChange([], fieldKey));
    fieldsToTest.forEach(fieldKey => expect(props.useUpsert.onValueChange.calledWith([], fieldKey)).to.be.true);
    expect(props.useUpsert.onValueChange.callCount).to.equal(fieldsToTest.length);
  });

  it('should change the values with onChange function', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);

    const fieldsToTest = [
      'acasiiOrTCAS',
      'rvsmComplianceExceptions',
      'bannedAircrafts',
      'noiseRestrictedAircrafts',
      'documentsRequiredforFilings',
      'appliedItem18Contents',
      'appliedRequiredAircraftEquipments',
      'acasiiAdditionalInformations',
    ];

    fieldsToTest.forEach(fieldKey => viewInputControlsGroup.props().onValueChange([], fieldKey));

    // Check how many times onValueChange was called
    expect(props.useUpsert.onValueChange.callCount).to.be.at.least(fieldsToTest.length);

    // Test changing other fields
    const otherFields = [
      'isCabotageEnforced',
      'tcasRqrdFL',
      'rvsmSeparationMin',
      'rvsmLowerFL',
      'rvsmUpperFL',
      'rvsmItem10',
      'is833KHzChnlSpaceRqrd',
      'adsbRqrdAboveFL',
      'acasiIdataIsRqrd',
    ];

    otherFields.forEach(fieldKey => viewInputControlsGroup.props().onValueChange(true, fieldKey));

    // Ensure the total count matches
    expect(props.useUpsert.onValueChange.callCount).to.be.at.least(fieldsToTest.length + otherFields.length);
  });

  it('should update row editing state correctly', () => {
    const flightPlanningACASGrid = wrapper.find(FlightPlanningACASGrid);
    flightPlanningACASGrid.props().onRowEditingChange(true);
    flightPlanningACASGrid.props().onRowEditingChange(false);

    expect(props.onRowEditingChange.callCount).to.equal(2);
  });

  it('should update ACAS II info correctly', () => {
    const flightPlanningACASGrid = wrapper.find(FlightPlanningACASGrid);
    flightPlanningACASGrid.props().onDataSave(['acasInfo1', 'acasInfo2']);

    expect(props.onFlightPlanningUpdate.calledOnce).to.be.true;
  });
});
