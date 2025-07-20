import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import {
  CiqHandlerDataModel,
  CiqHandlerModel,
  HandlerHoursModel,
  SurveyReviewStatusModel,
} from '../../../../Shared/Models';
import { CiqHandler } from '../CiqHandler';
import { AirportLogisticsStoreMock } from '../../../../Shared/Mocks';
import { SurveyReviewSection } from '../../SurveyReviewSection';

describe('CiqHandler Component', function() {
  let wrapper: ReactWrapper;
  const airportLogisticsStore = new AirportLogisticsStoreMock();

  beforeEach(function() {
    wrapper = mount(
      <Provider airportLogisticsStore={airportLogisticsStore}>
        <CiqHandler handler={new CiqHandlerModel()} />
      </Provider>
    );
  })

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('updateHandler updates airportLogisticsStore.ciq.ciqCrewPax.handler.unApproved with CiqHandlerDataModel',
    function() {
      const status = new SurveyReviewStatusModel({
        key: 'privateFBOOperatingHours',
      });

      wrapper.find(SurveyReviewSection).at(0).props().updateHandler(status);
      const result = new CiqHandlerDataModel({
        privateFBOOperatingHours: new HandlerHoursModel({ subComponentId: '' }),
      })
      expect(airportLogisticsStore.ciq.ciqCrewPax.handler.unApproved).to.eql(result);
    });

  it('updateHandler sets hasAccessedHandler to True if at least one flag is true', function() {
    const flags = { isApproved: true, isIgnored: false };
    const keys: string[] = [
      'privateFBOOperatingHours',
      'ciqHoursForGATOrFBO',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));

    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedHandler).to.equal(true);
  });

  it('updateHandler sets hasAccessedHandler to False if at least one status missed', function() {
    const flags = { isApproved: true, isIgnored: true };
    const keys: string[] = [
      'privateFBOOperatingHours',
    ];

    const statuses = keys.map(key => new SurveyReviewStatusModel({ key, ...flags }));

    statuses.forEach((status: SurveyReviewStatusModel, index: number) => {
      wrapper.find(SurveyReviewSection).at(index).props().updateHandler(status);
    });

    expect(airportLogisticsStore.hasAccessedHandler).to.equal(false);
  });
})
