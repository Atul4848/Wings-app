import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { ArrivalLogisticsDataModel, ArrivalLogisticsModel, SurveyReviewStatusModel } from '../../../Shared/Models';
import { ArrivalLogisticsHandler } from '../ArrivalLogisticsCrewPax';
import { AirportLogisticsStoreMock } from '../../../Shared/Mocks';
import { SurveyReviewSection } from '../SurveyReviewSection';

describe('ArrivalLogisticsHandler Component', function () {
  let wrapper: ReactWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(function () {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore}>
        <ArrivalLogisticsHandler handler={new ArrivalLogisticsModel()} />
      </Provider>
    );
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('updateHandler sets unApproved with ArrivalLogisticsDataModel', function () {
    const status = new SurveyReviewStatusModel({
      key: 'arrivalExpectedProcedures',
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.arrivalLogistics.unApproved).to.eql(new ArrivalLogisticsDataModel());
  });

  it('updateHandler sets hasAccessedHandler false if one of flags is false', function () {
    const status = new SurveyReviewStatusModel({
      key: 'arrivalExpectedProcedures',
      isApproved: true,
      isIgnored: true,
    });
    wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
    expect(airportLogisticsStore.hasAccessedHandler).to.equal(false);
  });

  it('updateHandler sets hasAccessedHandler true if one of flags is true', function () {
    const flags = { isApproved: true, isIgnored: false };
    const keys = [
      'arrivalExpectedProcedures',
      'rampSideShuttleAvailable',
      'walkDistance',
      'disabilitiesAccomomodationAvailability',
      'arrivalCrewPassengerPassportHandling',
      'arrivalLuggageHandling',
      'arrivalMeetingPoint',
      'arrivalAddress',
      'additionalInstructionsForGate',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));

    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedHandler).to.equal(true);
  });
});
