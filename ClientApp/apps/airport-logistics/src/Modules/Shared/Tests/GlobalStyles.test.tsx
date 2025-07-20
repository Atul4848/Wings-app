import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import GlobalStyles from '../Components/GlobalStyles/GlobalStyles.component';

describe('GlobalStyles component', function () {
  let wrapper: ShallowWrapper;

  beforeEach(function () {
    wrapper = shallow(<GlobalStyles />);
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
