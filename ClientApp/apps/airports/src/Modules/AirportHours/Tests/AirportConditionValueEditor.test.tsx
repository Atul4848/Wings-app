import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';
import {
  AirportHoursModel,
  AirportSettingsStore,
  ConditionModel,
  ConditionTypeModel,
  ConditionValueModel,
} from '../../Shared';
import { AgGridCellEditor } from '@wings-shared/custom-ag-grid';
import { AirportConditionValueEditor } from '../Components';

describe('Airport Condition ValueEditor', () => {
  let wrapper: ReactWrapper;
  const onDropDownChange = sinon.spy();
  const onInputChange = sinon.spy();

  const props = {
    settingsStore: new AirportSettingsStore(),
    isRequired: node => false,
    getDisableState: node => false,
    value: [new ConditionValueModel({ id: 1, entityValue: 'Test1' })],
    data: new AirportHoursModel({
      id: 1,
      condition: new ConditionModel({ id: 1, conditionType: new ConditionTypeModel({ id: 1, name: 'test' }) }),
    }),
    colDef: { headerName: 'Condition Value', field: 'condition.conditionValues' },
    context: { componentParent: { onDropDownChange, onInputChange } },
  };

  beforeEach(() => {
    wrapper = mount(<AirportConditionValueEditor {...props} />);
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
    expect(wrapper.find(AgGridCellEditor)).to.have.length(1);
  });
});
