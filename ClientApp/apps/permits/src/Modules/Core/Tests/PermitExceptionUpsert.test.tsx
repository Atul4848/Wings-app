import React from 'react';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PermitStoreMock, PermitSettingsStoreMock, PermitModel } from '../../Shared';
import { DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { CountryModel, useRouterContext, VIEW_MODE } from '@wings/shared';
import PermitExceptionUpsert from '../Components/PermitExceptionUpsert/PermitExceptionUpsert';
import { PermitEditorActions } from '../Components';
import { SettingsTypeModel } from '@wings-shared/core';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { LightTheme } from '@uvgo-shared/themes';
import { ViewExpandInput, ViewInputControl } from '@wings-shared/form-controls';

describe('Permit Exception Upsert Module', () => {
  let wrapper: any;
  let instance: any;
  const navigateSpy = sinon.spy();

  const props = {
    params: { permitId: 1, viewMode: VIEW_MODE.EDIT },
    classes: {},
    isEditable: true,
    viewMode: VIEW_MODE.EDIT,
    navigate: navigateSpy,
    sidebarStore: SidebarStore,
    permitStore: new PermitStoreMock(),
    permitSettingsStore: new PermitSettingsStoreMock(),
    fields:''
  };

  const permitData = new PermitModel({
    id: 1,
    country: new CountryModel({ id: 5 }),
    permitType: new SettingsTypeModel({ id: 1 }),
    exception: 'TeST',
    isException: false,
  });

  const element = (
    <ThemeProvider theme={createTheme(LightTheme)}>
      <PermitExceptionUpsert {...props} />
    </ThemeProvider>
  );

  beforeEach(() => {
    wrapper = mount(useRouterContext(element));
    props.permitStore.setPermitDataModel(permitData);
    instance = wrapper.find(PermitExceptionUpsert).instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should correctly render the header actions', () => {
    const headerActions = shallow(
      <div>{wrapper.find(DetailsEditorWrapper).prop('headerActions')}</div>
    );
    expect(headerActions.find(PermitEditorActions)).to.have.length(1);
  });

  it('should initialize permit data correctly', () => {
    expect(props.permitStore.permitDataModel).to.deep.equal(permitData);
  });

  it('should call onValueChange function', () => {
    const viewInputControl = wrapper.find(ViewInputControl).at(1).props();
    viewInputControl.onValueChange('test', 'isException');
    viewInputControl.onLabelClick('test', 'isException','InputText');
  })

  it('should call ViewExpandInput function', () => {
    const viewExpandInput = wrapper.find(ViewExpandInput).props();
    viewExpandInput.onValueChange('test', 'isException');
    viewExpandInput.onLabelClick('test', 'isException','InputText');
  })

});
