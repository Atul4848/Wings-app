import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { useRouterContext } from '@wings/shared';
import {
  CountryLevelExclusionModel,
  HealthAuthModel,
  HealthAuthStoreMock,
  SectionLevelExclusionModel,
  SettingsStoreMock,
  TraveledHistoryModel,
} from '../../Shared';
import { EditSaveButtons } from '@wings-shared/layout';
import { GRID_ACTIONS } from '@wings-shared/core';
import { TraveledHistory } from '../Components';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { Provider } from 'mobx-react';
import { ViewInputControl } from '@wings-shared/form-controls';
import { CountryLevelExclusion, SectionLevelExclusion } from '../Components/TraveledHistory';

describe('TraveledHistory', () => {
  let wrapper;

  const props = {
    settingsStore: new SettingsStoreMock(),
    healthAuthStore: new HealthAuthStoreMock(),
  };

  const element = (
    <Provider {...props}>
      <ThemeProvider theme={createTheme(LightTheme)}>
        <TraveledHistory {...props} />
      </ThemeProvider>
    </Provider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should call onValueChange function', () => {
    const viewInputControl = wrapper.find(ViewInputControl);
    viewInputControl
      .at(0)
      .props()
      .onValueChange(false, 'traveledHistory.isTraveledHistoryRequired');

    props.healthAuthStore.selectedHealthAuth = new HealthAuthModel({
      ...props.healthAuthStore.selectedHealthAuth,
      traveledHistory: new TraveledHistoryModel({
        id: 1,
        isTraveledHistoryRequired: true,
        isOther: true,
        sectionLevelExclusions: [new SectionLevelExclusionModel()],
      }),
    });
    viewInputControl
      .at(0)
      .props()
      .onValueChange(true, 'traveledHistory.isTraveledHistoryRequired');
    viewInputControl
      .at(3)
      .props()
      .onValueChange(true, 'traveledHistory.isOther');
    viewInputControl
      .at(3)
      .props()
      .onValueChange(false, 'traveledHistory.isOther');
  });

  it('should call onFocus function', () => {
    const viewInputControl = wrapper.find(ViewInputControl);
    viewInputControl
      .at(0)
      .props()
      .onFocus('traveledHistoryCountries');
    viewInputControl
      .at(0)
      .props()
      .onFocus('traveledHistory.isTraveledHistoryRequired');
  });

  it('should call onSearch function', () => {
    const viewInputControl = wrapper.find(ViewInputControl);
    viewInputControl
      .at(0)
      .props()
      .onSearch('test', 'traveledHistoryCountries');
    viewInputControl
      .at(0)
      .props()
      .onSearch('test', 'traveledHistory.isTraveledHistoryRequired');
  });

  it('should call SectionLevelExclusion functions', () => {
    props.healthAuthStore.selectedHealthAuth = new HealthAuthModel({
      ...props.healthAuthStore.selectedHealthAuth,
      traveledHistory: new TraveledHistoryModel({ id: 1, isTraveledHistoryRequired: true }),
    });
    const sectionLevelExclusion = wrapper.find(SectionLevelExclusion).props();
    sectionLevelExclusion.onDataUpdate([new SectionLevelExclusionModel()]);
    sectionLevelExclusion.onRowEdit(true);
  });

  it('should call CountryLevelExclusion functions', () => {
    props.healthAuthStore.selectedHealthAuth = new HealthAuthModel({
      ...props.healthAuthStore.selectedHealthAuth,
      traveledHistory: new TraveledHistoryModel({ id: 1, isTraveledHistoryRequired: true, isOther: true }),
    });
    const countryLevelExclusion = wrapper.find(CountryLevelExclusion).props();
    countryLevelExclusion.onDataUpdate([new CountryLevelExclusionModel()]);
    countryLevelExclusion.onRowEdit(true);
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });
});
