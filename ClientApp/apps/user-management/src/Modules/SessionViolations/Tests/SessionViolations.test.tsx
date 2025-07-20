import React from 'react';
import { shallow, ShallowWrapper } from "enzyme";
import { GridApiMock } from '@wings/shared';
import { SessionViolationsModel, SessionViolationsMock } from "../../Shared";
import SessionViolations from "../SessionViolations";
import { expect } from "chai";
import sinon from "sinon";
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('SessionViolations', () => {
  let wrapper: ShallowWrapper;
  let instance;

  const props = {
    classes: {},
    sessionViolationsStore: new SessionViolationsMock(),
  }

  beforeEach(() => {
    wrapper = shallow(<SessionViolations {...props} />).dive().dive();
    instance = wrapper.instance();
    instance.gridApi = new GridApiMock({ data: new SessionViolationsModel() });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('GRID Action DELETE should render ConfirmDialog', () => {
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    const modalData = shallow(<div>{ModalStore.data}</div>);
    expect(modalData.find(ConfirmDialog)).to.have.length(1);

    // on Yes click in dialog should delete SessionViolations
    const deleteSessionViolationsSpy = sinon.spy(instance, 'deleteSessionViolations')
    modalData.find(ConfirmDialog).simulate('YesClick')
    expect(deleteSessionViolationsSpy.called).to.be.true;

    // on No click should close dialog
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    instance.gridActions(GRID_ACTIONS.DELETE, 1);
    modalData.find(ConfirmDialog).simulate('NoClick')
    expect(closeSpy.called).to.be.true;
  });
});