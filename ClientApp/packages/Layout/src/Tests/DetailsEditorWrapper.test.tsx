import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { DetailsEditorWrapper } from '../Components';

describe('Details Editor Wrapper', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <DetailsEditorWrapper headerActions={<div>Header Actions</div>} isEditMode={true}>
        <div>content</div>
      </DetailsEditorWrapper>
    ).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render header actions', () => {
    expect(wrapper.find('div').contains('Header Actions')).to.true;
  });
});
