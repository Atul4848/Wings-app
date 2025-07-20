import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import MobxReactForm from 'mobx-react-form';
import { Progress } from '@uvgo-shared/progress';
import { getFormValidation } from '@wings-shared/core';
import { SurveySelectionEditor } from '../SurveyEditor';
import { LOGISTICS_COMPONENTS } from '../../Shared/Enums';
import { LogisticsComponentModel } from '../../Shared/Models';
import { FormControlLabel } from '@material-ui/core';
import { AirportLogisticsStoreMock } from '../../Shared/Mocks';

describe('Survey Selection Editor Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;
  let airportLogisticStore: AirportLogisticsStoreMock;

  const fields = {
    testField: {
      label: 'Test field label',
      placeholder: 'Test field placeholder',
      rules: 'string',
      value: 'Test value',
    },
  };

  beforeEach(() => {
    form = getFormValidation(fields);
    airportLogisticStore = new AirportLogisticsStoreMock();
    wrapper = shallow(
      <SurveySelectionEditor
        airportLogisticsStore={airportLogisticStore}
        field={form.$('testField')}
        selected={[]}
        component={LOGISTICS_COMPONENTS.AIRPORT_FACILITY}/>
    )
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render 2 FormControlLabel components, 1 for option and 1 for select/deselect all', () => {
    const logisticsComponent = new LogisticsComponentModel({ id: 1, subComponentId: 1, subComponentName: 'Test'});
    airportLogisticStore.updateComponentOptions([ logisticsComponent ], LOGISTICS_COMPONENTS.AIRPORT_FACILITY);
    wrapper.setProps({selected: [ logisticsComponent ]});
    wrapper.update();

    expect(wrapper.dive().find(FormControlLabel)).to.have.length(2);
  });

  it('deselect all should set empty array to form', () => {
    const logisticsComponent = new LogisticsComponentModel({ id: 1, subComponentId: 1, subComponentName: 'Test'});
    airportLogisticStore.updateComponentOptions([ logisticsComponent ], LOGISTICS_COMPONENTS.AIRPORT_FACILITY);
    wrapper.setProps({selected: [ logisticsComponent ]});
    wrapper.update();

    wrapper.dive().find(FormControlLabel).at(0).simulate('change');
    expect(form.$('testField').value).to.eql([]);
  });

  it('select all set array of LogisticsComponentModel to form', () => {
    const logisticsComponent = new LogisticsComponentModel({ id: 1, subComponentId: 1, subComponentName: 'Test'});
    airportLogisticStore.updateComponentOptions([ logisticsComponent ], LOGISTICS_COMPONENTS.AIRPORT_FACILITY);
    wrapper.update();

    wrapper.dive().find(FormControlLabel).at(0).simulate('change');
    expect(form.$('testField').value).to.have.deep.members([ logisticsComponent ]);
  });

  it('select specific checkbox LogisticsComponentModel to form', () => {
    const firstOption = new LogisticsComponentModel({ id: 1, subComponentId: 1, subComponentName: 'Test'});
    const secondOption = new LogisticsComponentModel({ id: 2, subComponentId: 2, subComponentName: 'Test Two'});
    airportLogisticStore.updateComponentOptions([ firstOption, secondOption ], LOGISTICS_COMPONENTS.AIRPORT_FACILITY);
    wrapper.update();

    wrapper.dive().find(FormControlLabel).at(1).simulate('change');
    expect(form.$('testField').value).to.have.deep.members([ firstOption ]);
  });

  it('should load data and show progress bar', () => {
    airportLogisticStore.updateComponentOptions(null, LOGISTICS_COMPONENTS.AIRPORT_FACILITY);
    wrapper.update();

    expect(wrapper.dive().find(Progress)).to.have.length(1);
  });


})
