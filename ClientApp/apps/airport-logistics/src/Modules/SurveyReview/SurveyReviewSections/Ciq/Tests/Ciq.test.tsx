import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { Provider } from 'mobx-react';
import Ciq from '../Ciq';
import { AirportLogisticsStore } from '../../../../Shared/Stores';

describe('Ciq Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <Provider airportLogisticsStore={new AirportLogisticsStore()}>
        <Ciq />
      </Provider>
      )
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
})
