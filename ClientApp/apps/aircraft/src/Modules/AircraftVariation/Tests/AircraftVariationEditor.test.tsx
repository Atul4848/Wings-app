import * as React from 'react';
import { ReactWrapper, ShallowWrapper, mount, shallow } from 'enzyme';
import { AircraftVariationStoreMock, PerformanceStoreMock, SettingsStoreMock } from '../../Shared';
import sinon from 'sinon';
import { expect } from 'chai';
import { VIEW_MODE, useRouterContext } from '@wings/shared';
import { DetailsEditorWrapper, EditSaveButtons, SidebarStore } from '@wings-shared/layout';
import { AircraftVariationEditor } from '../Components';
import { LightTheme } from '@uvgo-shared/themes';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ViewInputControl } from '@wings-shared/form-controls';
import { GRID_ACTIONS } from '@wings-shared/core';

describe('Aircraft Variation Editor Module', () => {
  let wrapper: ReactWrapper;
  let headerActions: ShallowWrapper;

  const props = {
    classes: {},
    aircraftVariationStore: new AircraftVariationStoreMock(),
    settingsStore: new SettingsStoreMock(),
    viewMode: VIEW_MODE.EDIT,
    performanceStore: new PerformanceStoreMock(),
    params: { mode: VIEW_MODE.EDIT, id: 3 },
    navigate: sinon.fake(),
    sidebarStore: SidebarStore,
  };

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <AircraftVariationEditor {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    headerActions = shallow(<div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>);
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should work with onFocus with different fieldKeys', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(0);
    // for getMakes
    const getMakesSpy = sinon.spy(props.settingsStore, 'getMakes');
    viewInputControl.prop('onFocus')('make');
    expect(getMakesSpy.called).true;

    // for getAircraftModels
    const getAircraftModelsSpy = sinon.spy(props.settingsStore, 'getAircraftModels');
    viewInputControl.prop('onFocus')('model');
    expect(getAircraftModelsSpy.called).true;

    // for getSeries
    const getSeriesSpy = sinon.spy(props.settingsStore, 'getSeries');
    viewInputControl.prop('onFocus')('series');
    expect(getSeriesSpy.called).true;

    // for getPerformances
    const getPerformancesSpy = sinon.spy(props.performanceStore, 'getPerformances');
    viewInputControl.prop('onFocus')('performances');
    expect(getPerformancesSpy.called).true;

    // for getEngineTypes
    const getEngineTypesSpy = sinon.spy(props.settingsStore, 'getEngineTypes');
    viewInputControl.prop('onFocus')('engineType');
    expect(getEngineTypesSpy.called).true;

    // for getAircraftModifications
    const getAircraftModificationsSpy = sinon.spy(props.settingsStore, 'getAircraftModifications');
    viewInputControl.prop('onFocus')('modifications');
    expect(getAircraftModificationsSpy.called).true;

    // for getICAOTypeDesignators
    const getICAOTypeDesignatorsSpy = sinon.spy(props.settingsStore, 'getICAOTypeDesignators');
    viewInputControl.prop('onFocus')('icaoTypeDesignator');
    expect(getICAOTypeDesignatorsSpy.called).true;

    // for getFuelTypeProfile
    const getFuelTypeProfileSpy = sinon.spy(props.settingsStore, 'getFuelTypeProfile');
    viewInputControl.prop('onFocus')('fuelType');
    expect(getFuelTypeProfileSpy.called).true;

    // for getSubCategories
    const getSubCategoriesSpy = sinon.spy(props.settingsStore, 'getSubCategories');
    viewInputControl.prop('onFocus')('subCategory');
    expect(getSubCategoriesSpy.called).true;

    // for getFireCategory
    const getFireCategorySpy = sinon.spy(props.settingsStore, 'getFireCategory');
    viewInputControl.prop('onFocus')('fireCategory');
    expect(getFireCategorySpy.called).true;

    // for getCategories
    const getCategoriesSpy = sinon.spy(props.settingsStore, 'getCategories');
    viewInputControl.prop('onFocus')('category');
    expect(getCategoriesSpy.called).true;

    // for getWakeTurbulenceCategories
    const getWakeTurbulenceCategoriesSpy = sinon.spy(props.settingsStore, 'getWakeTurbulenceCategories');
    viewInputControl.prop('onFocus')('wakeTurbulenceCategory');
    expect(getWakeTurbulenceCategoriesSpy.called).true;

    // for getFuelTypeProfile
    const getDistanceUOMsSpy = sinon.spy(props.settingsStore, 'getDistanceUOMs');
    viewInputControl.prop('onFocus')('distanceUOM');
    expect(getDistanceUOMsSpy.called).true;

    // for getRangeUOMs
    const getRangeUOMsSpy = sinon.spy(props.settingsStore, 'getRangeUOMs');
    viewInputControl.prop('onFocus')('rangeUOM');
    expect(getRangeUOMsSpy.called).true;

    // for getWindUOMs
    const getWindUOMsSpy = sinon.spy(props.settingsStore, 'getWindUOMs');
    viewInputControl.prop('onFocus')('windUOM');
    expect(getWindUOMsSpy.called).true;

    // for getStcManufactures
    const getStcManufacturesSpy = sinon.spy(props.settingsStore, 'getStcManufactures');
    viewInputControl.prop('onFocus')('stcManufactures');
    expect(getStcManufacturesSpy.called).true;

    // for getSourceTypes
    const getSourceTypesSpy = sinon.spy(props.settingsStore, 'getSourceTypes');
    viewInputControl.prop('onFocus')('sourceType');
    expect(getSourceTypesSpy.called).true;

    // for getPopularNames
    const getPopularNamesSpy = sinon.spy(props.settingsStore, 'getPopularNames');
    viewInputControl.prop('onFocus')('popularNames');
    expect(getPopularNamesSpy.called).true;
  });

  it('edit button should call change view mode on props', () => {
    const editSaveButtons = wrapper.find(EditSaveButtons).props();
    editSaveButtons.onAction(GRID_ACTIONS.EDIT);
    editSaveButtons.onAction(GRID_ACTIONS.SAVE);
    editSaveButtons.onAction(GRID_ACTIONS.CANCEL);
  });
});
