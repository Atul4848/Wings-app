import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import ConfirmDeactivateDialog from '../Components/AirportGeneralInformation/ConfirmDeactivateDialog/ConfirmDeactivateDialog';
import { TextField } from '@material-ui/core';
import { ConfirmDialog } from '@wings-shared/layout';

describe('Confirm Deactivate Dialog', () => {
  let wrapper: ShallowWrapper;

  const props = {
    isActive: true,
    onYesClick: sinon.fake(),
    onNoClick: sinon.fake(),
  };

  beforeEach(() => {
    wrapper = shallow(<ConfirmDeactivateDialog {...props} />);
  });

  const confirmDialogProps = () => wrapper.find(ConfirmDialog).props();

  it('should be rendered without errors', () => {
    expect(wrapper).to.ok;
  });

  it('should render title properly if active then confirm deactivate', () => {
    // if active then confirm deactivate
    expect(confirmDialogProps().title).to.eq('Confirm Deactivate');

    // if inactive then confirm activate
    wrapper.setProps({ ...props, isActive: false });
    expect(confirmDialogProps().title).to.eq('Confirm Activate');
  });

  it('oky button should be disable until user enter the reason', () => {
    // if no value in state then ok button should be disable
    expect(confirmDialogProps().isDisabledYesButton).to.true;

    // if value then ok button should be enabled
    const textField = shallow(<div>{confirmDialogProps().dialogContent}</div>).find(TextField);
    textField.simulate('change', { target: { value: 'Test ABC' } });
    expect(confirmDialogProps().isDisabledYesButton).to.false;
  });

  it('oky button should send the value to parent', () => {
    const textField = shallow(<div>{confirmDialogProps().dialogContent}</div>).find(TextField);
    textField.simulate('change', { target: { value: 'Testing Deactivate' } });

    // if value then ok button should be enabled
    wrapper.find(ConfirmDialog).simulate('yesClick');
    expect(props.onYesClick.calledWith('Testing Deactivate')).true;
  });
});
