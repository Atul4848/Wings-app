import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AircraftVariationStoreMock } from '../../Shared';
import sinon from 'sinon';
import { VariationSearchDialog } from '../Components';

describe('VariationSearchDialog Module', () => {
  let wrapper: ShallowWrapper;

  const props = {
    aircraftVariationStore: new AircraftVariationStoreMock(),
    onSelect: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<VariationSearchDialog {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
