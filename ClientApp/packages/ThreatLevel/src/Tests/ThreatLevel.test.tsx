import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { THREAT_LEVEL } from '../Enums';
import ThreatLevel from '../ThreatLevel';

describe('ThreatLevel Component', () => {
  let wrapper: ShallowWrapper;

  const props = {
    levelValue: THREAT_LEVEL.ONE,
  };

  beforeEach(() => {
    wrapper = shallow(
      <ThreatLevel {...props}>
        <div>A</div>
      </ThreatLevel>
    );
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});
