import React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { SidebarStore } from '@wings-shared/layout';
import { VIEW_MODE } from '@wings/shared';
import { FaaPropertyTableViewModel } from '../../Shared';
import Sinon from 'sinon';
import FAAGridActions from '../Components/FAAGridActions/FAAGridActions';

describe('FAA Grid Actions', () => {
  let wrapper: any;

  const props = {
    data:new  FaaPropertyTableViewModel(),
    onMerge: Sinon.spy(),
    onEdit: Sinon.spy(),
    disabled: false,
    hideMergeButton: false,
    hideEditButton: false,
  };

  beforeEach(() => {
    wrapper = mount(<FAAGridActions {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});