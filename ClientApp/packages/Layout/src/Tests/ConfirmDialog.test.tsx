import React, { ReactNode } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { ConfirmDialog } from '../Components';
import { PrimaryButton, DangerButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';

describe('Confirm Dialog Component', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  const dialogActions = (): ReactNode =>
    wrapper.find(Dialog).prop('dialogActions')();
  const dialogContent = (): ReactNode =>
    wrapper.find(Dialog).prop('dialogContent')();
  const props = {
    classes: {},
    onNoClick: sinon.fake(),
    onYesClick: sinon.fake(),
    isDeleteButton: false,
    onCloseClick: sinon.fake(),
  };

  beforeEach(function() {
    wrapper = shallow(<ConfirmDialog {...props} />).dive();
    instance = wrapper.instance();
  });

  afterEach(function() {
    wrapper.unmount();
  });

  it('should be rendered without errors', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render Dialog', function() {
    wrapper.setProps({ ...props, defaultModal: true });
    expect(wrapper).to.have.length(1);
  });

  it('should render Dialog Actions', function() {
    const element: JSX.Element = <div>{dialogActions()}</div>;
    expect(shallow(element).find(PrimaryButton)).to.have.length(2);
  });

  it('should render Dialog Content', function() {
    const element: JSX.Element = <div>{dialogContent()}</div>;
    expect(shallow(element));
  });
  it('should render dialog content when defaultModal = true', () => {
    wrapper.setProps({ ...props, defaultModal: true });
    const element: JSX.Element = <div>{dialogActions()}</div>;
    expect(shallow(element).find(PrimaryButton)).to.have.length(2);
  });

  it('should render dialog Actions when defaultModal = true', () => {
    wrapper.setProps({ ...props, defaultModal: true });
    const element: JSX.Element = <div>{dialogActions()}</div>;
    expect(shallow(element).find(PrimaryButton)).to.have.length(2);
  });
  it('should render delete button', () => {
    wrapper.setProps({ isDeleteButton: true, yesButton: 'Delete' });
    const deleteActions: ShallowWrapper = shallow(
      <div>{wrapper.find(Dialog).prop('dialogActions')()}</div>
    );
    expect(deleteActions.find(DangerButton).at(0)).to.have.length(1);
  });

  it('should call onNoClick prop', () => {
    shallow(<div>{dialogActions()}</div>)
      .find(PrimaryButton)
      .first()
      .simulate('click', null);
    expect(props.onNoClick.callCount).to.eq(1);
  });
  it('should call onYesClick prop', () => {
    shallow(<div>{dialogActions()}</div>)
      .find(PrimaryButton)
      .at(1)
      .simulate('click', null);
    expect(props.onYesClick.callCount).to.eq(1);
  });

  it('should call onCloseClick prop', () => {
    wrapper.find(Dialog).prop('onClose')(); // Simulate Dialog onClose
    expect(props.onCloseClick.callCount).to.equal(1);
  });
});
