import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import {
  FAAImportComparisonModel,
} from '../../Shared';
import sinon from 'sinon';
import { FAAActionButtons } from '../Components';

describe('FAAFileDetails Module', () => {
  let wrapper: ShallowWrapper;

  const data = [new FAAImportComparisonModel()];

  const props = {
    data,
    hasSelectedRows: false,
    onMergeRecords: sinon.spy(),
    onViewDetails: sinon.spy(),
    isFrequency: false,
  };

  beforeEach(() => {
    wrapper = shallow(<FAAActionButtons {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });
});
