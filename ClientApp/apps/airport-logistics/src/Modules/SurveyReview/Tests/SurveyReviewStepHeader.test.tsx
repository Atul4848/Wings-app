import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ButtonGroup, Tooltip } from '@material-ui/core';
import { Provider } from 'mobx-react';
import { AirportLogisticsStore, StepperStore } from './../../Shared/Stores/index';
import SurveyReviewStepHeader from '../SurveyReviewBody/SurveyReviewStepHeader/SurveyReviewStepHeader';

describe('SureveyReviewStepHeader component', function() {
  const airportLogisticsStore = new AirportLogisticsStore();
  const defaultProps = {
    title: 'title',
    isApproved: true,
    classes: {
      headerContainer: 'header',
      unSubmitButtonText: 'unSumbitButton',
    },
  };

  const getWrapper = (redefinedProps = {}) => {
    const props = { ...defaultProps, ...redefinedProps };
    return mount(
      <Provider airportLogisticsStore={airportLogisticsStore} stepperStore={StepperStore}>
        <SurveyReviewStepHeader {...props} />
      </Provider>
    );
  };

  it('should be rendered without errors', function () {
    const wrapper: ReactWrapper = getWrapper();
    expect(wrapper).to.have.length(1);
  });

  it('should render ButtonGroup component if already approved', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: true });
    expect(wrapper.find(ButtonGroup)).to.have.length(1);
  });

  it('should not render ButtonGroup component if not approved', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: false });
    expect(wrapper.find(ButtonGroup)).to.have.length(0);
  });

  it('should render header button container if approved', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: true });
    expect(wrapper.find(`.${defaultProps.classes.headerContainer}`)).to.have.length(1);
  });

  it('Tooltip title for Ignored button should match', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: false });
    const toolTiptitle = 'Approve or Ignore all the fields to enable this button';
    expect(wrapper.find(Tooltip).prop('title')).to.be.equal(toolTiptitle);
  });

  it('Tooltip title for Approved button should match', function () {
    airportLogisticsStore.setHasAccessedAirport(true);
    airportLogisticsStore.setHasAccessedHandler(true);
    const wrapper: ReactWrapper = getWrapper({ isApproved: false });
    const toolTiptitle = 'Approve';
    expect(wrapper.find(Tooltip).prop('title')).to.be.equal(toolTiptitle);
  });

  it('should render Tooltip component if not approved', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: false });
    expect(wrapper.find(Tooltip)).to.have.length(1);
  });

  it('should render Tooltip component if approved', function () {
    const wrapper: ReactWrapper = getWrapper({ isApproved: true });
    expect(wrapper.find(Tooltip)).to.have.length(0);
  });

  it('should call approveHandler correctly', function () {
    airportLogisticsStore.setHasAccessedAirport(true);
    airportLogisticsStore.setHasAccessedHandler(true);
    const approveHandler = sinon.fake();
    const wrapper: ReactWrapper = getWrapper({ isApproved: false, approveHandler });
    wrapper.find('.btn-approve').at(0).simulate('click');
    expect(approveHandler.callCount).to.eq(1);
  });

  it('should call unSubmitHandler correctly', function () {
    airportLogisticsStore.setHasAccessedAirport(true);
    airportLogisticsStore.setHasAccessedHandler(true);
    const unSubmitHandler = sinon.fake();
    const wrapper: ReactWrapper = getWrapper({ isApproved: true, unSubmitHandler });
    wrapper.find(`.${defaultProps.classes.unSubmitButtonText}`).at(0).simulate('click');
    expect(unSubmitHandler.callCount).to.eq(1);
  });
});
