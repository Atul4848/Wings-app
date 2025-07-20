import { CountryModel, IUseUpsert, RegionModel } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect, useState } from 'react';
import { GEOGRAPHICAL_REGION_TYPE, IOptionValue, ISelectOption, UIStore, Utilities } from '@wings-shared/core';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CountryStore, RegionStore, SettingsStore } from '../../../Shared';
import { useStyles } from './CountryEditorV2.styles';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';

interface Props {
  continentId: number;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  countryModel: CountryModel;
  regionStore?: RegionStore;
  ref?: any;
  useUpsert: IUseUpsert;
}

const CountryEditorV2: FC<Props> = ({ useUpsert, ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _countryStore = props.countryStore as CountryStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const _regionStore = props.regionStore as RegionStore;
  const [ geographicalRegions, setGeographicalRegions ] = useState<RegionModel[]>([]);
  const [ sovereignCountries, setSovereignCountries ] = useState<CountryModel[]>([]);

  /* istanbul ignore next */
  useEffect(() => {
    return () => {
      _countryStore.clearCapitalCity();
    };
  }, []);

  const continentId = (): number => Number(props.continentId);

  /* istanbul ignore next */
  const filteredCountries = (): CountryModel[] =>
    _countryStore.countries.filter((country: CountryModel) => country.id !== props.countryModel?.id);

  /* istanbul ignore next */
  const isTerritoryDisabled = (): boolean => {
    if (!useUpsert.isAddNew) {
      return _countryStore.countries.some(
        ({ sovereignCountry }: CountryModel) => sovereignCountry?.id === props.countryModel?.id
      );
    }
    return false;
  };

  const cappsusSanction = (): boolean => useUpsert.getField('cappsusSanction').value;

  const isTerritory = (): boolean => Boolean(useUpsert.getField('isTerritory').value);

  /* istanbul ignore next */
  const isAlreadyExists = (fieldKey: string): boolean => {
    const { value } = useUpsert.getField(fieldKey);
    return value
      ? filteredCountries().some((country: CountryModel) => Utilities.isEqual(country[fieldKey], value))
      : false;
  };

  /* istanbul ignore next */
  const isIsoNumericCodeExists = (): boolean => {
    const { value } = useUpsert.getField('isoNumericCode');

    if (!value) {
      return false;
    }

    return filteredCountries().some((country: CountryModel) =>
      Utilities.isEqual(
        Utilities.trimLeadingZeros(country.isoNumericCode?.toString()),
        Utilities.trimLeadingZeros(value?.toString())
      )
    );
  };

  /* istanbul ignore next */
  const setTerritoryRules = (value): void => {
    if (value) {
      return;
    }
    useUpsert.getField('territoryType').set(null);
    useUpsert.getField('sovereignCountry').set(null);
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    if (fieldKey === 'isTerritory') {
      setTerritoryRules(value);
    }
    if (fieldKey === 'cappsusSanction' && !value) {
      useUpsert.getField('cappsusSanctionType').set('');
    }
    if (fieldKey === 'commsPrefix') {
      useUpsert.getField('commsPrefix').set(value as ISelectOption);
      return;
    }
    useUpsert.onValueChange(value, fieldKey);
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'capitalCity')) {
      UIStore.setPageLoader(true);
      _countryStore
        .getCapitalCities(props.countryModel.id, searchValue)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe();
    }
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'geographicalRegion':
        useUpsert.observeSearch(
          _regionStore.getRegions().pipe(
            tap(() => {
              const _geographicalRegions = _regionStore.regions.filter(({ regionType }: RegionModel) =>
                Utilities.isEqual(regionType.label, GEOGRAPHICAL_REGION_TYPE.GEOGRAPHICAL_REGION)
              );
              setGeographicalRegions(_geographicalRegions);
            })
          )
        );
        break;
      case 'continent':
        useUpsert.observeSearch(_countryStore.getContinents());
        break;
      case 'territoryType':
        useUpsert.observeSearch(_settingsStore.getTerritoryTypes());
        break;
      case 'sovereignCountry':
        useUpsert.observeSearch(
          _countryStore.getCountries().pipe(
            tap(() => {
              const _sovereignCountries = _countryStore.countries.filter(country => !country.isTerritory);
              setSovereignCountries(_sovereignCountries);
            })
          )
        );
        break;
      case 'cappsTerritoryType':
        useUpsert.observeSearch(_settingsStore.getCAPPSTerritoryType());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'commonName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isAlreadyExists('commonName'),
          },
          {
            fieldKey: 'officialName',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isAlreadyExists('officialName'),
          },
          {
            fieldKey: 'isO2Code',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isAlreadyExists('isO2Code'),
            isEditable: useUpsert.isEditable,
          },
          {
            fieldKey: 'isO3Code',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isAlreadyExists('isO3Code'),
          },
          {
            fieldKey: 'isoNumericCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isIsoNumericCodeExists(),
          },
          {
            fieldKey: 'geographicalRegion',
            type: EDITOR_TYPES.DROPDOWN,
            options: geographicalRegions,
          },
          {
            fieldKey: 'continent',
            type: EDITOR_TYPES.DROPDOWN,
            options: _countryStore.continents,
            isDisabled: Boolean(continentId()),
          },
          {
            fieldKey: 'currencyCode',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'commsPrefix',
            type: EDITOR_TYPES.DROPDOWN,
            options: useUpsert.getField('commsPrefix').options,
          },
          {
            fieldKey: 'isTerritory',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: isTerritoryDisabled(),
          },
          {
            fieldKey: 'territoryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.territoryTypes,
            isDisabled: !isTerritory(),
          },
          {
            fieldKey: 'sovereignCountry',
            type: EDITOR_TYPES.DROPDOWN,
            options: sovereignCountries,
            isDisabled: !isTerritory(),
          },
          {
            fieldKey: 'postalCodeFormat',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE_TIME,
            maxDate: useUpsert.getField('endDate')?.value,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE_TIME,
            minDate: useUpsert.getField('startDate')?.value,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: useUpsert.getField('status')?.options,
          },
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
          {
            fieldKey: 'capitalCity',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: useUpsert.isAddNew,
            options: _countryStore.capitalCities,
          },
          {
            fieldKey: 'securityThreatLevel',
            type: EDITOR_TYPES.THREAT_LEVEL,
            isEditable: false,
          },
        ],
      },
    ];
  };
  const cappsEditorControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControlClassName: classes?.cappsEditorBox,
        inputControls: [
          {
            fieldKey: 'cappsCountryName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsShortDescription',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsRegistryIdentifier',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cappsusSanction',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'cappsusSanctionType',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !cappsusSanction(),
          },
          {
            fieldKey: 'cappsTerritoryType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.cappsTerritoryTypes,
          },
        ],
      },
    ];
  };

  return (
    <>
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={fieldKey => useUpsert.getField(fieldKey)}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.isLoading}
        onValueChange={onValueChange}
        onFocus={onFocus}
        onSearch={onSearch}
      />
      <ViewInputControlsGroup
        groupInputControls={cappsEditorControls()}
        field={fieldKey => useUpsert.getField(fieldKey)}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.isLoading}
        onFocus={onFocus}
        onValueChange={onValueChange}
        classes={{ root: useUpsert.isAddNew ? classes.collapsibleWrap : '' }}
      />
      <AuditFields
        isEditable={useUpsert.isEditable}
        fieldControls={useUpsert.auditFields}
        onGetField={fieldKey => useUpsert.getField(fieldKey)}
        isNew={useUpsert.isAddNew}
      />
    </>
  );
};

export default inject('settingsStore', 'countryStore', 'regionStore')(observer(CountryEditorV2));
