import { CountryModel, RegionModel } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import MobxReactForm, { Field } from 'mobx-react-form';
import React, { FC, useEffect } from 'react';
import { ISelectOption, UIStore, Utilities } from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { CountryStore, SettingsStore } from '../../../Shared';
import { useStyles } from './CountryEditor.styles';
import { AuditFields, EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';
import CountryEditorSection from '../CountryEditorSection/CountryEditorSection';

interface Props {
  continentId: number;
  form: MobxReactForm;
  regions: RegionModel[];
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  countryModel: CountryModel;
  auditFields: IViewInputControl[];
  isEditable: boolean;
  ref?: any;
  isAddNew: boolean;
}

const CountryEditor: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _countryStore = props.countryStore as CountryStore;
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    return () => {
      _countryStore.clearCapitalCity();
    };
  }, []);

  /* istanbul ignore next */
  const sovereignCountries = (): CountryModel[] => {
    return _countryStore.countries.filter(country => !country.isTerritory);
  };

  const getField = (key: string): Field => {
    return props.form.$(key);
  };

  const continentId = (): number => {
    return Number(props.continentId);
  };

  /* istanbul ignore next */
  const filteredCountries = (): CountryModel[] => {
    return _countryStore.countries.filter((country: CountryModel) => country.id !== props.countryModel?.id);
  };

  /* istanbul ignore next */
  const isTerritoryDisabled = (): boolean => {
    if (!props.isAddNew) {
      return _countryStore.countries.some(
        ({ sovereignCountry }: CountryModel) => sovereignCountry?.id === props.countryModel?.id
      );
    }
    return false;
  };

  const cappsusSanction = (): boolean => {
    return getField('cappsusSanction').value;
  };

  const isTerritory = (): boolean => {
    return Boolean(getField('isTerritory').value);
  };

  /* istanbul ignore next */
  const isAlreadyExists = (fieldKey: string): boolean => {
    const { value } = getField(fieldKey);
    return value
      ? filteredCountries().some((country: CountryModel) => Utilities.isEqual(country[fieldKey], value))
      : false;
  };

  /* istanbul ignore next */
  const isIsoNumericCodeExists = (): boolean => {
    const { value } = getField('isoNumericCode');

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

  const onDropdownChange = (selectedOption: ISelectOption, fieldKey: string): void => {
    getField(fieldKey).$changed = true;
    let value;
    switch (fieldKey) {
      case 'commsPrefix':
        value = selectedOption?.value;
        break;
      default:
        value = selectedOption;
        break;
    }
    getField(fieldKey).set(value);
  };

  const onCheckboxChange = (checked: boolean, fieldKey: string): void => {
    getField(fieldKey).$changed = true;
    getField(fieldKey).set(checked);
    if (fieldKey === 'isTerritory') {
      setTerritoryRules(checked);
    }
    if (fieldKey === 'cappsusSanction' && !checked) {
      getField('cappsusSanctionType').set('');
    }
  };

  const searchCapitalCity = (searchValue?: string): void => {
    UIStore.setPageLoader(true);
    _countryStore
      .getCapitalCities(props.countryModel.id, searchValue)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const setTerritoryRules = (selected: boolean): void => {
    if (selected) {
      return;
    }
    getField('territoryType').set(null);
    getField('sovereignCountry').set(null);
  };

  return (
    <>
      <div className={classes.flexWrap}>
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('commonName')}
          isEditable={props.isEditable}
          isExists={isAlreadyExists('commonName')}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('officialName')}
          isEditable={props.isEditable}
          isExists={isAlreadyExists('officialName')}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('isO2Code')}
          isEditable={props.isEditable}
          styleClasses={classes.flexColumn}
          isDisabled={!props.isAddNew}
          isExists={isAlreadyExists('isO2Code')}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('isO3Code')}
          isEditable={props.isEditable}
          isExists={isAlreadyExists('isO3Code')}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('isoNumericCode')}
          isEditable={props.isEditable}
          isExists={isIsoNumericCodeExists()}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          options={props.regions}
          field={getField('geographicalRegion')}
          isEditable={props.isEditable}
          styleClasses={classes.flexColumn}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          options={_countryStore.continents}
          field={getField('continent')}
          isEditable={props.isEditable}
          isDisabled={Boolean(continentId())}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.TEXT_FIELD}
          field={getField('currencyCode')}
          isEditable={props.isEditable}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          options={getField('commsPrefix').options}
          field={getField('commsPrefix')}
          isEditable={props.isEditable}
          styleClasses={classes.flexColumn}
          dropDownValue={getField('commsPrefix')?.value}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.CHECKBOX}
          field={getField('isTerritory')}
          isEditable={props.isEditable}
          isDisabled={isTerritoryDisabled()}
          onCheckboxChange={(checked: boolean, fieldKey: string) => onCheckboxChange(checked, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          options={_settingsStore.territoryTypes}
          field={getField('territoryType')}
          isEditable={props.isEditable}
          isDisabled={!isTerritory()}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          options={sovereignCountries()}
          field={getField('sovereignCountry')}
          isEditable={props.isEditable}
          isDisabled={!isTerritory()}
          styleClasses={classes.flexColumn}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.CHECKBOX}
          field={getField('postalCodeFormat')}
          isEditable={props.isEditable}
          onCheckboxChange={(checked: boolean, fieldKey: string) => onCheckboxChange(checked, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DATE_TIME}
          field={getField('startDate')}
          isEditable={props.isEditable}
          maxDate={getField('endDate')?.value}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DATE_TIME}
          field={getField('endDate')}
          styleClasses={classes.flexColumn}
          isEditable={props.isEditable}
          minDate={getField('startDate')?.value}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          field={getField('status')}
          options={getField('status').options}
          isEditable={props.isEditable}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          field={getField('accessLevel')}
          options={_settingsStore.accessLevels}
          isEditable={props.isEditable}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        <CountryEditorSection
          type={EDITOR_TYPES.DROPDOWN}
          field={getField('sourceType')}
          options={_settingsStore.sourceTypes}
          isEditable={props.isEditable}
          styleClasses={classes.flexColumn}
          onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
        />
        {!props.isAddNew && (
          // TODO: Needs to update capitalCityId value later
          <CountryEditorSection
            type={EDITOR_TYPES.DROPDOWN}
            field={getField('capitalCity')}
            isEditable={props.isEditable}
            options={_countryStore.capitalCities}
            onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
            onSearch={(searchValue: string) => searchCapitalCity(searchValue)}
            debounceTime={1000}
          />
        )}
        <CountryEditorSection
          isEditable={false}
          type={EDITOR_TYPES.THREAT_LEVEL}
          field={getField('securityThreatLevel')}
          styleClasses={classes.flexColumn}
        />
      </div>
      <div className={classes.cappsEditorBox}>
        <div className={classes.flexWrap}>
          <div className={classes.flexRow}>
            <CountryEditorSection
              isEditable={props.isEditable}
              type={EDITOR_TYPES.TEXT_FIELD}
              field={getField('cappsCountryName')}
            />
            <CountryEditorSection
              isEditable={props.isEditable}
              type={EDITOR_TYPES.TEXT_FIELD}
              field={getField('cappsShortDescription')}
            />
            <CountryEditorSection
              isEditable={props.isEditable}
              type={EDITOR_TYPES.TEXT_FIELD}
              field={getField('cappsRegistryIdentifier')}
              styleClasses={classes.flexColumn}
            />
          </div>
          <div className={classes.flexRow}>
            <CountryEditorSection
              isEditable={props.isEditable}
              type={EDITOR_TYPES.CHECKBOX}
              field={getField('cappsusSanction')}
              onCheckboxChange={(checked: boolean, fieldKey: string) => onCheckboxChange(checked, fieldKey)}
            />
            <CountryEditorSection
              isEditable={props.isEditable}
              type={EDITOR_TYPES.TEXT_FIELD}
              field={getField('cappsusSanctionType')}
              isDisabled={!cappsusSanction()}
            />
            <CountryEditorSection
              type={EDITOR_TYPES.DROPDOWN}
              options={_settingsStore.cappsTerritoryTypes}
              field={getField('cappsTerritoryType')}
              isEditable={props.isEditable}
              styleClasses={classes.flexColumn}
              onDropdownChange={(option: ISelectOption, fieldKey: string) => onDropdownChange(option, fieldKey)}
            />
          </div>
        </div>
      </div>
      <AuditFields
        isEditable={props.isEditable}
        fieldControls={props.auditFields}
        onGetField={(fieldKey: string) => getField(fieldKey)}
        isNew={props.isAddNew}
      />
    </>
  );
};

export default inject('settingsStore', 'countryStore')(observer(CountryEditor));
