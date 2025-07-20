import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { CountryModel, RegionModel } from '@wings/shared';
import { SettingsStoreMock, RegionStoreMock, CountryStoreMock, ContinentModel } from '../../Shared';
import { GEOGRAPHICAL_REGION_TYPE, getFormValidation } from '@wings-shared/core';
import { CountryEditorV2 } from '../Components';
import MobxReactForm from 'mobx-react-form';
import { EDITOR_TYPES, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { fields } from '../Components/Fields';
import sinon from 'sinon';

describe('CountryEditor', () => {
  let wrapper: any;
  const form: MobxReactForm = getFormValidation(fields);
  let viewInputControlsGroup: any;
  const props = {
    continentId: 1,
    regions: [
      new RegionModel({
        regionId: 1,
        regionTypeId: 1,
        regionName: 'WEST',
        regionTypeName: GEOGRAPHICAL_REGION_TYPE.GEOGRAPHICAL_REGION,
      }),
      new RegionModel({ regionId: 2, regionTypeId: 2, regionName: 'EAST' }),
      new RegionModel({ regionId: 3, regionTypeId: 5, regionName: 'SOUTH' }),
    ],
    countryModel: new CountryModel({
      id: 5,
      officialName: 'NEW TEST',
      commonName: 'NEW TEST',
      isO2Code: 'NE',
      isO3Code: 'NEW',
      isoNumericCode: '100',
      continent: new ContinentModel({ id: 1 }),
    }),
    auditFields: [
      { type: EDITOR_TYPES.TEXT_FIELD, fieldKey: 'createdBy' },
      { type: EDITOR_TYPES.TEXT_FIELD, fieldKey: 'modifiedBy' },
    ],
    countryStore: new CountryStoreMock(),
    settingsStore: new SettingsStoreMock(),
    regionStore: new RegionStoreMock(),
    useUpsert: {
      isAddNew: false,
      isEditable: false,
      form: form,
      getField: (fieldKey: string) => ({
        set: sinon.spy(),
        clear: sinon.fake(),
      }),
      onValueChange: sinon.spy(),
    },
  };

  beforeEach(() => {
    wrapper = shallow(<CountryEditorV2 {...props} />).dive();
    viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call onValueChange method with different fieldKeys', () => {
    const fieldsToTest = [
      'commonName',
      'officialName',
      'isO2Code',
      'isO3Code',
      'isoNumericCode',
      'geographicalRegion',
      'continent',
      'currencyCode',
      'commsPrefix',
      'isTerritory',
      'territoryType',
      'sovereignCountry',
      'postalCodeFormat',
      'startDate',
      'endDate',
      'cappsusSanction',
    ];
    fieldsToTest.forEach(fieldKey =>
      viewInputControlsGroup
        .at(0)
        .props()
        .onValueChange(false, fieldKey)
    );
    fieldsToTest.forEach(fieldKey => expect(props.useUpsert.onValueChange.calledWith(false, fieldKey)).to.be.true);
  });
});
