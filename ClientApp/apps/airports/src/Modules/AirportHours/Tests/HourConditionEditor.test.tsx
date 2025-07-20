import React from 'react';
import { expect } from 'chai';
import { ReactWrapper, mount } from 'enzyme';
import { SecondaryButton } from '@uvgo-shared/buttons';
import sinon from 'sinon';
import {
  AirportSettingsStoreMock,
  CONDITION_EDITOR,
  ConditionalOperatorModel,
  ConditionModel,
  ConditionTypeModel,
  ConditionValueModel,
} from '../../Shared';
import { ViewInputControl } from '@wings-shared/form-controls';
import HourConditionEditor from '../Components/AirportHoursDetails/AirportHoursGrid/Components/ConditionEditor/HourConditionEditor/HourConditionEditor';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { useRouterContext } from '@wings/shared';

describe('HourConditionEditor', () => {
  let wrapper: ReactWrapper;

  const props = {
    index: 1,
    item: new ConditionModel({
      id: 1,
      conditionType: new ConditionTypeModel({ id: 1, name: 'TEST' }),
      conditionalOperator: new ConditionalOperatorModel({ id: 1, operator: '=' }),
      conditionValues: [new ConditionValueModel({ entityValue: 'TEST', entityValueId: 1 })],
    }),
    onDelete: sinon.spy(),
    isRowEditing: true,
    settingStore: new AirportSettingsStoreMock(),
    syncHasError: hasError => {},
    onChanges: sinon.spy(),
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <HourConditionEditor {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render ViewInputControls and Delete button', () => {
    expect(wrapper.find(ViewInputControl)).to.have.length(3);
    expect(wrapper.find(SecondaryButton)).to.have.length(1);
  });

  it('should call onDelete on delete button click', () => {
    wrapper
      .find(SecondaryButton)
      .props()
      .onClick();
    expect(props.onDelete.calledOnce).to.be.true;
  });

  it('should work with onFocus with different fieldKeys', () => {
    // for conditionType field
    const loadConditionTypesSpy = sinon.spy(props.settingStore, 'loadConditionTypes');
    wrapper
      .find(ViewInputControl)
      .at(0)
      .prop('onFocus')('conditionType');
    expect(loadConditionTypesSpy.called).true;

    // for conditionalOperator field
    const getConditionalOperatorsSpy = sinon.spy(props.settingStore, 'getConditionalOperators');
    wrapper
      .find(ViewInputControl)
      .at(1)
      .prop('onFocus')('conditionalOperator');
    expect(getConditionalOperatorsSpy.called).true;
  });

  it('should call onValueChange method', () => {
    const viewInputControlAt = index => wrapper.find(ViewInputControl).at(index);

    // with 'conditionType' fieldKey
    viewInputControlAt(0)
      .props()
      .onValueChange('abc', 'conditionType');
    expect(viewInputControlAt(1).props().field.value).to.be.null;
    expect(viewInputControlAt(2).props().field.value).to.be.null;

    // with 'conditionalOperator' fieldKey
    viewInputControlAt(1)
      .props()
      .onValueChange('=', 'conditionalOperator');
    expect(viewInputControlAt(2).props().field.value).to.be.empty;

    // with 'conditionValues' fieldKey
    const value = [new ConditionValueModel({ id: 1, entityValueId: 1, entityValue: 'abc' })];
    viewInputControlAt(2)
      .props()
      .onValueChange(value, 'conditionValues');
    expect(props.onChanges.callCount).to.eq(3);
  });

  it('should call onSearch method', () => {
    // when there is no search value
    wrapper
      .find(ViewInputControl)
      .at(2)
      .props()
      .onSearch('');
    expect(props.settingStore.aircraftVariations).to.be.empty;

    // else case
    wrapper
      .find(ViewInputControl)
      .at(0)
      .props()
      .field.set(new ConditionTypeModel({ id: 1, name: 'Aircraft Type' }));
    const getAircraftVariationsSpy = sinon.spy(props.settingStore, 'getAircraftVariations');
    wrapper
      .find(ViewInputControl)
      .at(2)
      .props()
      .onSearch('abc');
    expect(getAircraftVariationsSpy.called).to.be.true;
  });
});
