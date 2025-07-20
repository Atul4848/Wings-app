import {
  EntityMapModel,
  IAPIGridRequest,
  IClasses,
  SEARCH_ENTITY_TYPE,
  Utilities,
  tapWithAction,
} from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { GeneralModel, IUseUpsert, withFormFields } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { CountryStore, SettingsStore } from '../../../../Shared';
import { generalFields, weekOptions } from '../fields';

interface Props {
  useUpsert: IUseUpsert;
  classes: IClasses;
  settingsStore?: SettingsStore;
  countryStore?: CountryStore;
}

const General = ({ useUpsert, classes, settingsStore, countryStore }: Props) => {
  const [ flightTypes, setFlightTypes ] = useState<EntityMapModel[]>([]);
  const [ navigatorTypes, setNavigatorTypes ] = useState<EntityMapModel[]>([]);
  const _countryStore = countryStore as CountryStore;

  useEffect(() => {
    loadInitialData();
    return () => {
      useUpsert.form.reset();
    };
  }, []);

  const loadInitialData = () => {
    const general = countryStore?.selectedCountry?.generalOperationalRequirement;
    useUpsert.setFormValues(general || new GeneralModel());
  };

  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string) => {
    if (!searchValue) {
      _countryStore.countries = [];
      return;
    }
    const countryRequest: IAPIGridRequest = useUpsert.getSearchRequest(searchValue, SEARCH_ENTITY_TYPE.COUNTRY);
    useUpsert.observeSearch(_countryStore.getCountries(countryRequest));
  };

  const onFocus = (fieldKey: string) => {
    if (Utilities.isEqual(fieldKey, 'fullAviationSecurityCheckRqrdOnDepartures')) {
      useUpsert.observeSearch(
        settingsStore?.getFlightOperationalCategories().pipe(
          tapWithAction(response => {
            const _flightTypes = response.map(
              x =>
                new EntityMapModel({
                  name: x.name,
                  entityId: x.id,
                })
            );
            setFlightTypes(_flightTypes);
          })
        )
      );
      return;
    }
    if (Utilities.isEqual(fieldKey, 'navigators')) {
      useUpsert.observeSearch(
        settingsStore?.getNavigators().pipe(
          tapWithAction(response => {
            const _navigatorTypes = response.map(
              x =>
                new EntityMapModel({
                  name: x.name,
                  entityId: x.id,
                })
            );
            setNavigatorTypes(_navigatorTypes);
          })
        )
      );
      useUpsert.observeSearch(settingsStore?.getNavigators());
    }
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'navigators',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          label: 'Navigators',
          options: navigatorTypes,
        },
        {
          fieldKey: 'fullAviationSecurityCheckRqrdOnDepartures',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          label: 'Full Aviation Security Check Required on Departure',
          options: flightTypes,
        },
        {
          fieldKey: 'charterMaxLiquidInML',
          type: EDITOR_TYPES.TEXT_FIELD,
          label: 'Charter Liquid Max (ml)*',
        },
        {
          fieldKey: 'isMedicalInsuranceRecommended',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          label: 'Medical Insurance Recommended*',
          excludeEmptyOption: true,
          containerClass: classes?.containerClass,
        },
        {
          fieldKey: 'domesticCountries',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _countryStore?.countries,
          searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
          isServerSideSearch: true,
        },
        {
          fieldKey: 'businessDays',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: weekOptions(),
        },
      ],
    },
  ];

  return (
    <ViewInputControlsGroup
      groupInputControls={groupInputControls()}
      field={fieldKey => useUpsert.getField(fieldKey)}
      isEditing={useUpsert.isEditable}
      isLoading={useUpsert.isLoading}
      onValueChange={useUpsert.onValueChange}
      onFocus={fieldKey => onFocus(fieldKey)}
      onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
    />
  );
};

export default withFormFields(inject('settingsStore', 'countryStore')(observer(General)), generalFields);
