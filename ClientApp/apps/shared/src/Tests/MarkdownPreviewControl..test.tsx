import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { MarkdownPreviewControl } from '../Components';
import { MarkdownPreview } from 'react-marked-markdown';

describe('MarkdownPreviewControl Tests', () => {
  let wrapper: ShallowWrapper;
  const props = {
    classes: {},
    value: '#Heading1',
  };

  beforeEach(() => {
    wrapper = shallow(<MarkdownPreviewControl {...props} />).dive();
  });

  it('should render without error', () => {
    expect(wrapper).to.be.ok;
  });

  it('should render MarkdownPreview', () => {
    expect(wrapper.find(MarkdownPreview)).to.be.ok;
  });
});
