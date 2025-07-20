import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import { AirportLogisticsStore } from '../../../Shared/Stores';
import { DepartureLogisticsCrewPax } from '../DepartureLogisticsCrewPax';

describe('DepartureLogisticsCrewPax Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <Provider airportLogisticsStore={new AirportLogisticsStore()}>
        <DepartureLogisticsCrewPax />
      </Provider>
      )
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
