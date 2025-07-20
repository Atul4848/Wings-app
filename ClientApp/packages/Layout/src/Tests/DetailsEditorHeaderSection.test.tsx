import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import {
  CustomLinkButton,
  DetailsEditorHeaderSection,
  EditSaveButtons,
} from '../Components';
import { SecondaryButton } from '@uvgo-shared/buttons';

describe('DetailsEditorHeaderSection Tests', () => {
  let wrapper: ShallowWrapper;

  const props = {
    title: 'TEST',
    isEditMode: false,
    backNavLink: 'Testing',
    backNavTitle: 'Testing',
    onAction: sinon.fake(),
    hideActionButtons: false,
    showStatusButton: true,
  };

  beforeEach(() => {
    wrapper = shallow(<DetailsEditorHeaderSection {...props} />);
  });

  it('should render without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render EditSaveButtons if hideActionButtons = false', () => {
    expect(wrapper.find(EditSaveButtons)).to.be.ok;
  });

  it('should render CustomLinkButton if isEditMode = false', () => {
    expect(wrapper.find(CustomLinkButton)).to.be.ok;
  });

  it('should not render EditSaveButtons if isActive = false', () => {
    wrapper.setProps({ isActive: false }); // Updated this line
    expect(wrapper.find(EditSaveButtons)).to.be.empty;
  });

  it('should not render SecondaryButton when showStatusButton is false', () => {
    wrapper.setProps({ showStatusButton: false });
    expect(wrapper.find(SecondaryButton)).to.be.empty;
  });

  it('should not render EditSaveButtons if both hideActionButtons and isActive are false', () => {
    wrapper.setProps({ hideActionButtons: true, isActive: false });
    expect(wrapper.find(EditSaveButtons)).to.be.empty;
  });
});
