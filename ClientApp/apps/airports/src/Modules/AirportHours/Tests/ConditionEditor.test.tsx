import React from 'react';
import { expect } from 'chai';
import { ShallowWrapper, shallow } from 'enzyme';
import {
  AirportSettingsStoreMock,
  ConditionalOperatorModel,
  ConditionModel,
  ConditionTypeModel,
  ConditionValueModel,
} from '../../Shared';
import { Box } from '@material-ui/core';
import { ConditionEditor, PopoverWrapper } from '../Components/AirportHoursDetails/AirportHoursGrid/Components';
import { PrimaryButton } from '@uvgo-shared/buttons';
import sinon from 'sinon';

describe('ConditionEditor', () => {
  let wrapper: ShallowWrapper;

  const props = {
    settingsStore: new AirportSettingsStoreMock(),
    isRowEditing: false,
    getDisabledState: () => false,
    value: [
      new ConditionModel({
        id: 1,
        conditionType: new ConditionTypeModel({ id: 1, name: 'TEST' }),
        conditionalOperator: new ConditionalOperatorModel({ id: 1, operator: '=' }),
        conditionValues: [new ConditionValueModel({ entityValue: 'TEST', entityValueId: 1 })],
      }),
    ],
    context: {
      componentParent: {
        onDropDownChange: sinon.spy(),
      },
    },
  };

  beforeEach(() => {
    wrapper = shallow(<ConditionEditor {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(PopoverWrapper)).to.have.length(1);
  });

  it('should render add button', () => {
    wrapper.setProps({ isRowEditing: true });
    expect(wrapper.find(PrimaryButton)).to.have.length(1);
    expect(wrapper.find(Box)).to.have.length(3);
  });
});
