import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import { HealthAuthorizationViewInputControls } from '../Components';
import { ChipViewInputControl, EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { TabsLayout } from '@wings-shared/layout';

describe('HealthAuthorizationViewInputControls', () => {
  let wrapper: ShallowWrapper;
  const props = {
    groupInputControls: [
      {
        title: 'Test',
        inputControls: [
          {
            fieldKey: 'infectionType',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'infectionType1',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'domesticMeasure.isPassengerVaccineExemption',
            type: EDITOR_TYPES.LABEL,
          },
          {
            fieldKey: 'infectionType2',
            type: EDITOR_TYPES.CHIP_INPUT,
          },
        ],
      },
    ],
    onValueChange: sinon.fake(),
    isEditable: true,
    getField: sinon.fake(),
    onFocus: sinon.fake(),
    onSearch: sinon.fake(),
    tabs: ['Test1', 'Test2'],
    setActiveTab: sinon.fake(),
    activeTab: 'Test1',
  };

  beforeEach(() => {
    wrapper = shallow(<HealthAuthorizationViewInputControls {...props} />);
  });

  it('should render without error', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render ViewInputControl component', () => {
    expect(wrapper.find(ViewInputControl)).exist;
  });

  it('should render ViewInputControl component and functions should work', () => {
    const viewInputControlComponent = wrapper.find(ViewInputControl);
    viewInputControlComponent.simulate('Search');
    expect(props.onSearch.called).to.be.true;

    viewInputControlComponent.simulate('ValueChange');
    expect(props.onValueChange.called).to.be.true;

    viewInputControlComponent.simulate('Focus');
    expect(props.onFocus.called).to.be.true;
  });

  it('should render ChipViewInputControl component and functions should work', () => {
    const chipViewInputControlComponent = wrapper.find(ChipViewInputControl).props();
    chipViewInputControlComponent.onChipAddOrRemove(['test']);
    props.getField('infectionType2');
  });

  it('should render TabsLayout component and functions should work', () => {
    const tabsLayout = wrapper.find(TabsLayout).props();
    tabsLayout.isDisable();
    tabsLayout.onTabChange('test');
  });
});
