import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { CiqAirportModel, CiqCrewPaxDataModel, SurveyReviewStatusModel } from '../../../../Shared/Models';
import { CiqAirport } from '../CiqAirport';
import { AirportLogisticsStoreMock } from '../../../../Shared/Mocks';
import { SurveyReviewSection } from '../../SurveyReviewSection';

describe('CiqAirport Component', function () {
  let wrapper: ReactWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();
  let ciqAirport: CiqAirportModel;

  beforeEach(function () {
    ciqAirport = new CiqAirportModel();
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore}>
        <CiqAirport airport={ciqAirport} />
      </Provider>
    );
  });

  it('should be rendered without errors', function () {
    expect(wrapper).to.have.length(1);
  });

  it('updateHandler updates airportLogisticsStore.ciq.ciqCrewPax.airport.unApproved with CiqCrewPaxDataModel',
    function () {
      const status = new SurveyReviewStatusModel({
        key: 'genDecRequired',
      });

      airportLogisticsStore.ciq.ciqCrewPax.airport.unApproved = new CiqCrewPaxDataModel({
        subComponentId: 111,
        crewPaxCustomsClearanceNoticeHours: 20,
        genDecRequired: 'Test',
      });

      wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
      expect(airportLogisticsStore.ciq.ciqCrewPax.airport.unApproved).to.eql(
        new CiqCrewPaxDataModel({
          genDecRequired: '',
        })
      );
    });

  it('updateHandler sets airportLogisticsStore.hasAccessedAirport to true is at least one flag is true', function() {
    const flags = { isApproved: true, isIgnored: false };
    const keys: string[] = [
      'genDecRequired',
      'specificGenDecTypeRequired',
      'genDecAdditionalProcedures',
      'genDecFilePath',
      'genDecAssistanceRequired',
      'crewPaxOnBoardCustomsClearance',
      'advanceNoticePair',
      'airportFacilities',
      'mainTerminal',
      'ciqMainTerminal',
      'vipAreaTerminal',
      'generalAviationTerminal',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));
    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedAirport).to.equal(true);
  });

  it('updateHandler sets airportLogisticsStore.hasAccessedAirport to false if any status missed', function() {
    const flags = { isApproved: true, isIgnored: false };
    const keys: string[] = [
      'genDecRequired',
      'specificGenDecTypeRequired',
      'genDecAdditionalProcedures',
      'genDecFilePath',
      'genDecAssistanceRequired',
      'crewPaxOnBoardCustomsClearance',
      'advanceNoticePair',
      'airportFacilities',
      'mainTerminal',
      'ciqMainTerminal',
      'vipAreaTerminal',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));
    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedAirport).to.equal(false);
  });
});
