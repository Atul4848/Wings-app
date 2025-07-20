import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { AirportLogisticsStore, StepperStore } from './../../../Shared/Stores';
import { GroundLogisticsAirport } from '../GroundLogisticsAndParking';
import {
  AircraftLogisticsParkingAirportModel,
  AircraftLogisticsParkingAirportDataModel,
  SurveyReviewStatusModel,
} from '../../../Shared/Models';
import { SurveyReviewSection } from '../SurveyReviewSection';

describe('GroundLogisticsAirport Component', function() {
  let wrapper: ReactWrapper;
  const airportLogisticsStore = new AirportLogisticsStore();

  beforeEach(function() {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <GroundLogisticsAirport
          airport={new AircraftLogisticsParkingAirportModel()}
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
  it('updateHandler sets unApproved with AircraftLogisticsParkingAirportDataModel', function() {
    const status = new SurveyReviewStatusModel({
      key: 'parkingDiffMonths',
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.surveyDetail.aircraftLogisticsParking.airport.unApproved)
      .to.eql(new AircraftLogisticsParkingAirportDataModel());
  });

  it('updateHandler sets hasAccessedAirport false if one of flags is false', function() {
    const status = new SurveyReviewStatusModel({
      key: 'parkingDiffMonths',
      isApproved: true,
      isIgnored: true,
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.hasAccessedAirport).to.equal(false);
  });

  it('updateHandler sets hasAccessedAirport true if one of flags is true', function() {
    const flags = { isApproved: true, isIgnored: false };
    const keys = [
      'parkingDiffMonths',
      'overnightParkingIssue',
      'parkingDurationPair',
      'nearbyParkingAirports',
      'typesOfAircraftOperating',
      'mtowPair',
      'aircraftRestrictions',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));

    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedAirport).to.equal(true);
  });
})
