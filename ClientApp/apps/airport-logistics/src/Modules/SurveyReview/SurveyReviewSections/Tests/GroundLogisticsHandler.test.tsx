import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { AirportLogisticsStore, StepperStore } from './../../../Shared/Stores';
import { GroundLogisticsHandler } from '../GroundLogisticsAndParking';
import {
  AircraftLogisticsParkingHandlerModel,
  AircraftLogisticsParkingHandlerDataModel,
  SurveyReviewStatusModel,
} from '../../../Shared/Models';
import { SurveyReviewSection } from '../SurveyReviewSection';

describe('GroundLogisticsHandler Component', function() {
  let wrapper: ReactWrapper;
  const airportLogisticsStore = new AirportLogisticsStore();

  beforeEach(function() {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <GroundLogisticsHandler
          handler={new AircraftLogisticsParkingHandlerModel()}
        />
      </Provider>
    );
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render 7 SurveyReviewSection components without errors', function() {
    expect(wrapper.find(SurveyReviewSection)).to.have.length(7);
  });

  it('updateHandler sets unApproved with AircraftLogisticsParkingHandlerDataModel', function() {
    const status = new SurveyReviewStatusModel({
      key: 'aircraftParkingLocation',
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.surveyDetail.aircraftLogisticsParking.handler.unApproved)
      .to.eql(new AircraftLogisticsParkingHandlerDataModel());
  });

  it('updateHandler sets hasAccessedHandler false if one of flags is false', function() {
    const status = new SurveyReviewStatusModel({
      key: 'aircraftParkingLocation',
      isApproved: true,
      isIgnored: true,
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.hasAccessedHandler).to.equal(false);
  });

  it('updateHandler sets hasAccessedHandler true if one of flags is true', function() {
    const flags = { isApproved: true, isIgnored: false };
    const keys = [
      'aircraftParkingLocation',
      'aircraftLogisFile',
      'aircraftSpotAccommodation',
      'towbarRequired',
      'towbarRequirementScenarios',
      'aircraftTowbarRequirements',
      'airportEquipments',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));

    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedHandler).to.equal(true);
  });
})
