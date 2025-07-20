import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { AirportHoursModel, AirportHoursSubTypeModel } from '../../Shared';
import { TabsLayout } from '@wings-shared/layout';
import { AirportHoursInformation } from '../Components';
import { AirportModel } from '@wings/shared';
import sinon from 'sinon';

describe('Airport Hours Information', () => {
  let wrapper: any;
  const props = {
    classes: {},
    airport: new AirportModel(),
    airportHours: [
      new AirportHoursModel({
        id: 1,
        scheduleSummary: 'Test',
        airportHoursSubType: new AirportHoursSubTypeModel({ name: 'New Hour' }),
      }),
    ],
    onTabChange: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<AirportHoursInformation {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should be rendered without errors if airportHours empty', () => {
    wrapper.setProps({ ...props, airportHours: [] });
    expect(wrapper).to.have.length(1);
  });

  it('should call onTabChange function', () => {
    wrapper
      .find(TabsLayout)
      .props()
      .onTabChange('Summary Information');
  });
});
