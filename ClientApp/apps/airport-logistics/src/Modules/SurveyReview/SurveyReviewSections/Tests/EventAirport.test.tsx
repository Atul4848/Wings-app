import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { AirportLogisticsStore } from '../../../Shared/Stores';
import { EventAirport } from '../EventAndPertinent';
import { AirportEventsModel } from '../../../Shared/Models';

describe('EventAirport Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <Provider airportLogisticsStore={new AirportLogisticsStore()}>
        <EventAirport airport={new AirportEventsModel()}/>
      </Provider>
      )
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
