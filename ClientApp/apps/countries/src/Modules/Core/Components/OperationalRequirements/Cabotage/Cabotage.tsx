import {
  IOptionValue,
  ISelectOption,
  Utilities,
  tapWithAction,
  EntityMapModel,
  SettingsTypeModel,
  UIStore,
} from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { IUseUpsert, withFormFields, CabotageModel, BaseCountryStore, CountryModel, RegionModel } from '@wings/shared';
import React, { useState, FC, useEffect } from 'react';
import { cabotageFields } from '../fields';
import { CountryStore, SettingsStore } from '../../../../Shared';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../OperationalRequirements.styles';
import { OperationalRequirementStore } from '../../../../Shared/Stores/OperationalRequirement.store';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
interface Props {
  useUpsert: IUseUpsert;
  operationalRequirementStore?: OperationalRequirementStore;
  settingsStore?: SettingsStore;
  countryStore?: CountryStore;
}

const Cabotage: FC<Props> = observer(
  ({ useUpsert, operationalRequirementStore, settingsStore, countryStore }: Props) => {
    // eslint-disable-next-line max-len
    const [ exemptionAssociatedEntitiesOptions, setExemptionAssociatedEntitiesOptions ] = useState<EntityMapModel[]>([]);
    const [ farTypes, setFarTypes ] = useState<EntityMapModel[]>([]);
    const classes = useStyles();
    const baseCountryStore = new BaseCountryStore();
    const unsubscribe = useUnsubscribe();

    /* istanbul ignore next */
    useEffect(() => {
      loadInitialData();
      return () => {
        useUpsert.form.reset();
      };
    }, []);

    const loadInitialData = () => {
      const cabotage = countryStore?.selectedCountry?.cabotageOperationalRequirement;
      useUpsert.setFormValues(cabotage || new CabotageModel());
    };

    const onFocus = (fieldKey: string) => {
      if (Utilities.isEqual(fieldKey, 'cabotageEnforcedforFARTypes')) {
        useUpsert.observeSearch(
          settingsStore?.getFarTypes().pipe(
            tapWithAction(response => {
              const _farTypes = response.map(
                x =>
                  new EntityMapModel({
                    name: x.name,
                    code: x.cappsCode,
                    entityId: x.id,
                  })
              );
              setFarTypes(_farTypes);
            })
          )
        );
        return;
      }
      if (Utilities.isEqual(fieldKey, 'exemptionLevel')) {
        useUpsert.observeSearch(settingsStore?.getCabotageExemptionLevels());
        return;
      }
    };

    const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
      switch (fieldKey) {
        case 'exemptionLevel':
          setExemptionAssociatedEntitiesOptions([]);
          useUpsert.getField('cabotageAssociatedEntities').set([]);
          useUpsert.onValueChange(value, fieldKey);
          break;
        case 'isCabotageEnforced':
          if (!value) {
            useUpsert.setFormValues({ ...new CabotageModel(), isCabotageEnforced: value });
            return;
          }
          useUpsert.onValueChange(value, fieldKey);
          break;
        default:
          useUpsert.onValueChange(value, fieldKey);
      }
    };

    /* istanbul ignore next */
    const setCountryEntities = (countries: CountryModel[]) => {
      const _countries = countries?.map(
        x => new EntityMapModel({ name: x.commonName, entityId: x.countryId, code: x.isO2Code })
      );
      setExemptionAssociatedEntitiesOptions(_countries);
    };

    /* istanbul ignore next */
    const setRegionEntities = (regions: RegionModel[]) => {
      const _regions = regions.map(x => new EntityMapModel({ name: x.name, entityId: x.id }));
      setExemptionAssociatedEntitiesOptions(_regions);
    };

    const onSearch = (searchValue: string, fieldKey: string): void => {
      if (Utilities.isEqual(fieldKey, 'cabotageAssociatedEntities')) {
        const exemptionLevel = useUpsert.getField('exemptionLevel').value;
        UIStore.setPageLoader(true)
        if (Utilities.isEqual(exemptionLevel.label, 'country')) {
          baseCountryStore
            .searchCountries(searchValue)
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe(response => {
              setCountryEntities(response);
            });
          return;
        }
        
        baseCountryStore
          .searchRegions(searchValue)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => {
            setRegionEntities(response);
          });
        return;
      }
    };

    const groupInputControls = (): IGroupInputControls[] => [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'isCabotageEnforced',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'exemptionLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore?.cabotageExemptionLevels,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'cabotageAssociatedEntities',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: exemptionAssociatedEntitiesOptions,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value || !useUpsert.getField('exemptionLevel').value,
          },
          {
            fieldKey: 'isImportationFeesforDomesticFlight',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'cabotageEnforcedForFARTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: farTypes,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isCustomsStopsExempt',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isPaxMustDepartwithSameOperator',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isNoNewPaxAllowedtoDepart',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isCabotageAppliestoLivestock',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isCabotageAppliestoCargo',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
          },
          {
            fieldKey: 'isCabotageAppliestoNonResidents',
            type: EDITOR_TYPES.SELECT_CONTROL,
            containerClass: classes?.containerClass,
            isBoolean: true,
            isDisabled: !useUpsert.getField('isCabotageEnforced').value,
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
        onValueChange={onValueChange}
        onFocus={(fieldKey: string) => onFocus(fieldKey)}
        onSearch={onSearch}
      />
    );
  }
);

// eslint-disable-next-line max-len
export default withFormFields(
  inject('operationalRequirementStore', 'settingsStore', 'countryStore')(Cabotage),
  cabotageFields
);
